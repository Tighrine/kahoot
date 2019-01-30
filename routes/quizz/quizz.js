const express = require('express')
const router = express.Router()
const verifyToken = require('../utils')
const jwt = require('jsonwebtoken')
const config = require('../config')
const Quizz = require('../../models/Quizz')
const User = require('../../models/User')

router.post('/add', verifyToken, (req, res) => {
    console.log("Quizz: " + JSON.stringify(req.body.quizz))
    jwt.verify(req.token, config.secret, (err, authData) => {
        if (err) {
            console.log("If err " + err)
            res.sendStatus(403)
        }
        else {

            Quizz.create(req.body.quizz, (err, item) => {
                if (!err) {
                    console.log(`item_id: ${item._id} _id: ${req.body.uid}`)
                    User.findByIdAndUpdate({ _id: req.body.uid }, { $push: { createdQuizz: item } }, (err, user) => {
                        if (!err) {
                            console.log(`Quizz: ${user.createdQuizz}`)
                            res.json({
                                message: "Quizz created and updated in user 'createdQuizz'"
                            })
                        } else {
                            console.log(`Err: ${err}`)
                        }
                    })
                } else {
                    res.json({
                        message: err
                    })
                }
            })
        }
    })
})

router.get('/delete/:id', verifyToken, (req, res) => {

    jwt.verify(req.token, config.secret, (err, authData) => {
        if (err) {
            res.sendStatus(403)
        }
        else {
            Quizz.findByIdAndDelete({ _id: req.params.id }, (err, quizz) => {
                if (err) {
                    res.send(err)
                } else {
                    User.findByIdAndUpdate({ _id: quizz.user_admin },
                        { $pull: { createdQuizz: { $in: req.params.id } } }, (err, user) => {
                            if (!err) {
                                console.log(user.createdQuizz)
                                res.json({
                                    message: "successfully deleted the quizz",
                                    quizz
                                })
                            } else {
                                res.json({
                                    err
                                })
                            }
                        })
                }
            })
        }
    })
})

router.post('/update/:id', verifyToken, (req, res) => {
    console.log(JSON.stringify(req.body))
    jwt.verify(req.token, config.secret, (err, authData) => {
        if (err) {
            res.sendStatus(403)
        }
        else {
            Quizz.findById({ _id: req.params.id }, (err, quizz) => {
                if (err) {
                    res.send(err)
                } else {

                    quizz.title = req.body.title ? req.body.title : quizz.title;
                    quizz.description = req.body.description;
                    quizz.audience = req.body.audience;
                    quizz.questions = req.body.questions

                    console.log(quizz.questions)
                    
                    quizz.language = req.body.language;
                    quizz.credit_resources = req.body.credit_resources;
                    quizz.cover_image = req.body.cover_image;
                    quizz.save(err => {
                        if(err)
                            res.send(err)
                        res.json({
                            message: "successfully updated the quizz",
                            quizz
                        })
                    })
                }
            })
        }
    })
})

router.get('/view/:uid', (req, res) => {

    Quizz.find({ user_admin: req.params.uid }, (err, quizz) => {
        if (!err) {
            res.json({
                message: "Successfully found the quizz",
                quizz
            })
        } else {
            res.json({
                message: "Server error",
                err
            })
        }
    })

})

module.exports = router
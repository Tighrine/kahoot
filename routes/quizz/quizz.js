const express = require('express')
const router = express.Router()
const verifyToken = require('../utils')
const jwt = require('jsonwebtoken')
const config = require('../config')
const Quizz = require('../../models/Quizz')
const User = require('../../models/User')

//create a new quizz
router.post('/add', verifyToken, (req, res) => {

    jwt.verify(req.token, config.secret, (err, authData) => {
        if (err) {
            res.sendStatus(403)
        }
        else {

            Quizz.create(req.body.quizz, (err, item) => {
                if (!err) {
                    User.findByIdAndUpdate({ _id: req.body.uid }, { $push: { createdQuizz: item } }, (err, user) => {
                        if (!err) {
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

//delete aquizz
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

//update a quizz
router.post('/update/:id', verifyToken, (req, res) => {

    jwt.verify(req.token, config.secret, (err, authData) => {
        if (err) {
            res.sendStatus(403)
        }
        else {
            Quizz.findById({ _id: req.params.id }, (err, quizz) => {
                if (err) {
                    res.send(err)
                } else {

                    quizz.title = req.body.title ? req.body.title : quizz.title
                    quizz.description = req.body.description
                    quizz.audience = req.body.audience
                    quizz.questions = req.body.questions

                    console.log(quizz.questions)

                    quizz.language = req.body.language
                    quizz.credit_resources = req.body.credit_resources
                    quizz.cover_image = req.body.cover_image
                    quizz.participants = req.body.participants

                    quizz.save(err => {
                        if (err)
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

//display quizz of a user
router.get('/view/:uid', verifyToken, (req, res) => {

    jwt.verify(req.token, config.secret, (err, authData) => {
        if (!err)
            Quizz.find({ user_admin: req.params.uid }).populate({
                path: 'participants'
            }).exec((err, quizz) => {
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
        else    
            res.json({ 
                err
            })    
    })

})

//get all quizz from the db
router.get('/view', (req, res) => {

    Quizz.find({}, (err, quizz) => {
        if (!err)
            res.json({
                quizz
            })
        else
            res.json({
                err
            })
    })

})

//get all quizz from the db
router.get('/get/view/:qId', (req, res) => {

    Quizz.findById({_id: req.params.qId}, (err, quizz) => {
        if (!err)
            res.json({
                quizz
            })
        else
            res.json({
                err
            })
    })

})

//get quizz code
router.get('/pin/:qId', (req, res) => {
    //this line gives us a unique code
    const code = Math.random().toString(36).substr(2, 9)

    Quizz.findByIdAndUpdate({_id: req.params.qId}, {$set: {code}}, {new: true}, (err, quizz) => {
        res.json({
            pin: quizz.code
        })
    })
})

module.exports = router
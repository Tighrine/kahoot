const express = require('express')
const router  = express.Router()
const jwt     = require('jsonwebtoken')
const config  = require('../config')
const User    = require('../../models/User')
const passwordHash  = require('password-hash')

router.post('/signup', (req, res) => {
    
    User.findOne({ email: req.body.email }, (err, user) => {
        if (!err) {
            if (user !== null) {
                res.json({
                    message: "Email address is used"
                })
            }
            else {
                req.body.password = passwordHash.generate(req.body.password)
                User.create(req.body, (err, user) => {
                    if (!err) {
                        console.log(`Added use: ${user}`)
                        res.json({
                            message: "successfully added user",
                            user
                        })
                    } else
                        res.send(err)
                })
            }
        } else
            res.send(err)
    })
})

router.post('/login', (req, res) => {

    User.findOne({ username: req.body.username }, (err, user) => {
        if (!err) {
            if (user != null)
                if (passwordHash.verify(req.body.password, user.password)) {
                    jwt.sign({ id: user._id }, config.secret, (err, token) => {
                        res.json({
                            login: true,
                            sToken: token,
                            username: user.username,
                            email: user.email,
                            uid: user._id
                        })
                    })
                } else {
                    res.status(404).json({
                        message: "No user Found !"
                    })
                }
            else {
                res.status(500).json({
                    message: "Error on the server try later"
                })
            }    
        }
    })
})

/*router.post('/login', (req, res) => {

    User.findOne({ username: req.body.username }).populate('quizz').exec((err, user) => {
        if(!err) {
            console.log(`Populated: ${user}`)
            res.status(200).json({
                data: user
            })
        }else {
            res.sendStatus(500)
        }
    })
})*/

router.get('/logout', (req, res) => {
    res.status(200).send({ login: false, token: null });
})

router.post('/username', (req, res) => {
    User.findOne({username: req.body.username}, (err, user) => {
        if(!err){
            if(user != null){
                res.status(200).json({
                    message: "This username is taken, please try another"
                })
            }
            else {
                res.status(200).json({
                    message: "Ok"
                })
            }
        } else {
            res.sendStatus(500)
        }
    })
})

router.post('/email', (req, res) => {
    User.findOne({email: req.body.email}, (err, user) => {
        if(!err){
            if(user != null){
                res.status(200).json({
                    message: "This email is taken, please try another"
                })
            }
            else {
                res.status(200).json({
                    message: "Ok"
                })
            }
        } else {
            res.sendStatus(500)
        }
    })
})

module.exports = router

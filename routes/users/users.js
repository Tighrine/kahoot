const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const config = require('../config')
const User = require('../../models/User')
const bcrypt = require('bcryptjs')

router.post('/signup', (req, res) => {
    console.log(req.body)
    req.body.password = bcrypt.hashSync(req.body.password, 20)
    console.log(req.body.password)
    User.findOne({ email: req.body.email }, (err, user) => {
        if (!err) {
            if (user !== null) {
                res.json({
                    message: "Email address is used"
                })
            }
            else {
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
    const body = req.body
    console.log(req.session)
    User.findOne({ username: req.body.username }, (err, user) => {
        if (!err) {
            if (user != null)
                if (bcrypt.compareSync(req.body.password, user.password)) {
                    jwt.sign({ id: user._id }, config.secret, (err, token) => {
                        res.json({
                            auth:true,
                            sToken: token,
                            role: "user"
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

router.post('/logout', (req, res) => {
    res.status(200).send({ auth: false, token: null });
})

module.exports = router
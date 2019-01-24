const express = require('express')
const router = express.Router()
const verifyToken = require('../utils')
const jwt = require('jsonwebtoken')
const config = require('../config')
const Quizz = require('../../models/Quiz')

router.post('/add', verifyToken, (req, res) => {

    jwt.verify(req.token, config.secret, (err, authData) => {
        if (err)
            res.sendStatus(403)
        else
            res.json({
                message: "Post created...!",
                authData
            })
    })
})

module.exports = router
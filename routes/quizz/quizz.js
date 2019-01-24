const express = require('express')
const router = express.Router()
const verifyToken = require('../utils')
const jwt = require('jsonwebtoken')

const quizz = []

router.post('/add', verifyToken, (req, res) => {

    jwt.verify(req.token, 'secretkey', (err, authData) => {
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
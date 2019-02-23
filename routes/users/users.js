const express = require('express')
const router = express.Router()
const User = require('../../models/User')
const Quizz = require('../../models/Quizz')
const passwordHash = require('password-hash')
const verifyToken = require('../utils')
const confirm = require('../emails/confirmation')
const reset = require('../emails/resetPass')
const sendEmail = require('../emails/email')

//use to register a new user
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
                req.body.confirmed = false
                req.body.confirmCode = Math.floor(Number.MAX_SAFE_INTEGER * (2 * (Math.random() - 0.2)))

                User.create(req.body, (err, user) => {
                    if (!err) {
                        console.log(`Added use: ${user}`)

                        const confirmationLink = `http://${req.get('host')}/users/confirmation?uid=${user._id}&token=${user.confirmCode}`
                        const body = confirm(user.username, confirmationLink)
                        sendEmail(user.email, "Account confirmation", body)

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

//log a user
router.post('/login', (req, res) => {

    console.log(req.body)

    User.findOne({ username: req.body.username }, (err, user) => {
        if (!err) {
            if (user != null)
                if (passwordHash.verify(req.body.password, user.password)) {
                    jwt.sign({ id: user._id }, config.secret, (err, token) => {
                        res.json({
                            login: true,
                            accessToken: token,
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

//view all users
router.get('/view', verifyToken, (req, res) => {

        if (!err)
            User.find({}, (err, users) => {
                res.json({
                    users
                })
            })
        else
            res.json({
                err
            })
})

//use it to logout the user
router.get('/logout', verifyToken, (req, res) => {
        res.json({
            login: false,
            token: null
        });

})

//We'll use it to test if a given username exists befor 
router.post('/username', (req, res) => {

    User.findOne({ username: req.body.username }, (err, user) => {
        if (!err) {
            if (user != null) {
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

//We'll use it to test if a given email exists befor
router.post('/email', (req, res) => {
    User.findOne({ email: req.body.email }, (err, user) => {
        if (!err) {
            if (user != null) {
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

//reset password
router.post("/reset", verifyToken, (req, res) => {

    jwt.verify(req.token, config.secret, (err, authData) => {
        if (!err) {
            const email = req.body.email
            req.body.resetCode = Math.floor(Number.MAX_SAFE_INTEGER * (2 * (Math.random() - 0.2)))
            req.body.reset = false
            User.findOne({ email: email }, (err, user) => {
                if (!err) {
                    user.resetCode = req.body.resetCode
                    user.save((err, user) => {
                        if (!err) {
                            const resetLink = `http://${req.get('host')}/users/reset/${user._id}?token=${user.resetCode}`
                            const body = reset(user.username, resetLink)
                            sendEmail(user.email, "Reset your Password", body)
                        }
                    })
                } else {

                }
            })

        } else {
            res.send(err)
        }
    })
})

//add quizz to the to do quizz for the user
router.post("/todo/:uid", verifyToken, (req, res) => {
    console.log('In todo route')
    const accessToken = req.body.accessToken
    const uid = req.params.uid
    const qId = req.body.qId

    console.log(`uid: ${uid}`)

    User.findById({ _id: uid }, (err, user) => {
        if (!err) {
            let temp = user.quizzTodo

            console.log(`temp: ${temp}`)

            temp.push({ quizz: qId, score: 0 })

            console.log(`temp: ${temp}`)

            user.quizzTodo = temp

            user.save(err => {
                console.log(`In Save`)
                if (err) {

                    console.log(`error: ${err}`)
                    res.send(err)

                }

            })
        }
        else {
            console.log(err)
        }
    })

    console.log(`quizz added to user`)
    console.log(`qId: ${qId}`)

    Quizz.findById({ _id: qId }, (err, quizz) => {

        console.log(`In quizz`)

        if (!err) {

            console.log(`No err in quizz`)

            let temp = quizz.participants
            temp.push(uid)
            quizz.participants = temp

            quizz.save(err => {
                if (err)
                    res.send(err)
                else
                    res.json({
                        message: "Quizz added to todo list of the user & user added to participants list of the quizz"
                    })
            })
        } else {

            console.log(`err quizz: ${err.message}`)
        }
    })
})

//Account confirmation
router.get("/confirmation", (req, res) => {
    console.log(req.query)

    User.findOne({ _id: req.query.uid }, (err, user) => {
        if (!err) {
            if (user != null) {
                if (user.confirmCode == req.query.token) {
                    user.confirmed = true
                    user.save(err => {
                        if (!err) {
                            res.render("index", { name: user.username })
                        } else {
                            res.send("Try later ! SORRY :(")
                        }
                    })
                }
            } else {
                res.send("Seems that you don't exist in our database !")
            }
        } else {
            res.send("Server Error ! Retry later :)")
        }
    })
})

//calculate the player's score
router.post('/score/:uid', (req, res) => {

    Quizz.findOne({ _id: req.params.uid }, (err, quizz) => {
        if (!err) {
            console.log(JSON.stringify(quizz.questions[0].answers))

        }
        else {
            console.log(err)
        }
    })

    console.log('in score')
    res.sendStatus(200)

})

module.exports = router

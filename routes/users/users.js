const express = require('express')
const router = express.Router()
const User = require('../../models/User')
const Quizz = require('../../models/Quizz')
const passwordHash = require('password-hash')
const verifyToken = require('../utils')
const confirm = require('../emails/confirmation')
const reset = require('../emails/resetPass')
const sendEmail = require('../emails/email')
const jwt = require('jsonwebtoken')
const config = require('../config')

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

    User.findOne({ email: req.body.email }, (err, user) => {
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
                        message: "Password incorrect"
                    })
                }
            else {
                res.status(500).json({
                    message: "User not found"
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
router.post("/reset", (req, res) => {

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
                            res.render("confirmation", { name: user.username })
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

//Reset user password
router.post('/send/reset', (req, res) => {

    const email = req.body.email
    console.log(email)
    User.findOne({ email: email }, (err, user) => {
        if (!err) {
            if (user != null) {

                const resetCode = Math.floor(Number.MAX_SAFE_INTEGER * (2 * (Math.random() - 0.2)))
                const resetLink = `http://${req.get('host')}/users/reset?token=${resetCode}&user=${user.username}`
                const body = reset(user.username, resetLink)
                sendEmail(user.email, "Reset your Password", body)

                user.reset = false
                user.resetCode = resetCode

                user.save(err => {
                    if (!err) {
                        console.log("reset set to false")
                    } else {
                        console.log("Problem occured while saving user in /send/rest route")
                    }
                })

                res.status(200).json({
                    message: "Reset email sent"
                })

            } else {
                res.json({
                    message: "You don't exist in our database please signup first !"
                })
            }
        } else {
            res.json({
                message: "Internal server error"
            })
        }
    })
})

//render reset form
router.get('/reset', (req, res) => {
    const token = Number(req.query.token)
    const name = req.query.user

    //res.render("reset", { token })
    User.findOne({ username: name }, (err, user) => {
        if (!err) {
            console.log(user)
            console.log(typeof user.resetCode)
            console.log(`token: ${typeof token}`)
            if (token === user.resetCode)
                res.render("reset", { username: name, code: token })
            else
                res.send("you're not in our database")
        }
        else {
            res.send(err)
        }
    })
})

router.post('/reset/pwd', (req, res) => {
    const token = Number(req.query.token)
    const name = req.query.user
    const pwd = passwordHash.generate(req.body.pwd)

    User.findOne({ username: name }, (err, user) => {
        if (!err) {
            console.log(user)
            console.log(typeof user.resetCode)
            console.log(`token: ${typeof token}`)
            if (token === user.resetCode) {
                user.password = pwd
                user.save(err => {
                    if (!err)
                        res.render('pwdRes', { name })
                    else
                        res.send(err.message)
                })
            }
            else
                res.send("you're not in our database")
        }
        else {
            res.send(err)
        }
    })
})

//calculate the player's score
router.post('/score/:nickname', (req, res) => {

    const quizzCode = req.body.quizzCode
    const questionIndex = req.body.questionIndex
    const answerIndex = req.body.answerIndex
    const player = req.params.nickname

    console.log(`quizzCode: ${quizzCode}`)

    Quizz.findOne({ code: quizzCode }, (err, quizz) => {
        if (!err) {
            const participants = quizz.participants
            const answerQuizz = quizz.questions[questionIndex].answers[answerIndex]
            console.log(answerQuizz)
            if (answerQuizz.correct) {
                for(i = 0; i< participants.length; i++) {
                    if (player == participants[i].nickname) {
                        participants[i].score += 1
                        quizz.save(err => {
                            if (!err) {
                                res.status(200).json({
                                    player,
                                    //when you'll receive the score just add 1 to the current score in the front app
                                    score: 1
                                })
                            } else {
                                res.sendStatus(500)
                            }
                        })
                    }
                }
            } else {
                res.status(200).json({
                    player,
                    score: 0
                })
            }

        } else {
            console.log(err)
            res.send(500, "Internal server Error ! Sorry")
        }
    })

})

//Add a participant using quizz code and nickname
router.post("/add/participant", (req, res) => {
    const code = req.body.code
    const nickname = req.body.nickname

    Quizz.findOne({ code }, (err, quizz) => {
        if (!err) {
            const temp = quizz.participants
            console.log(`participants: ${temp}`)
            console.log(`quizz: ${quizz}`)
            if(temp.length > 0){
                for(i = 0; i < temp.length; i++){
                    if(temp[i].nickname == nickname){
                        var exist = true
                        break
                    }
                }
            }

            if (!exist) {

                temp.push({
                    nickname,
                    score: 0
                })

                quizz.participants = temp
                console.log(`participants: ${quizz.participants}`)
                quizz.save(err => {
                    if (!err)
                        res.status(200).send({
                            saved: true
                        })
                    else {
                        res.send(err.message)
                    }
                })
            }
            else {
                res.status(200).send({
                    saved: false,
                    cause: "nickname exists"
                })
            }
        }
        else {
            res.status(500).json({
                err
            })
        }
    })
})

module.exports = router
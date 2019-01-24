const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken')


const Users = [{
    username: "Aghiles",
    pwd: "Aghiles1994"
},{
    username: "Massi",
    pwd: "Massi1994"
},{
    username: "Samir",
    pwd: "Samir1991"
}]

router.post('/login', (req, res) => {
    const body = req.body
    const isUsername = Users.find(el => el.username === body.username)
    const isPwd = Users.find(el => el.pwd === body.pwd)

    console.log(isUsername['username'])

    if(isUsername && isPwd) {
        
        jwt.sign({user: body}, 'secretkey', (err, token) => {
            res.json({
                sToken: token,
                role: "user"
            })
        })
    } else {
        res.json({
            message: "user or password is incorrect !"
        })
    }
})

router.post('/logout', (req, res) => {
    res.json({
        message: "you're logged out :("
    })
})
router.post('/signup', (req, res) => {
    Users[1] = req.body
    console.log(Users[1])

    res.send("you're signed up")
})



module.exports = router;
const mailer = require('nodemailer')

var smtpTransport = mailer.createTransport({
    service: "Gmail",
    auth: {
        user: "svenken0@gmail.com",
        pass: "Aghiles1994"
    }
});

sendEmail = (t, s, b) => {
    
    var mail = {
        to: t,
        subject: s,
        html: b
    }

    smtpTransport.sendMail(mail, (err, info) => {
        if (!err) {
            console.log("mail sent seccessfully !")
            console.log(info)
        } else {
            console.log(`Email err: ${err}`)
        }

        smtpTransport.console()
    })
}

module.exports = sendEmail
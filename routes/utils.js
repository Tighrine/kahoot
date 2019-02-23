const config = require('./config')
const jwt = require('jsonwebtoken')

verifyToken = (req, res, next) => {
    // Get auth header value
    const bearerHeader = req.headers['authorization'];
    // Check if bearer is undefined
    if (typeof bearerHeader !== 'undefined') {
        // Split at the space
        const bearer = bearerHeader.split(' ');
        // Get token from array
        const bearerToken = bearer[1];
        // Set the token
        req.token = bearerToken;
        //Token verification
        jwt.verify(req.token, config.secret, (err, authData) => {
            if(err) 
                res.sendStatus(401).json({
                    message: "Vous n'etes pas autorisé"
                })
            
            next();    
        })
    } else {
        // Forbidden
        res.sendStatus(403);
    }

}

module.exports= verifyToken
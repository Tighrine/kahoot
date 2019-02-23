const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const User = new Schema({

    username: {
        type: String,
        lowercase: true,
		trim: true,
		unique: true,
		required: true
    },
    
    email: {
		type: String,
		lowercase: true,
		trim: true,
		unique: true,
		required: true
    },
    
	password: {
        type: String,
        required: true
    },

    roles: [String],

    confirmed: Boolean,

    confirmCode: Number,

    reset: Boolean,

    resetCode: Number,

    createdQuizz:[{
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Quizz'
    }],

    quizzTodo: [
        {
         quizz: {
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Quizz'
         },
         score: {
            type: Number,
            default: 0
         }
        }
    ]

});

module.exports = mongoose.model('User', User);
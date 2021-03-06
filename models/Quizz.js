const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Quizz = new Schema({

    title: {
        type: String,
        required: true
    },

    description: String,

    questions: [{

        content: {
            type: String,
            required: true
        },
        time_limit: {
            type: Number,
            required: true
        },
        media: String,
        answers: [{
            body: String,
            correct: Boolean
        }],
        credit_resources: String
        
    }],

    code: String,

    language: {
        type: String,
        required: true
    },

    audience: String,
    credit_resources: String,
    cover_image: String,

    user_admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    participants: [{
        nickname: String,
        score: Number,
    }]

});

module.exports = mongoose.model('Quizz', Quizz);

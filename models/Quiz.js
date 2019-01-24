const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Quizz = new Schema({
    title: {
		type: String,
		required: true
	},
    description: String,
    language: {
		type: String,
		required: true
	},
    audience : String,
    credit_resources : String,
    cover_image: String,
    user_admin : {
        type: mongoose.Schema.Types.ObjectId, ref: 'User',
        required : true
    },
    participants : [{
        user : {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
    }]
});

module.exports = mongoose.model('Quizz', Quizz);

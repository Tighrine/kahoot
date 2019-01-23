const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Questions = new Schema({
    title: {
		type: String,
		required: true
	},
    time_limit: {
		type: Number,
		required: true
	},
    media: String,
    answer1 : {
		type: String,
		required: true
	},
    answer2 : {
		type: String,
		required: true
	},
    answer3 : {
		type: String,
		required: false
	},
    answer4 : {
		type: String,
		required: false
	},
    credit_resources: String,
    quiz : {
        type: mongoose.Schema.Types.ObjectId, ref: 'Quiz',
        required: true
    }
});

module.exports = mongoose.model('Questions', Questions);
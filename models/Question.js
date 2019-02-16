const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Question = new Schema({
    title: {
		type: String,
		required: true
	},
    time_limit: {
		type: Number,
		required: true
	},
    media: String,
    answers : [{
		body: String,
		correct: Boolean
	}],
    credit_resources: String
});

module.exports = mongoose.model('Question', Question);
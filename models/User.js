const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Users = new Schema({
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
    quiz:[{
        quiz : {type: mongoose.Schema.Types.ObjectId, ref: 'Quiz'}
    }]
});

module.exports = mongoose.model('User', Users);
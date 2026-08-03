const mongoose = require('mongoose');

const TeamSchema = new mongoose.Schema({
    owner: {type: mongoose.Schema.Types.ObjectId, ref: 'Profile', required: true },
    name: {type: String, required: true, unique: true},
    logo: {type: String, required: false},
    disbanded: {type: Boolean, default: false},
}, {timestamps: true});

module.exports = mongoose.model('Team', TeamSchema);
const mongoose = require('mongoose');

const TeamMemberSchema = new mongoose.Schema({
    teamId: {type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
    memberId: {type: mongoose.Schema.Types.ObjectId, ref: 'Profile', required: true },
    role: {type: String, required: true, default: 'Player', enum: ['Captain', 'Player', 'Substitute']},
}, {timestamps: true});

module.exports = mongoose.model('TeamMember', TeamMemberSchema);

const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
    user: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        description: 'google auth user UID'
    },
    displayName: { type: String, required: true, trim: true },
    ign: { type: String, required: true, trim: true },
    discordUsername: { type: String, required: true, trim: true },
    pubgId: { type: String, required: true, trim: true },
    picture: { type: String, required: false, trim: true },
    country: { type: String, required: true, trim: true },
    banned: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Profile', ProfileSchema);
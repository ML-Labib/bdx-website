import mongoose from "mongoose";

const ProfileSchema = new mongoose.Schema({
    user: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        description: 'google auth user UID'
    },
    displayName: { type: String, required: true, trim: true, maxlength: [30, "Display name cannot exceed 50 characters"] },
    ign: { type: String, required: true, trim: true, maxlength: [50, "In-game name cannot exceed 50 characters"] },
    discordUsername: { type: String, required: true, trim: true, maxlength: [50, "Discord username cannot exceed 100 characters"] },
    pubgId: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        index: true,
    },
    picture: { type: String, required: false, trim: true },
    country: { type: String, required: true, trim: true, maxlength: [30, "Country name cannot exceed 50 characters"] },
    banned: { type: Boolean, default: false },
}, { timestamps: true });

ProfileSchema.virtual("membership", {
    ref: "TeamMember",
    localField: "_id",
    foreignField: "user",
    justOne: true,
});

// Include virtuals in JSON responses
ProfileSchema.set("toJSON", { virtuals: true });
ProfileSchema.set("toObject", { virtuals: true });

export const Profile = mongoose.model("Profile", ProfileSchema);
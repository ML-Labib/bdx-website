import mongoose from "mongoose";

const teamMemberSchema = new mongoose.Schema(
    {
        team: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Team",
            required: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Profile",
            required: true,
            unique: true,
        },
        role: {
            type: String,
            enum: ["owner", "captain", "player", "manager"],
            default: "player",
        },
    },
    { timestamps: true }
);

export const TeamMember = mongoose.model("TeamMember", teamMemberSchema);

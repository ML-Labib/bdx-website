import mongoose from "mongoose";
import { Profile } from "../models/Profile.js";
import { Team } from "../models/Team.js";
import { TeamMember } from "../models/TeamMembers.js";
import { Tournament } from "../models/Tournament.js";
import { TournamentRegistration } from "../models/TournamentRegistration.js";
import { TournamentRosterMember } from "../models/TournamentRosterMember.js";
import { sendNotification } from "../utils/notificationHelper.js";


// Register a team for a tournament
export const registerTeamForTournament = async (req, res) => {
    try {
        const { tournamentId } = req.params;
        const tournament = await Tournament.findById(tournamentId);
        if (!tournament) {
            return res.status(404).json({ error: "Tournament not found" });
        }
        const existingRegistration = await TournamentRegistration.findOne({ tournamentId, teamId: req.team._id });
        if (existingRegistration) {
            return res.status(400).json({ error: "Team is already registered for this tournament" });
        }

        const rosterMembers = await TeamMember.countDocuments({ team: req.team._id, role: { $ne: "manager" } });

        if (rosterMembers < 2) {
            return res.status(400).json({ error: "At least 4 roster members are required." });
        }

        const registration = new TournamentRegistration({ tournamentId: tournamentId, teamId: req.team._id });
        await registration.save();
        res.status(201).json(registration);
        await sendNotification(
            req.profile._id,
            `Your team's registration for ${tournament.title} Tournament is currently pending.`,
            "registration_pending",
            `tournament-info/${tournamentId}`
        );
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get all registrations for a tournament
export const getRegistrationsForTournament = async (req, res) => {
    try {
        const { tournamentId } = req.params;
        if (!tournamentId) {
            return res.status(400).json({ error: "Tournament ID is required" });
        }
        const registrations = await TournamentRegistration.find({ tournamentId }).populate('teamId', 'name logo teamTag country'); // Populate team name
        if (!registrations) {
            return res.status(404).json({ error: "No registrations found for this tournament" });
        }
        res.status(200).json(registrations);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

//get accpeted registrations for a tournament
export const getAcceptedRegistrationsForTournament = async (req, res) => {
    try {
        const { tournamentId } = req.params;
        if (!tournamentId) {
            return res.status(400).json({ error: "Tournament ID is required" });
        }

        const registrations = await TournamentRegistration.find({ tournamentId, status: 'APPROVED' }).populate('teamId', 'name logo teamTag country');
        if (!registrations) {
            return res.status(404).json({ error: "No accepted registrations found for this tournament" });
        }
        res.status(200).json(registrations);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Update registration status
export const updateRegistrationStatus = async (req, res) => {
    try {
        const { registrationId } = req.params;
        const { status, reason, title } = req.body;

        // 1. Validate status against schema ENUM
        const validStatuses = ["PENDING", "APPROVED", "REJECTED", "WITHDRAWN"];
        const normalizedStatus = status?.toUpperCase();

        if (!normalizedStatus || !validStatuses.includes(normalizedStatus)) {
            return res.status(400).json({
                error: `Invalid status. Must be one of: ${validStatuses.join(", ")}`
            });
        }

        // 2. Check registration existence
        const registration = await TournamentRegistration.findById(registrationId);
        if (!registration) {
            return res.status(404).json({ error: "Registration not found" });
        }

        // 3. Check if roster is locked using the schema's boolean property
        if (registration.rosterLocked) {
            return res.status(400).json({
                error: "Roster is currently locked. Unlock the roster first."
            });
        }

        // 4. Fetch admin profile (removed undefined session context)
        const adminProfile = await Profile.findOne({ user: req.user.uid });
        if (!adminProfile) {
            return res.status(404).json({ error: "Admin profile not found" });
        }

        // 5. Check team validity BEFORE updating registration state
        const team = await Team.findById(registration.teamId);
        if (!team || team.disbanded || team.banned) {
            return res.status(404).json({ error: "Team not found or is currently ineligible" });
        }

        // 6. Update registration properties
        registration.status = normalizedStatus;
        registration.reason = reason || null;
        await registration.save();

        // 7. Trigger notification
        const notificationMsg = `Your team's registration for ${title || "the"} Tournament has been ${normalizedStatus.toLowerCase()}.${reason ? ` Reason: ${reason}.` : ""}`;

        await sendNotification(
            team.owner,
            notificationMsg,
            normalizedStatus === "APPROVED" ? "registration_approved" : "registration_rejected",
            `tournament-info/${registration.tournamentId}`
        );

        return res.status(200).json(registration);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// Withdraw a team from a tournament
export const withdrawTeamFromTournament = async (req, res) => {
    try {
        const registration = await TournamentRegistration.findOneAndUpdate(
            {
                _id: req.registration._id,
                status: "PENDING"
            },
            {
                $set: {
                    status: "WITHDRAWN",
                    reason: req.body.reason || null
                }
            },
            {
                new: true
            }
        );

        if (!registration) {
            return res.status(400).json({
                error: "Only pending registrations can be withdrawn."
            });
        }

        await sendNotification(
            req.team._id,
            `You have successfully withdrawn your registration from ${req.tournament.title} Tournament.`,
            "registration_pending",
            `tournament-info/${req.tournament._id}`
        );

        return res.status(200).json(registration);

    } catch (error) {
        return res.status(500).json({
            error: error.message
        });
    }
};


// roster lock
// Roster Lock Controller with Session Transaction
export const lockRoster = async (req, res) => {
    const session = await mongoose.startSession();

    try {
        let result;

        await session.withTransaction(async () => {
            const { registrationId } = req.params;

            const registration = await TournamentRegistration.findById(registrationId).session(session);
            if (!registration) {
                return res.status(404).json({ error: "Registration not found" });
            }

            if (registration.status !== "APPROVED") {
                return res.status(400).json({ error: "Only approved registrations can lock roster" });
            }

            if (registration.rosterLocked) {
                return res.status(400).json({ error: "Roster is already locked" });
            }

            const rosterMembers = await TeamMember.find({ team: registration.teamId, role: { $ne: "manager" } }).populate("user", "pubgId ign").session(session);

            if (rosterMembers.length < 4) {
                return res.status(400).json({ error: "At least 4 roster members are required to lock the roster" });
            }

            const adminProfile = await Profile.findOne({ user: req.user.uid }).session(session);
            if (!adminProfile) {
                return res.status(404).json({ error: "Admin profile not found" });
            }

            const rosterVersion = (registration.rosterVersion || 0) + 1;

            const rosterDocuments = rosterMembers.map((member) => ({
                tournamentId: registration.tournamentId,
                teamId: registration.teamId,
                profileId: member.user._id || member.user.id,
                pubgId: member.user.pubgId,
                ign: member.user.ign,
                rosterVersion,
                rosterLockedBy: adminProfile._id
            }));

            await TournamentRosterMember.insertMany(rosterDocuments, { session });

            registration.rosterVersion = rosterVersion;
            registration.rosterLocked = true;
            registration.rosterLockedBy = adminProfile._id;

            await registration.save({ session });

            result = { rosterVersion };
        });

        return res.status(200).json({
            message: "Roster locked successfully",
            ...result
        });

    } catch (error) {
        return res.status(error.statusCode || 500).json({ error: error.message });
    } finally {
        await session.endSession();
    }
};

// Roster Unlock Controller with Session Transaction
export const unlockRoster = async (req, res) => {
    const session = await mongoose.startSession();

    try {
        await session.withTransaction(async () => {
            const { registrationId } = req.params;

            const registration = await TournamentRegistration.findById(registrationId).session(session);
            if (!registration) {
                return res.status(404).json({ error: "Registration not found" });
            }

            if (!registration.rosterLocked) {
                return res.status(400).json({ error: "Roster is not locked" });
            }

            registration.rosterLocked = false;
            registration.rosterLockedBy = null;
            await registration.save({ session });

        });

        return res.status(200).json({
            message: "Roster unlocked successfully"
        });

    } catch (error) {
        return res.status(error.statusCode || 500).json({ error: error.message });
    } finally {
        await session.endSession();
    }
};


//view locked roster for a registration
export const viewLockedRoster = async (req, res) => {
    try {
        const { registrationId, tournamentId } = req.params;

        const registration = await TournamentRegistration.findById(registrationId);
        if (!registration) {
            return res.status(404).json({ error: "Registration not found" });
        }

        if (!registration.rosterLocked) {
            return res.status(400).json({ error: "Roster is not locked" });
        }

        const roster = await TournamentRosterMember.find({
            tournamentId: registration.tournamentId,
            rosterVersion: registration.rosterVersion
        })
            .populate("profileId", "picture pubgId ign")
            .sort({ createdAt: 1 })
            .lean();

        return res.status(200).json({ roster });

    } catch (error) {
        return res.status(error.statusCode || 500).json({ error: error.message });
    }
};


//get user  teams Registrations for a tournament
export const getTeamsRegistrations = async (req, res) => {
    try {
        const { tournamentId, teamId } = req.params;

        const registration = await TournamentRegistration.findOne({ tournamentId, teamId });
        if (!registration) {
            return res.status(404).json({ error: "Registration not found" });
        }
        return res.status(200).json(registration);

    } catch (error) {
        return res.status(error.statusCode || 500).json({ error: error.message });
    }
};

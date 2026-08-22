const Tournament = require('../models/Tournament');

// Get upcoming tournaments
exports.getUpcomingTournaments = async (req, res) => {
	try {
		const now = new Date();
		const tournaments = await Tournament.find({ startDate: { $gte: now } }).sort({ startDate: 1 }).limit(10);

		res.status(200).json(tournaments);
	} catch (error) {
		res.status(500).json({ message: 'Failed to fetch upcoming tournaments', error: error.message });
	}
};

// Get tournaments with pagination
exports.getTournaments = async (req, res) => {
	try {
		const page = parseInt(req.query.page) || 1;
		const limit = parseInt(req.query.limit) || 10;
		const skip = (page - 1) * limit;

		const [tournaments, total] = await Promise.all([
			Tournament.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
			Tournament.countDocuments()
		]);

		res.status(200).json({
			tournaments,
			page,
			limit,
			total,
			totalPages: Math.ceil(total / limit)
		});
	} catch (error) {
		res.status(500).json({ message: 'Failed to fetch tournaments', error: error.message });
	}
};



// Get one tournament by id
exports.getTournamentById = async (req, res) => {
	try {
		const tournament = await Tournament.findById(req.params.id);

		if (!tournament) {
			return res.status(404).json({ message: 'Tournament not found' });
		}

		res.status(200).json(tournament);
	} catch (error) {
		res.status(500).json({ message: 'Failed to fetch tournament', error: error.message });
	}
};

// Create tournament
exports.createTournament = async (req, res) => {
	try {
		const tournament = new Tournament(req.body);
		const savedTournament = await tournament.save();
		res.status(201).json(savedTournament);
	} catch (error) {
		res.status(400).json({ message: 'Failed to create tournament', error: error.message });
	}
};

// Update tournament
exports.updateTournament = async (req, res) => {
	try {
		const updatedTournament = await Tournament.findByIdAndUpdate(
			req.params.id,
			req.body,
			{ new: true, runValidators: true }
		);

		if (!updatedTournament) {
			return res.status(404).json({ message: 'Tournament not found' });
		}

		res.status(200).json(updatedTournament);
	} catch (error) {
		res.status(400).json({ message: 'Failed to update tournament', error: error.message });
	}
};

// Delete tournament
exports.deleteTournament = async (req, res) => {
	try {
		const deletedTournament = await Tournament.findByIdAndDelete(req.params.id);

		if (!deletedTournament) {
			return res.status(404).json({ message: 'Tournament not found' });
		}

		res.status(200).json({ message: 'Tournament deleted successfully' });
	} catch (error) {
		res.status(500).json({ message: 'Failed to delete tournament', error: error.message });
	}
};

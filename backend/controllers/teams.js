const supabase = require('../config/db');
const teamSchema = require('../schemas/teamSchema');
const { validateData } = require('../utils/validation');

/**
 * Get all teams
 */
const getTeams = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch teams', details: error.message });
  }
};

/**
 * Get team by ID
 */
const getTeamById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Team not found' });
      }
      return res.status(400).json({ error: error.message });
    }

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch team', details: error.message });
  }
};

/**
 * Get teams by creator
 */
const getTeamsByCreator = async (req, res) => {
  try {
    const { creatorId } = req.params;

    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .eq('creator_id', creatorId)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch teams', details: error.message });
  }
};

/**
 * Create a new team
 */
const createTeam = async (req, res) => {
  try {
    const { name, logo, region, description, creator_id } = req.body;

    // Validate input data
    const validation = validateData(req.body, teamSchema);
    if (!validation.isValid) {
      return res.status(400).json({ error: 'Validation failed', details: validation.errors });
    }

    const { data, error } = await supabase
      .from('teams')
      .insert([
        {
          name,
          logo,
          region,
          description,
          creator_id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json(data[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create team', details: error.message });
  }
};

/**
 * Update a team
 */
const updateTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, logo, region, description } = req.body;

    // Create update object with only provided fields
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (logo !== undefined) updateData.logo = logo;
    if (region !== undefined) updateData.region = region;
    if (description !== undefined) updateData.description = description;
    updateData.updated_at = new Date().toISOString();

    // Validate update data against schema (only for provided fields)
    const schemaSubset = {};
    for (const [key, value] of Object.entries(teamSchema)) {
      if (key in updateData && key !== 'updated_at') {
        schemaSubset[key] = value;
      }
    }
    schemaSubset['updated_at'] = teamSchema['updated_at'];

    const validation = validateData(updateData, schemaSubset);
    if (!validation.isValid) {
      return res.status(400).json({ error: 'Validation failed', details: validation.errors });
    }

    const { data, error } = await supabase
      .from('teams')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Team not found' });
    }

    res.status(200).json(data[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update team', details: error.message });
  }
};

/**
 * Delete a team
 */
const deleteTeam = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('teams')
      .delete()
      .eq('id', id)
      .select();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Team not found' });
    }

    res.status(200).json({ message: 'Team deleted successfully', team: data[0] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete team', details: error.message });
  }
};

module.exports = {
  getTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam,
  getTeamsByCreator,
};

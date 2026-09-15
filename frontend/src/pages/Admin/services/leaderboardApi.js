const API_BASE = "/api/tournaments";


/* =========================================================
   TOURNAMENTS
========================================================= */

export const fetchTournaments = async (headers) => {
    const res = await fetch("/api/tournaments", {
        headers,
    });

    if (!res.ok) {
        throw new Error("Failed to fetch tournaments.");
    }

    const data = await res.json();

    // Supports either:
    // [ ... ]
    // or { tournaments: [...] }

    return Array.isArray(data)
        ? data
        : data.tournaments || [];
};


/* =========================================================
   STAGES
========================================================= */

export const fetchStages = async (
    tournamentId,
    headers
) => {
    const res = await fetch(
        `${API_BASE}/${tournamentId}/stages`,
        {
            headers,
        }
    );

    if (!res.ok) {
        throw new Error("Failed to fetch stages.");
    }

    const data = await res.json();

    return Array.isArray(data)
        ? data
        : data.stages || [];
};


export const createStage = async (
    tournamentId,
    stageData,
    headers
) => {
    const res = await fetch(
        `${API_BASE}/${tournamentId}/stages`,
        {
            method: "POST",
            headers,
            body: JSON.stringify(stageData),
        }
    );

    if (!res.ok) {
        const data = await res.json().catch(() => null);

        throw new Error(
            data?.message ||
            data?.error ||
            "Failed to create stage."
        );
    }

    return res.json();
};


/* =========================================================
   GROUPS
========================================================= */

export const fetchGroups = async (
    tournamentId,
    stageId,
    headers
) => {
    const res = await fetch(
        `${API_BASE}/${tournamentId}/stages/${stageId}/groups`,
        {
            headers,
        }
    );

    if (!res.ok) {
        throw new Error("Failed to fetch groups.");
    }

    const data = await res.json();

    return Array.isArray(data)
        ? data
        : data.groups || [];
};


export const createGroup = async (
    tournamentId,
    stageId,
    groupData,
    headers
) => {
    const res = await fetch(
        `${API_BASE}/${tournamentId}/stages/${stageId}/groups`,
        {
            method: "POST",
            headers,
            body: JSON.stringify(groupData),
        }
    );

    if (!res.ok) {
        const data = await res.json().catch(() => null);

        throw new Error(
            data?.message ||
            data?.error ||
            "Failed to create group."
        );
    }

    return res.json();
};


/* =========================================================
   PARTICIPANTS
========================================================= */

export const fetchParticipants = async ({
    tournamentId,
    stageId,
    groupId,
    headers,
}) => {
    const params = new URLSearchParams();

    if (stageId) {
        params.append("stageId", stageId);
    }

    if (groupId) {
        params.append("groupId", groupId);
    }

    const res = await fetch(
        `${API_BASE}/${tournamentId}/participants?${params}`,
        {
            headers,
        }
    );

    if (!res.ok) {
        throw new Error(
            "Failed to fetch participants."
        );
    }

    const data = await res.json();

    return Array.isArray(data)
        ? data
        : data.participants || [];
};


export const addParticipant = async (
    participantData,
    headers
) => {
    const res = await fetch(
        `${API_BASE}/${participantData.tournamentId}/participants`,
        {
            method: "POST",
            headers,
            body: JSON.stringify(participantData),
        }
    );

    if (!res.ok) {
        const data = await res.json().catch(() => null);

        throw new Error(
            data?.message ||
            data?.error ||
            "Failed to add team."
        );
    }

    return res.json();
};


/* =========================================================
   MATCHES
========================================================= */

export const fetchMatches = async ({
    tournamentId,
    stageId,
    groupId,
    headers,
}) => {
    const params = new URLSearchParams();

    if (stageId) {
        params.append("stageId", stageId);
    }

    if (groupId) {
        params.append("groupId", groupId);
    }

    const res = await fetch(
        `${API_BASE}/${tournamentId}/matches?${params}`,
        {
            headers,
        }
    );

    if (!res.ok) {
        throw new Error("Failed to fetch matches.");
    }

    const data = await res.json();

    return Array.isArray(data)
        ? data
        : data.matches || [];
};


export const createMatch = async (
    matchData,
    headers
) => {
    const res = await fetch(
        `${API_BASE}/${matchData.tournamentId}/matches`,
        {
            method: "POST",
            headers,
            body: JSON.stringify(matchData),
        }
    );

    if (!res.ok) {
        const data = await res.json().catch(() => null);

        throw new Error(
            data?.message ||
            data?.error ||
            "Failed to create match."
        );
    }

    return res.json();
};


/* =========================================================
   PUBG MATCH PREVIEW
========================================================= */

export const previewMatchData = async (
    matchId,
    headers
) => {
    const res = await fetch(
        `${API_BASE}/matches/${matchId}/preview`,
        {
            method: "POST",
            headers,
        }
    );

    if (!res.ok) {
        const data = await res.json().catch(() => null);

        throw new Error(
            data?.message ||
            data?.error ||
            "Failed to preview PUBG match data."
        );
    }

    return res.json();
};


/* =========================================================
   SAVE RESULTS
========================================================= */

export const saveMatchResults = async (
    matchId,
    resultData,
    headers
) => {
    const res = await fetch(
        `${API_BASE}/matches/${matchId}/results`,
        {
            method: "POST",
            headers,
            body: JSON.stringify(resultData),
        }
    );

    if (!res.ok) {
        const data = await res.json().catch(() => null);

        throw new Error(
            data?.message ||
            data?.error ||
            "Failed to save match results."
        );
    }

    return res.json();
};
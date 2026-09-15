import 'dotenv/config';

const getPubgHeaders = () => ({
    "Authorization": `Bearer ${process.env.PUBG_API_KEY}`,
    "Accept": "application/vnd.api+json"
});


const DEFATULT_POINT_SYSTEM_CONFIG = {
    1: 10,
    2: 6,
    3: 5,
    4: 4,
    5: 3,
    6: 2,
    7: 1,
    8: 1
};

const MAP_NAME = {
    "Baltic_Main": "Erangel",
    "Chimera_Main": "Paramo",
    "Desert_Main": "Miramar",
    "DihorOtok_Main": "Vikendi",
    "Heaven_Main": "Haven",
    "Kiki_Main": "Deston",
    "Savage_Main": "Sanhok",
    "Summerland_Main": "Karakin",
    "Tiger_Main": "Taego",
    "Neon_Main": "Rondo"
}


export const fetchPubgPlayerData = async (playerData, matchIndex = 0) => {

    try {
        const normalizedData = {
            id: playerData.data[0].id,
            name: playerData.data[0].attributes.name,
            match: playerData.data[0].relationships.matches.data[matchIndex].id
        }
        return normalizedData;

    } catch (error) {
        console.error("Error fetching PUBG player data:", error);
        return null;
    }
};


export const normalizePlayerData = (playerData, matchIndex) => {
    const normalizedData = {
        id: playerData.data[0].id,
        name: playerData.data[0].attributes.name,
        matchId: playerData.data[0].relationships.matches.data[matchIndex].id,
        alreadyExists: null
    };
    return normalizedData;
};

export const normalizeMatchData = (matchData) => {
    const participantsMap = new Map();

    matchData.included.forEach(item => {
        if (item.type === "participant") {
            participantsMap.set(item.id, item.attributes?.stats);
        }
    });

    const matchInfo = {
        matchId: matchData.data.id,
        gameMode: matchData.data.attributes?.gameMode || "",
        mapName: MAP_NAME[matchData.data.attributes?.mapName] || "",
    }

    const teams = [];
    const players = [];

    matchData.included.forEach(item => {
        if (item.type === "roster") {
            const teamId = item.attributes?.stats.teamId;
            const rank = item.attributes?.stats?.rank;
            const wwdc = (item.attributes?.won == "true") ? 1 : 0;
            const placementPoints = DEFATULT_POINT_SYSTEM_CONFIG[rank] || 0;

            const rosterParticipants = item.relationships?.participants?.data || [];
            const combineParticipantsStats = {
                lobbyNumber: teamId,
                placement: rank,
                wwdc: wwdc,
                placementPoints: placementPoints,
                totalPoints: placementPoints,
                assists: 0,
                kills: 0,
                damageDealt: 0,
                headshotKills: 0,
                longestKill: 0,
                distanceMoved: 0,
                timeSurvived: 0,

            };

            rosterParticipants.forEach(participant => {
                const participantStats = participantsMap.get(participant.id);

                const normalizedPlayer = {
                    lobbyNumber: teamId,
                    pubgId: participantStats?.playerId || "",
                    ign: participantStats?.name || "",
                    kills: participantStats?.kills || 0,
                    headshotKills: participantStats?.headshotKills || 0,
                    assists: participantStats?.assists || 0,
                    longestKill: participantStats?.longestKill || 0,
                    damageDealt: participantStats?.damageDealt || 0,
                    distanceMoved: (participantStats?.rideDistance + participantStats?.swimDistance + participantStats?.walkDistance) || 0,
                    timeSurvived: participantStats?.timeSurvived || 0
                };
                players.push(normalizedPlayer);
                if (participantStats) {
                    combineParticipantsStats.assists += participantStats.assists || 0;
                    combineParticipantsStats.kills += participantStats.kills || 0;
                    combineParticipantsStats.longestKill = Math.max(combineParticipantsStats.longestKill, participantStats.longestKill || 0);
                    combineParticipantsStats.distanceMoved += (participantStats.rideDistance + participantStats.swimDistance + participantStats.walkDistance) || 0;
                    combineParticipantsStats.timeSurvived += participantStats.timeSurvived || 0;
                    combineParticipantsStats.totalPoints += participantStats.kills || 0;
                    combineParticipantsStats.damageDealt += participantStats.damageDealt || 0;
                    combineParticipantsStats.headshotKills += participantStats.headshotKills || 0;
                }
            });

            teams.push(combineParticipantsStats);
        }
    });

    return {
        ...matchInfo,
        pubgMatchId: matchInfo.matchId,
        teamResults: teams.sort((a, b) => a.placement - b.placement),
        playerResults: players,
    };
};

// const matchPointSystemConfig = {
//     1: 10,
//     2: 6,
//     3: 5,
//     4: 4,
//     5: 3,
//     6: 2,
//     7: 1,
//     8: 1
// }
// const matchData = await readJson('raw_match_2.json');
// // console.log(`Raw match info:`, matchData);
// const normalizedMatchData = normalizeMatchData(matchData, matchPointSystemConfig);
// // console.log(`Normalized match info:`, normalizedMatchData.players.sort((a, b) => a.kills - b.kills).reverse());
// console.log(`Normalized match info:`, normalizedMatchData.teams.sort((a, b) => a.totalPoints - b.totalPoints).reverse());
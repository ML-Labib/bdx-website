import { useState } from "react";
import "./MatchManagement.css";

export const MatchManagement = ({
    matches,
    selectedGroup,
    onCreateMatch,
    onPreviewMatch,
}) => {
    const [lookupByMatch, setLookupByMatch] = useState({});

    const updateLookup = (matchId, field, value) => {
        setLookupByMatch((previous) => ({
            ...previous,
            [matchId]: { ...previous[matchId], [field]: value },
        }));
    };

    return (
        <section className="match-management">

            <div className="section-toolbar match-toolbar">

                <div>
                    <h3>
                        {selectedGroup.name} — Matches
                    </h3>

                    <p>
                        Schedule matches and import PUBG
                        match data after each game.
                    </p>
                </div>

                <button
                    className="primary-button"
                    onClick={onCreateMatch}
                >
                    <span className="material-symbols-outlined">
                        add
                    </span>

                    Create Match
                </button>

            </div>

            {matches.length === 0 ? (
                <div className="empty-table-state">

                    <span className="material-symbols-outlined">
                        sports_esports
                    </span>

                    <h3>
                        No Matches Scheduled
                    </h3>

                    <p>
                        Create the first match for this group.
                    </p>

                    <button
                        className="primary-button"
                        onClick={onCreateMatch}
                    >
                        <span className="material-symbols-outlined">
                            add
                        </span>

                        Create Match
                    </button>

                </div>
            ) : (
                <div className="match-list">

                    {matches.map((match) => (
                        <div
                            className="match-card"
                            key={match._id}
                        >

                            <div className="match-number">
                                <span>
                                    MATCH
                                </span>

                                <strong>
                                    {match.matchNumber}
                                </strong>
                            </div>

                            <div className="match-info">

                                <h4>
                                    Match {match.matchNumber}
                                </h4>

                                <div className="match-meta">

                                    <span>
                                        <span className="material-symbols-outlined">
                                            schedule
                                        </span>

                                        {match.mapName} · {match.gameMode}
                                    </span>

                                    {match.pubgMatchId && (
                                        <span>
                                            PUBG:
                                            {" "}
                                            {match.pubgMatchId}
                                        </span>
                                    )}

                                </div>

                            </div>

                            <div>
                                <span
                                    className={`match-status ${
                                        match.status?.toLowerCase()
                                    }`}
                                >
                                    {match.status}
                                </span>
                            </div>

                            <div className="match-actions">

                                <input
                                    type="text"
                                    placeholder="Host IGN"
                                    value={lookupByMatch[match._id]?.hostIgn || ""}
                                    onChange={(event) => updateLookup(match._id, "hostIgn", event.target.value)}
                                />

                                <input
                                    type="number"
                                    min="0"
                                    placeholder="Index"
                                    value={lookupByMatch[match._id]?.index ?? 0}
                                    onChange={(event) => updateLookup(match._id, "index", Number(event.target.value))}
                                />

                                {match.status ===
                                    "COMPLETED" ? (
                                    <button
                                        className="match-action-button"
                                        onClick={() => onPreviewMatch(match, lookupByMatch[match._id])}
                                        disabled={!lookupByMatch[match._id]?.hostIgn?.trim()}
                                    >
                                        <span className="material-symbols-outlined">
                                            visibility
                                        </span>

                                        View Results
                                    </button>
                                ) : (
                                    <button
                                        className="match-action-button primary"
                                        onClick={() => onPreviewMatch(match, lookupByMatch[match._id])}
                                        disabled={!lookupByMatch[match._id]?.hostIgn?.trim()}
                                    >
                                        <span className="material-symbols-outlined">
                                            download
                                        </span>

                                        Preview PUBG Data
                                    </button>
                                )}

                            </div>

                        </div>
                    ))}

                </div>
            )}

        </section>
    );
};


const formatDateTime = (date) => {
    if (!date) return "Not scheduled";

    return new Date(date).toLocaleString(
        "en-GB",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }
    );
};


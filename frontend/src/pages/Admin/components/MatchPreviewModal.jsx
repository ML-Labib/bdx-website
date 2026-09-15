import "./MatchPreviewModal.css";

export const MatchPreviewModal = ({
    match,
    data,
    loading,
    error,
    saving = false, // <-- Set default value
    onClose,
    onSave,
}) => {
    // Safe string handling to prevent runtime crashes if gameMode is null/undefined
    const expectedGameMode = match?.gameMode?.toString().trim().toLowerCase();
    const previewGameMode = data?.gameMode?.toString().trim().toLowerCase();
    
    const gameModeMismatch = Boolean(
        expectedGameMode &&
        previewGameMode &&
        expectedGameMode !== previewGameMode
    );

    const handleSave = () => {
        if (!saving && onSave) {
            onSave(data);
        }
    };

    return (
        <div className="modal-overlay preview-overlay">
            <div className="preview-modal">

                {/* HEADER */}
                <div className="preview-header">
                    <div>
                        <span className="preview-label">PUBG DATA PREVIEW</span>
                        <h2>Match #{match?.matchNumber}</h2>
                        {match?.pubgMatchId && (
                            <p>PUBG Match ID: {match.pubgMatchId}</p>
                        )}
                    </div>
                    <button onClick={onClose} disabled={saving}>&times;</button>
                </div>
                {error && (
                    <div className="preview-error" role="alert">
                        <span className="material-symbols-outlined">error</span>
                        <p>{error}</p>
                    </div>
                )}
                {/* BODY */}
                <div className="preview-body">
                    {loading ? (
                        <div className="preview-loading">
                            <span className="material-symbols-outlined spinning">sync</span>
                            <h3>Fetching PUBG Match Data</h3>
                            <p>Normalizing match statistics...</p>
                        </div>
                    ) 
                    // : error ? (
                    //     <div className="preview-loading" role="alert">
                    //         <span className="material-symbols-outlined">error</span>
                    //         <h3>Unable to load PUBG match data</h3>
                    //         <p>{error}</p>
                    //     </div>
                    // )
                    : !data ? (
                        <div className="preview-loading">
                            <span className="material-symbols-outlined">error</span>
                            <h3>No Match Data</h3>
                        </div>
                    ) : (
                        <>
                            {/* MATCH INFO */}
                            <div className="preview-info-grid">
                                <div>
                                    <span>MATCH</span>
                                    <strong>#{match?.matchNumber}</strong>
                                </div>
                                <div>
                                    <span>MAP</span>
                                    <strong>{data.mapName || "Unknown"}</strong>
                                </div>
                                <div>
                                    <span>MATCH ID</span>
                                    <strong>{data.pubgMatchId}</strong>
                                </div>
                                <div>
                                    <span>STATUS</span>
                                    <strong className="verified-status">Preview</strong>
                                </div>
                            </div>

                            {/* TEAM RESULTS */}
                            <div className="preview-section">
                                <div className="preview-section-header">
                                    <div>
                                        <h3>Team Results</h3>
                                        <p>Verify placement, kills and points.</p>
                                    </div>
                                    <span>{data.teamResults?.length || 0} Teams</span>
                                </div>

                                <div className="preview-table-wrapper">
                                    <table className="preview-table">
                                        <thead>
                                            <tr>
                                                <th>RANK</th>
                                                <th>TEAM</th>
                                                <th>KILLS</th>
                                                <th>PLACEMENT POINTS</th>
                                                <th>TOTAL</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {data.teamResults?.map((result, index) => (
                                                <tr key={result.teamId || index}>
                                                    <td>
                                                        <span className="preview-position">
                                                            {result.placement}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <strong>
                                                            {result.teamName || `Lobby ${result.lobbyNumber}`}
                                                        </strong>
                                                    </td>
                                                    <td><strong>{result.kills ?? 0}</strong></td>
                                                    <td><strong>{result.placementPoints ?? 0}</strong></td>
                                                    <td>
                                                        <strong className="total-points">
                                                            {result.totalPoints ?? 0}
                                                        </strong>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* PLAYER RESULTS */}
                            <div className="preview-section">
                                <div className="preview-section-header">
                                    <div>
                                        <h3>Player Results</h3>
                                        <p>Normalized PUBG player statistics.</p>
                                    </div>
                                    <span>{data.playerResults?.length || 0} Players</span>
                                </div>

                                <div className="preview-table-wrapper">
                                    <table className="preview-table">
                                        <thead>
                                            <tr>
                                                <th>PLAYER</th>
                                                <th>TEAM</th>
                                                <th>KILLS</th>
                                                <th>HS</th>
                                                <th>DAMAGE</th>
                                                <th>ASSISTS</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {data.playerResults?.map((player, index) => (
                                                <tr key={player.pubgId || index}>
                                                    <td>
                                                        <strong>{player.ign}</strong>
                                                        <small>{player.pubgId}</small>
                                                    </td>
                                                    <td>{player.teamName}</td>
                                                    <td>{player.kills ?? 0}</td>
                                                    <td>{player.headshotKills ?? 0}</td>
                                                    <td>{player.damageDealt ?? 0}</td>
                                                    <td>{player.assists ?? 0}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* FOOTER */}
                {!loading && data && (
                    <div className="preview-footer">
                        <div className="preview-warning">
                            <span className="material-symbols-outlined">warning</span>
                            {gameModeMismatch ? (
                                <>
                                    Match game mode mismatch: scheduled{" "}
                                    <strong>{match?.gameMode}</strong>, PUBG preview{" "}
                                    <strong>{data?.gameMode}</strong>. Verify this is the correct match before saving.
                                </>
                            ) : (
                                "Verify all match data before saving. Saved results will be used for leaderboard calculations."
                            )}
                        </div>

                        <div className="preview-footer-actions">
                            <button
                                className="modal-cancel"
                                onClick={onClose}
                                disabled={saving}
                            >
                                Cancel
                            </button>

                            <button
                                className="modal-submit"
                                onClick={handleSave}
                                disabled={saving}
                            >
                                {saving ? (
                                    <>
                                        <span className="material-symbols-outlined spinning">sync</span>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined">save</span>
                                        Save Match Results
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
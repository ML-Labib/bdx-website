import "./StageSidebar.css";

export const StageSidebar = ({
    tournaments,
    selectedTournament,
    onTournamentChange,
    stages,
    selectedStage,
    onStageChange,
    onCreateStage,
    onEditStage,
    loading,
}) => {
    return (
        <aside className="leaderboard-sidebar">

            <div className="sidebar-section-title">
                <span>
                    TOURNAMENTS
                </span>

                <strong>
                    {tournaments.length}
                </strong>
            </div>

            <div className="tournament-list">

                {loading && tournaments.length === 0 ? (
                    <div className="sidebar-loading">
                        Loading...
                    </div>
                ) : (
                    tournaments.map((tournament) => (
                        <button
                            key={tournament._id}
                            className={`tournament-item ${
                                selectedTournament?._id ===
                                tournament._id
                                    ? "active"
                                    : ""
                            }`}
                            onClick={() =>
                                onTournamentChange(
                                    tournament
                                )
                            }
                        >
                            <div className="tournament-item-logo">

                                {tournament.logo ? (
                                    <img
                                        src={tournament.logo}
                                        alt=""
                                    />
                                ) : (
                                    <span className="material-symbols-outlined">
                                        emoji_events
                                    </span>
                                )}

                            </div>

                            <div className="tournament-item-info">

                                <strong>
                                    {tournament.title}
                                </strong>

                                <small>
                                    {formatDate(
                                        tournament.startDate
                                    )}
                                </small>

                                <div className="tournament-tags">

                                    {tournament.format && (
                                        <span>
                                            {tournament.format}
                                        </span>
                                    )}

                                    {tournament.mode && (
                                        <span>
                                            {tournament.mode}
                                        </span>
                                    )}

                                    {tournament.tier && (
                                        <span>
                                            Tier {tournament.tier}
                                        </span>
                                    )}

                                </div>

                            </div>

                            <span className="material-symbols-outlined tournament-arrow">
                                chevron_right
                            </span>

                        </button>
                    ))
                )}

            </div>

            {selectedTournament && (
                <>
                    <div className="sidebar-divider"></div>

                    <div className="stage-sidebar-heading">

                        <span>
                            STAGES
                        </span>

                        <button
                            onClick={onCreateStage}
                            title="Create Stage"
                        >
                            <span className="material-symbols-outlined">
                                add
                            </span>
                        </button>

                    </div>

                    <div className="stage-list">

                        {stages.length === 0 ? (
                            <div className="no-stages">
                                No stages yet.
                            </div>
                        ) : (
                            stages.map((stage, index) => (
                                <button
                                    key={stage._id}
                                    className={`stage-item ${
                                        selectedStage?._id ===
                                        stage._id
                                            ? "active"
                                            : ""
                                    }`}
                                    onClick={() =>
                                        onStageChange(stage)
                                    }
                                >
                                    <span className="stage-number">
                                        {index + 1}
                                    </span>

                                    <span className="stage-name">
                                        {stage.name}
                                    </span>

                                    <span className="stage-item-actions">
                                        <span
                                            className="material-symbols-outlined stage-edit-button"
                                            role="button"
                                            tabIndex="0"
                                            title="Edit stage"
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                onEditStage(stage);
                                            }}
                                            onKeyDown={(event) => {
                                                if (event.key === "Enter") onEditStage(stage);
                                            }}
                                        >
                                            edit
                                        </span>
                                        <span className="material-symbols-outlined">
                                            chevron_right
                                        </span>
                                    </span>
                                </button>
                            ))
                        )}

                    </div>
                </>
            )}

        </aside>
    );
};


const formatDate = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleDateString(
        "en-GB",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }
    );
};

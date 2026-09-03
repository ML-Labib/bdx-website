const RosterModal = ({
    isOpen,
    onClose,
    registration,
    roster,
    loading,
    error,
}) => {
    if (!isOpen) {
        return null;
    }

    return (
        <div
            className="roster-modal-overlay"
            onMouseDown={onClose}
        >
            <div
                className="roster-modal"
                onMouseDown={(e) => e.stopPropagation()}
            >
                <div className="roster-modal-header">
                    <div>
                        <h2>Team Roster</h2>

                        {registration?.teamId?.name && (
                            <p>
                                {registration.teamId.name}
                            </p>
                        )}
                    </div>

                    <button
                        type="button"
                        className="roster-modal-close"
                        onClick={onClose}
                        aria-label="Close"
                    >
                        ×
                    </button>
                </div>

                <div className="roster-modal-content">

                    {loading && (
                        <div className="roster-modal-loading">
                            Loading roster...
                        </div>
                    )}

                    {!loading && error && (
                        <div className="roster-modal-error">
                            {error}
                        </div>
                    )}

                    {!loading &&
                        !error &&
                        roster && (
                            <>
                                <div className="roster-status">
                                    <span className="roster-lock-badge">
                                        🔒 Roster Locked
                                    </span>

                                    <span>
                                        {roster.length} Players
                                    </span>
                                </div>

                                <div className="roster-table-wrapper">
                                    <table className="roster-table">
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>IGN</th>
                                                <th>PUBG ID</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {roster.map(
                                                (member, index) => (
                                                    <tr
                                                        key={
                                                            member._id
                                                        }
                                                    >
                                                        <td>
                                                            {index + 1}
                                                        </td>

                                                        <td>
                                                            {
                                                                member.ign
                                                            }
                                                        </td>

                                                        <td>
                                                            {
                                                                member.pubgId
                                                            }
                                                        </td>
                                                    </tr>
                                                )
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}

                </div>

                {/* <div className="roster-modal-footer">
                    <button
                        type="button"
                        onClick={onClose}
                        className="roster-modal-close-btn"
                    >
                        Close
                    </button>
                </div> */}
            </div>
        </div>
    );
};

export default RosterModal;
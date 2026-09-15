import "./ParticipantManagement.css";

export const ParticipantManagement = ({
    participants,
    selectedGroup,
    onAddTeam,
}) => {
    return (
        <section className="participant-management">

            <div className="section-toolbar">

                <div>
                    <h3>
                        {selectedGroup.name}
                    </h3>

                    <p>
                        Teams assigned to this group.
                        The serial number is their lobby slot.
                    </p>
                </div>

                <button
                    className="primary-button"
                    onClick={onAddTeam}
                >
                    <span className="material-symbols-outlined">
                        group_add
                    </span>

                    Add Team
                </button>

            </div>

            {participants.length === 0 ? (
                <div className="empty-table-state">

                    <span className="material-symbols-outlined">
                        groups
                    </span>

                    <h3>
                        No Teams Assigned
                    </h3>

                    <p>
                        Add approved teams with a locked roster
                        to this group.
                    </p>

                    <button
                        className="primary-button"
                        onClick={onAddTeam}
                    >
                        <span className="material-symbols-outlined">
                            add
                        </span>

                        Add Team
                    </button>

                </div>
            ) : (
                <div className="participant-table-wrapper">

                    <table className="participant-table">

                        <thead>
                            <tr>
                                <th>LOBBY</th>
                                <th>TEAM</th>
                                <th>TAG</th>
                                <th>ROSTER</th>
                                <th>STATUS</th>
                                <th></th>
                            </tr>
                        </thead>

                        <tbody>
                            {participants
                                .sort(
                                    (a, b) =>
                                        a.lobbySlot -
                                        b.lobbySlot
                                )
                                .map((participant) => (
                                    <tr
                                        key={
                                            participant._id
                                        }
                                    >
                                        <td>
                                            <span className="lobby-number">
                                                {
                                                    participant.lobbyNumber
                                                }
                                            </span>
                                        </td>

                                        <td>
                                            <div className="team-cell">

                                                <div className="team-logo">
                                                    {participant.teamId?.logo ? (
                                                        <img
                                                            src={
                                                                participant
                                                                    .teamId
                                                                    .logo
                                                            }
                                                            alt=""
                                                        />
                                                    ) : (
                                                        <span className="material-symbols-outlined">
                                                            groups
                                                        </span>
                                                    )}
                                                </div>

                                                <strong>
                                                    {
                                                        participant
                                                            .teamId
                                                            ?.name
                                                    }
                                                </strong>

                                            </div>
                                        </td>

                                        <td>
                                            <span className="team-tag">
                                                {
                                                    participant
                                                        .teamId
                                                        ?.teamTag ||
                                                    "—"
                                                }
                                            </span>
                                        </td>

                                        <td>
                                            <span className="locked-status">
                                                <span className="material-symbols-outlined">
                                                    lock
                                                </span>

                                                Locked
                                            </span>
                                        </td>

                                        <td>
                                            <span
                                                className={`participant-status ${participant.status?.toLowerCase()}`}
                                            >
                                                {
                                                    participant.status
                                                }
                                            </span>
                                        </td>

                                        <td>
                                            <button
                                                className="table-icon-button"
                                                title="View roster"
                                            >
                                                <span className="material-symbols-outlined">
                                                    groups
                                                </span>
                                            </button>
                                        </td>

                                    </tr>
                                ))}
                        </tbody>

                    </table>

                </div>
            )}

        </section>
    );
};


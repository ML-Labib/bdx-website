import { useEffect, useState } from "react";
import "./AddTeamModal.css";

export const AddTeamModal = ({
    onClose,
    onSubmit,
    participants,
    teams: registeredTeams = [],
}) => {
    const [teams, setTeams] = useState([]);
    const [selectedTeam, setSelectedTeam] =
        useState("");

    const [lobbySlot, setLobbySlot] =
        useState("");




    useEffect(() => {
            const loadAvailableTeams = async () => {
        if (registeredTeams.length > 0) {
            const existingIds = participants.map((participant) => participant.teamId?._id);
            setTeams(registeredTeams.filter((team) => !existingIds.includes(team._id)));
            return;
        }

        const existingIds = participants.map(
            (participant) =>
                participant.teamId?._id
        );

        setTeams(
            registeredTeams.filter(
                (team) =>
                    !existingIds.includes(
                        team._id
                    )
            )
        );
    };
        loadAvailableTeams();
        }, [participants, registeredTeams]);


    const handleSubmit = (e) => {
        e.preventDefault();

        if (!selectedTeam || !lobbySlot) return;

        onSubmit({
            teamId: selectedTeam,
            lobbySlot: Number(lobbySlot),
        });
    };

    return (
        <div className="modal-overlay">

            <div className="management-modal add-team-modal">

                <div className="modal-header">
                    <div>
                        <h2>Add Team</h2>

                        <p>
                            Assign a locked roster to a
                            lobby slot.
                        </p>
                    </div>

                    <button onClick={onClose}>
                        ×
                    </button>
                </div>

                <form
                    className="modal-form"
                    onSubmit={handleSubmit}
                >

                    <label>
                        Team
                    </label>

                    <select
                        value={selectedTeam}
                        onChange={(e) =>
                            setSelectedTeam(
                                e.target.value
                            )
                        }
                    >
                        <option value="">
                            Select a team
                        </option>

                        {teams.map((team) => (
                            <option
                                key={team._id}
                                value={team._id}
                            >
                                {team.name}
                                {" "}
                                ({team.teamTag})
                            </option>
                        ))}
                    </select>

                    <label>
                        Lobby Number
                    </label>

                    <input
                        type="number"
                        min="1"
                        placeholder="e.g. 1"
                        value={lobbySlot}
                        onChange={(e) =>
                            setLobbySlot(
                                e.target.value
                            )
                        }
                    />

                    <p className="modal-help">
                        The lobby number becomes the team's
                        serial number for this group.
                    </p>

                    <div className="modal-actions">

                        <button
                            type="button"
                            className="modal-cancel"
                            onClick={onClose}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="modal-submit"
                        >
                            Add Team
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
};
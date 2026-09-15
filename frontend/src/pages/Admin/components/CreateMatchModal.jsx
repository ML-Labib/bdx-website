import { useState } from "react";
import "./CreateMatchModal.css";

export const CreateMatchModal = ({
    stage,
    group,
    onClose,
    onSubmit,
    existingMatches,
}) => {
    const nextMatchNumber = existingMatches.length + 1;
    const [matchNumber, setMatchNumber] = useState(nextMatchNumber);
    const [globalMatchNumber, setGlobalMatchNumber] = useState(nextMatchNumber);
    const [mapName, setMapName] = useState("");
    const [gameMode, setGameMode] = useState("esports-tpp");
    const [matchDateTime, setMatchDateTime] = useState(new Date().toISOString().slice(0, 16));

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!mapName.trim() || !gameMode.trim()) return;

        onSubmit({
            matchNumber: Number(matchNumber),
            globalMatchNumber: Number(globalMatchNumber),
            mapName: mapName.trim(),
            gameMode: gameMode.trim(),
            matchDateTime: matchDateTime,
        });
    };

    return (
        <div className="modal-overlay">

            <div className="management-modal">

                <div className="modal-header">
                    <div>
                        <h2>Create Match</h2>
                        <p>
                            Schedule a match for {group?.name || stage?.name}.
                        </p>
                    </div>

                    <button onClick={onClose}>
                        x
                    </button>
                </div>

                <form
                    className="modal-form"
                    onSubmit={handleSubmit}
                >

                    <label>
                        Match Number
                    </label>

                    <input
                        type="number"
                        min="1"
                        value={matchNumber}
                        onChange={(e) =>
                            setMatchNumber(
                                e.target.value
                            )
                        }
                    />

                    <label>
                        Global Match Number
                    </label>

                    <input
                        type="number"
                        min="1"
                        value={globalMatchNumber}
                        onChange={(e) =>
                            setGlobalMatchNumber(
                                e.target.value
                            )
                        }
                    />

                    <label>Map Name</label>
                    <input
                        type="text"
                        placeholder="e.g. Erangel"
                        value={mapName}
                        onChange={(e) => setMapName(e.target.value)}
                    />

                    <label>Game Mode</label>
                    <input
                        type="text"
                        placeholder="e.g. esport-tpp"
                        value={gameMode}
                        onChange={(e) => setGameMode(e.target.value)}
                    />
    
                    <label>Match Date and Time</label>
                    <input 
                    type="datetime-local"
                    value={matchDateTime}
                    onChange={(e) => setMatchDateTime(e.target.value)}
                    />

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
                            Create Match
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
};

import { useState } from "react";
import "./CreateStageModal.css";

export const CreateStageModal = ({
    onClose,
    onSubmit,
    stageCount,
    stage,
}) => {
    const [name, setName] = useState(stage?.name || "");
    const [order, setOrder] = useState(stage?.order || stageCount + 1);
    const [hasGroups, setHasGroups] = useState(stage?.hasGroups ?? true);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!name.trim()) return;

        onSubmit({
            name: name.trim(),
            order: Number(order),
            hasGroups,
        });
    };

    return (
        <div className="modal-overlay">

            <div className="management-modal">

                <div className="modal-header">
                    <div>
                        <h2>{stage ? "Update Stage" : "Create Stage"}</h2>
                        <p>
                            Add a new stage to the tournament.
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
                        Stage Name
                    </label>

                    <input
                        type="text"
                        placeholder="e.g. Group Stage"
                        value={name}
                        onChange={(e) =>
                            setName(e.target.value)
                        }
                        autoFocus
                    />

                    <label>Stage Order</label>
                    <input
                        type="number"
                        min="1"
                        value={order}
                        onChange={(e) => setOrder(e.target.value)}
                    />

                    <label className="checkbox-label">

                        <input
                            type="checkbox"
                            checked={hasGroups}
                            onChange={(e) =>
                                setHasGroups(
                                    e.target.checked
                                )
                            }
                        />

                        This stage contains groups

                    </label>

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
                            {stage ? "Update Stage" : "Create Stage"}
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
};


import { useState } from "react";
import "./CreateGroupModal.css";

export const CreateGroupModal = ({
    onClose,
    onSubmit,
    groupCount,
}) => {
    const [name, setName] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!name.trim()) return;

        onSubmit({
            name: name.trim(),
            order: groupCount + 1,
        });
    };

    return (
        <div className="modal-overlay">

            <div className="management-modal">

                <div className="modal-header">
                    <div>
                        <h2>Create Group</h2>
                        <p>
                            Create a group for the current stage.
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
                        Group Name
                    </label>

                    <input
                        type="text"
                        placeholder="e.g. Group A"
                        value={name}
                        onChange={(e) =>
                            setName(e.target.value)
                        }
                        autoFocus
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
                            Create Group
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
};


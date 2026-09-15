import "./GroupTabs.css";

export const GroupTabs = ({
    groups,
    selectedGroup,
    onGroupChange,
    onCreateGroup,
}) => {
    return (
        <div className="group-tabs-container">

            <div className="group-tabs">

                {groups.map((group, index) => (
                    <button
                        key={group._id}
                        className={`group-tab ${
                            selectedGroup?._id === group._id
                                ? "active"
                                : ""
                        }`}
                        onClick={() =>
                            onGroupChange(group)
                        }
                    >
                        <span className="group-tab-number">
                            {index + 1}
                        </span>

                        <span>
                            {group.name}
                        </span>

                        {group.teamCount !== undefined && (
                            <small>
                                {group.teamCount}
                            </small>
                        )}
                    </button>
                ))}

                <button
                    className="add-group-tab"
                    onClick={onCreateGroup}
                >
                    <span className="material-symbols-outlined">
                        add
                    </span>

                    Add Group
                </button>

            </div>

        </div>
    );
};


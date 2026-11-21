import { useState } from "react";
import { Pencil, X } from "lucide-react";
import AddGoalForm from "./AddGoalForm";
import { getGoalStatus } from "./goalStatus";
import { formatDate } from "./formatDate";

// preview: a look-only copy for the goal form (no edit/delete buttons, progress and checkbox switched off)
function GoalCard({ goal, games, goals, showGame = true, preview = false, onToggle, onDelete, onProgressChange, onSave }) {
    const [isEditing, setIsEditing] = useState(false);
    const { game, completed, completedDate } = getGoalStatus(goal, games);

    if (isEditing) {
        return (
            <div className="add-panel">
                <AddGoalForm
                    games={games.filter((game) => !game.deleted)}
                    goals={goals}
                    goal={goal}
                    onSaveGoal={(changes) => {
                        onSave(changes);
                        setIsEditing(false);
                    }}
                    onCancel={() => setIsEditing(false)}
                />
            </div>
        );
    }

    const cardClass = completed
        ? "goal-card completed"
        : "goal-card";

    return (
        <article className={cardClass}>
            <div className="goal-header">
                <h3>{goal.text}</h3>
                <div className="goal-pills">
                    {showGame && game && <span className="badge badge-game">{game.title}</span>}
                    {goal.type === "achievement" && <span className="badge badge-muted">Achievement</span>}
                    {(goal.tags || []).map((tag) => (
                        <span key={tag} className="badge">{tag}</span>
                    ))}
                </div>
                {!preview && (
                    <>
                        <button
                            type="button"
                            className="icon-button"
                            onClick={() => setIsEditing(true)}
                            aria-label={"Edit goal: " + goal.text}
                        >
                            <Pencil size={16} aria-hidden="true" />
                        </button>
                        <button
                            type="button"
                            className="icon-button"
                            onClick={onDelete}
                            aria-label={"Delete goal: " + goal.text}
                        >
                            <X size={16} aria-hidden="true" />
                        </button>
                    </>
                )}
            </div>

            <p className="goal-status">
                {completed ? (
                    <>✓ Completed <time dateTime={completedDate}>{formatDate(completedDate)}</time></>
                ) : (
                    "Not completed yet"
                )}
            </p>

            <div className="goal-actions">
                {goal.target ? (
                    <label>
                        Progress{" "}
                        <input
                            type="number"
                            min="0"
                            max={goal.target}
                            value={goal.progress}
                            disabled={preview}
                            onChange={(event) => onProgressChange(Number(event.target.value))}
                        />
                        {" "}/ {goal.target}
                        <progress value={goal.progress} max={goal.target} />
                    </label>
                ) : (
                    <label>
                        <input type="checkbox" checked={completed} disabled={preview} onChange={onToggle} />
                        {" "}Mark complete
                    </label>
                )}
            </div>
        </article>
    );
}

export default GoalCard;

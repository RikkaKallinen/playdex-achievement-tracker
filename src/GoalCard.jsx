import { X } from "lucide-react";
import { getGoalStatus } from "./goalStatus";
import { formatDate } from "./formatDate";

function GoalCard({ goal, games, onToggle, onDelete, onProgressChange }) {
    const { game, completed, completedDate } = getGoalStatus(goal, games);

    const cardClass = completed
        ? "goal-card completed"
        : "goal-card";

    return (
        <article className={cardClass}>
            <div className="goal-header">
                <h3>{goal.text}</h3>
                <div className="goal-pills">
                    {game && <span className="badge badge-game">{game.title}</span>}
                    {goal.type === "achievement" && <span className="badge badge-muted">Achievement</span>}
                </div>
                <button
                    type="button"
                    className="icon-button"
                    onClick={onDelete}
                    aria-label={"Delete goal: " + goal.text}
                >
                    <X size={16} aria-hidden="true" />
                </button>
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
                            onChange={(event) => onProgressChange(Number(event.target.value))}
                        />
                        {" "}/ {goal.target}
                        <progress value={goal.progress} max={goal.target} />
                    </label>
                ) : (
                    <label>
                        <input type="checkbox" checked={completed} onChange={onToggle} />
                        {" "}Mark complete
                    </label>
                )}
            </div>
        </article>
    );
}

export default GoalCard;

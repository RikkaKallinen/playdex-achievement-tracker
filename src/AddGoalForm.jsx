import { useId, useState } from "react";
import GameSearchInput from "./GameSearchInput";
import TagInput from "./TagInput";
import SlidingHighlight from "./SlidingHighlight";
import GoalCard from "./GoalCard";
import { getTagsForGame } from "./goalTags";

function today() {
    return new Date().toLocaleDateString("en-CA");
}

// Adds a new goal, or edits one when `goal` is passed in (the form starts filled in and the type can't change)
function AddGoalForm({ games, goals, goal = null, onAddGoal, onSaveGoal, onCancel }) {
    const idPrefix = useId();
    const isEditing = goal !== null;
    const [type, setType] = useState(isEditing ? goal.type : "open");
    const [text, setText] = useState(isEditing && goal.type === "open" ? goal.text : "");
    const [gameId, setGameId] = useState(isEditing ? goal.gameId || "" : "");
    const [achievementName, setAchievementName] = useState(isEditing ? goal.achievementName || "" : "");
    const [target, setTarget] = useState(isEditing && goal.target ? String(goal.target) : "");
    const [tags, setTags] = useState(isEditing ? goal.tags || [] : []);

    const selectedGame = games.find((game) => game.id === gameId);
    // When editing, the goal's own achievement stays in the list even if it's already unlocked
    const pickableAchievements = selectedGame
        ? selectedGame.achievements.filter((achievement) =>
            !achievement.earned || (isEditing && achievement.name === goal.achievementName)
        )
        : [];

    // The card on the right, built from whatever has been typed so far
    const previewGoal = {
        id: "preview",
        type: type,
        text: type === "achievement"
            ? achievementName || "Pick an achievement"
            : text.trim() || "Your goal",
        gameId: gameId,
        achievementName: achievementName,
        target: type === "open" && Number(target) > 0 ? Number(target) : null,
        progress: isEditing ? goal.progress || 0 : 0,
        completed: isEditing ? goal.completed : false,
        completedDate: isEditing ? goal.completedDate : null,
        tags: tags
    };

    function handleSubmit(event) {
        event.preventDefault();
        const newTarget = target === "" ? null : Number(target);

        if (isEditing) {
            const changes = type === "achievement"
                ? { text: achievementName, gameId: gameId, achievementName: achievementName, tags: tags }
                : { text: text, gameId: gameId, target: newTarget, tags: tags };

            // A new target can finish (or un-finish) a goal: 30 of 50 done is complete once the target drops to 30
            if (type === "open" && newTarget !== null) {
                const progress = Math.min(goal.progress || 0, newTarget);
                const completed = progress >= newTarget;
                changes.progress = progress;
                changes.completed = completed;
                changes.completedDate = completed ? goal.completedDate || today() : null;
            }

            onSaveGoal(changes);
            return;
        }

        if (type === "achievement") {
            onAddGoal({
                id: crypto.randomUUID(),
                type: "achievement",
                text: achievementName,
                gameId: gameId,
                achievementName: achievementName,
                target: null,
                progress: 0,
                completed: false,
                completedDate: null,
                tags: tags
            });
        } else {
            onAddGoal({
                id: crypto.randomUUID(),
                type: "open",
                text: text,
                gameId: gameId,
                target: newTarget,
                progress: 0,
                completed: false,
                completedDate: null,
                tags: tags
            });
        }
    }

    return (
        <div className="goal-form-layout">
            <form onSubmit={handleSubmit} className="goal-form">
                {!isEditing && (
                    <div className="filter-chips goal-type-toggle" role="group" aria-label="Goal type">
                        <button
                            type="button"
                            className={type === "open" ? "chip selected" : "chip"}
                            aria-pressed={type === "open"}
                            onClick={() => setType("open")}
                        >
                            Open goal
                        </button>
                        <button
                            type="button"
                            className={type === "achievement" ? "chip selected" : "chip"}
                            aria-pressed={type === "achievement"}
                            onClick={() => setType("achievement")}
                        >
                            Achievement
                        </button>
                        <SlidingHighlight className="chip-highlight" />
                    </div>
                )}

                {type === "open" && (
                    <div className="form-field wide">
                        <label htmlFor={idPrefix + "text"} className="label">Goal</label>
                        <input
                            type="text"
                            id={idPrefix + "text"}
                            placeholder="e.g. Win 50 matches"
                            value={text}
                            onChange={(event) => setText(event.target.value)}
                            required
                        />
                    </div>
                )}

                <div className="form-field">
                    <label htmlFor={idPrefix + "game"} className="label">
                        Game {type === "open" && <span className="optional">optional</span>}
                    </label>
                    <GameSearchInput
                        id={idPrefix + "game"}
                        games={games}
                        initialGameId={gameId}
                        required={type === "achievement"}
                        onPick={(pickedGameId) => {
                            setGameId(pickedGameId);
                            setAchievementName("");
                        }}
                    />
                </div>

                {type === "achievement" && (
                    <div className="form-field">
                        <label htmlFor={idPrefix + "achievement"} className="label">Achievement</label>
                        <select
                            id={idPrefix + "achievement"}
                            value={achievementName}
                            onChange={(event) => setAchievementName(event.target.value)}
                            required
                        >
                            <option value="">{selectedGame ? "Pick an achievement" : "Pick a game first"}</option>
                            {pickableAchievements.map((achievement) => (
                                <option key={achievement.name} value={achievement.name}>
                                    {achievement.name}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {type === "open" && (
                    <div className="form-field">
                        <label htmlFor={idPrefix + "target"} className="label">
                            Number to reach <span className="optional">optional</span>
                        </label>
                        <input
                            type="number"
                            id={idPrefix + "target"}
                            placeholder="e.g. 50"
                            min="1"
                            value={target}
                            onChange={(event) => setTarget(event.target.value)}
                        />
                    </div>
                )}

                <TagInput
                    tags={tags}
                    suggestions={getTagsForGame(goals, gameId)}
                    onChange={setTags}
                />

                <div className="button-row">
                    <button type="submit">{isEditing ? "Save changes" : "Add goal"}</button>
                    <button type="button" className="button-quiet" onClick={onCancel}>Cancel</button>
                </div>
            </form>

            <aside className="goal-preview" aria-label="Preview">
                <p className="label">Preview</p>
                <GoalCard goal={previewGoal} games={games} preview />
            </aside>
        </div>
    );
}

export default AddGoalForm;

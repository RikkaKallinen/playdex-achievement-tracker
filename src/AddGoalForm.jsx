import { useState } from "react";

function AddGoalForm({ games, onAddGoal, onCancel }) {
    const [type, setType] = useState("open");
    const [text, setText] = useState("");
    const [gameId, setGameId] = useState("");
    const [gameSearch, setGameSearch] = useState("");
    const [achievementName, setAchievementName] = useState("");
    const [target, setTarget] = useState("");

    const selectedGame = games.find((game) => game.id === gameId);
    const lockedAchievements = selectedGame
        ? selectedGame.achievements.filter((achievement) => !achievement.earned)
        : [];

    function handleSubmit(event) {
        event.preventDefault();

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
                completedDate: null
            });
        } else {
            onAddGoal({
                id: crypto.randomUUID(),
                type: "open",
                text: text,
                gameId: gameId,
                target: target === "" ? null : Number(target),
                progress: 0,
                completed: false,
                completedDate: null
            });
        }

        setText("");
        setGameId("");
        setGameSearch("");
        setAchievementName("");
        setTarget("");
    }

    return (
        <form onSubmit={handleSubmit}>
            <label htmlFor="goal-type">Goal type</label>
            <select
                id="goal-type"
                value={type}
                onChange={(event) => setType(event.target.value)}
            >
                <option value="open">Open goal</option>
                <option value="achievement">Achievement goal</option>
            </select>

            {type === "open" && (
                <>
                    <label htmlFor="goal-text">Goal</label>
                    <input
                        type="text"
                        id="goal-text"
                        value={text}
                        onChange={(event) => setText(event.target.value)}
                        required
                    />
                </>
            )}

            <label htmlFor="goal-game">
                {type === "achievement" ? "Game" : "Game (optional)"}
            </label>
            <input
                type="text"
                id="goal-game"
                list="goal-game-options"
                placeholder="Start typing a game..."
                value={gameSearch}
                onChange={(event) => {
                    const typed = event.target.value;
                    const match = games.find((game) => game.title === typed);
                    setGameSearch(typed);
                    setGameId(match ? match.id : "");
                    setAchievementName("");
                }}
                required={type === "achievement"}
            />
            <datalist id="goal-game-options">
                {games.map((game) => (
                    <option key={game.id} value={game.title} />
                ))}
            </datalist>
            {gameSearch && !selectedGame && (
                <p className="field-hint">No game called "{gameSearch}" yet. Pick one from the list.</p>
            )}

            {type === "achievement" && (
                <>
                    <label htmlFor="goal-achievement">Achievement</label>
                    <select
                        id="goal-achievement"
                        value={achievementName}
                        onChange={(event) => setAchievementName(event.target.value)}
                        required
                    >
                        <option value="">Pick an achievement</option>
                        {lockedAchievements.map((achievement) => (
                            <option key={achievement.name} value={achievement.name}>
                                {achievement.name}
                            </option>
                        ))}
                    </select>
                </>
            )}

            {type === "open" && (
                <>
                    <label htmlFor="goal-target">Target (optional, e.g. 50)</label>
                    <input
                        type="number"
                        id="goal-target"
                        min="1"
                        value={target}
                        onChange={(event) => setTarget(event.target.value)}
                    />
                </>
            )}

            <div className="button-row">
                <button type="submit">Add goal</button>
                <button type="button" className="button-quiet" onClick={onCancel}>Cancel</button>
            </div>
        </form>
    );
}

export default AddGoalForm;

import { useState } from "react";

function AddGoalForm({ games, onAddGoal }) {
    const [text, setText] = useState("");
    const [gameId, setGameId] = useState("");
    const [target, setTarget] = useState("");

    function handleSubmit(event) {
        event.preventDefault();

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

        setText("");
        setGameId("");
        setTarget("");
    }

    return (
        <form onSubmit={handleSubmit}>
            <label htmlFor="goal-text">Goal</label>
            <input
                type="text"
                id="goal-text"
                value={text}
                onChange={(event) => setText(event.target.value)}
                required
            />

            <label htmlFor="goal-game">Game (optional)</label>
            <select
                id="goal-game"
                value={gameId}
                onChange={(event) => setGameId(event.target.value)}
            >
                <option value="">No game</option>
                {games.map((game) => (
                    <option key={game.id} value={game.id}>{game.title}</option>
                ))}
            </select>

            <label htmlFor="goal-target">Target (optional, e.g. 50)</label>
            <input
                type="number"
                id="goal-target"
                min="1"
                value={target}
                onChange={(event) => setTarget(event.target.value)}
            />

            <button type="submit">Add goal</button>
        </form>
    );
}

export default AddGoalForm;

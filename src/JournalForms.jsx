import { useState } from "react";
import GameSearchInput from "./GameSearchInput";
import GamePicker from "./GamePicker";

function today() {
    return new Date().toLocaleDateString("en-CA");
}

export function NewEntryForm({ games, fixedGameId = "", onAdd, onCancel }) {
    const [gameId, setGameId] = useState(fixedGameId);
    const [date, setDate] = useState(today);
    const [text, setText] = useState("");

    function handleSubmit(event) {
        event.preventDefault();
        if (!gameId) {
            return;
        }

        onAdd(gameId, { id: crypto.randomUUID(), date: date, text: text });
    }

    return (
        <form onSubmit={handleSubmit}>
            {!fixedGameId && (
                <>
                    <label htmlFor="new-entry-game">Game</label>
                    <GameSearchInput id="new-entry-game" games={games} onPick={setGameId} required />
                </>
            )}

            <label htmlFor="new-entry-date">Date</label>
            <input
                type="date"
                id="new-entry-date"
                max={today()}
                value={date}
                onChange={(event) => setDate(event.target.value)}
                required
            />

            <label htmlFor="new-entry-text">Entry</label>
            <textarea
                id="new-entry-text"
                rows="4"
                value={text}
                onChange={(event) => setText(event.target.value)}
                required
            />

            <div className="button-row">
                <button type="submit" disabled={!gameId}>Add entry</button>
                <button type="button" className="button-quiet" onClick={onCancel}>Cancel</button>
            </div>
        </form>
    );
}

export function PastSessionForm({ games, onAdd, onCancel }) {
    const [date, setDate] = useState(today);
    const [gameIds, setGameIds] = useState([]);
    const [hours, setHours] = useState("");
    const [minutes, setMinutes] = useState("");
    const [stories, setStories] = useState({});

    const pickedGames = games.filter((game) => gameIds.includes(game.id));

    function handleSubmit(event) {
        event.preventDefault();
        const totalMinutes = Number(hours || 0) * 60 + Number(minutes || 0);

        onAdd({
            id: crypto.randomUUID(),
            startedDate: date,
            endedDate: date,
            ended: true,
            loggedLater: true,
            minutes: totalMinutes > 0 ? totalMinutes : null,
            goalIds: [],
            gameIds: gameIds,
            keptGoalIds: [],
            summaries: pickedGames
                .filter((game) => stories[game.id] && stories[game.id].trim() !== "")
                .map((game) => ({ gameId: game.id, text: stories[game.id].trim() }))
        });
    }

    return (
        <form onSubmit={handleSubmit}>
            <label htmlFor="past-session-date">When did you play?</label>
            <input
                type="date"
                id="past-session-date"
                max={today()}
                value={date}
                onChange={(event) => setDate(event.target.value)}
                required
            />

            <p className="form-label">What did you play?</p>
            <GamePicker
                games={games}
                pickedIds={gameIds}
                onAdd={(gameId) => setGameIds([...gameIds, gameId])}
                onRemove={(gameId) => setGameIds(gameIds.filter((id) => id !== gameId))}
            />

            <p className="form-label">How long? (optional)</p>
            <div className="duration-inputs">
                <label>
                    <input
                        type="number"
                        min="0"
                        aria-label="Hours"
                        value={hours}
                        onChange={(event) => setHours(event.target.value)}
                    />
                    {" "}h
                </label>
                <label>
                    <input
                        type="number"
                        min="0"
                        max="59"
                        aria-label="Minutes"
                        value={minutes}
                        onChange={(event) => setMinutes(event.target.value)}
                    />
                    {" "}m
                </label>
            </div>

            {pickedGames.map((game) => (
                <div key={game.id} className="summary-box">
                    <label htmlFor={"story-" + game.id}>What happened in {game.title}?</label>
                    <textarea
                        id={"story-" + game.id}
                        rows="3"
                        value={stories[game.id] || ""}
                        onChange={(event) => setStories({ ...stories, [game.id]: event.target.value })}
                    />
                </div>
            ))}

            <div className="button-row">
                <button type="submit" disabled={gameIds.length === 0}>Save session</button>
                <button type="button" className="button-quiet" onClick={onCancel}>Cancel</button>
            </div>
        </form>
    );
}

export function SessionNoteForm({ games, sessionGames, onAdd, onCancel }) {
    const [gameId, setGameId] = useState(sessionGames.length > 0 ? sessionGames[0].id : "");
    const [text, setText] = useState("");

    function handleSubmit(event) {
        event.preventDefault();
        if (!gameId || text.trim() === "") {
            return;
        }

        onAdd({ gameId: gameId, text: text.trim() });
    }

    return (
        <form onSubmit={handleSubmit} className="session-note-form">
            {sessionGames.length > 0 ? (
                <>
                    <label htmlFor="note-game">Game</label>
                    <select id="note-game" value={gameId} onChange={(event) => setGameId(event.target.value)}>
                        {sessionGames.map((game) => (
                            <option key={game.id} value={game.id}>{game.title}</option>
                        ))}
                    </select>
                </>
            ) : (
                <>
                    <label htmlFor="note-game">Game</label>
                    <GameSearchInput id="note-game" games={games} onPick={setGameId} required />
                </>
            )}

            <label htmlFor="note-text">Note</label>
            <textarea id="note-text" rows="3" value={text} onChange={(event) => setText(event.target.value)} required />

            <div className="button-row">
                <button type="submit" disabled={!gameId}>Add note</button>
                <button type="button" className="button-quiet" onClick={onCancel}>Cancel</button>
            </div>
        </form>
    );
}

export function AchievementStoryForm({ achievements, onSave, onCancel }) {
    const [achievementName, setAchievementName] = useState("");
    const [text, setText] = useState("");

    function handlePick(event) {
        const name = event.target.value;
        const nextPick = achievements.find((achievement) => achievement.name === name);
        setAchievementName(name);
        setText(nextPick ? nextPick.notes || "" : "");
    }

    function handleSubmit(event) {
        event.preventDefault();
        onSave(achievementName, text.trim());
    }

    return (
        <form onSubmit={handleSubmit} className="session-note-form">
            <label htmlFor="story-achievement">About</label>
            <select id="story-achievement" value={achievementName} onChange={handlePick}>
                <option value="">General (the whole session)</option>
                {achievements.map((achievement) => (
                    <option key={achievement.name} value={achievement.name}>{achievement.name}</option>
                ))}
            </select>

            <label htmlFor="story-text">Story</label>
            <textarea
                id="story-text"
                rows="3"
                placeholder="What happened?"
                value={text}
                onChange={(event) => setText(event.target.value)}
            />

            <div className="button-row">
                <button type="submit">Save story</button>
                <button type="button" className="button-quiet" onClick={onCancel}>Cancel</button>
            </div>
        </form>
    );
}

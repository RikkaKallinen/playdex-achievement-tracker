import { useState } from "react";

function GameSearchInput({ id, games, onPick, required = false }) {
    const [search, setSearch] = useState("");
    const typedGame = games.find((game) => game.title === search);

    function handleChange(event) {
        const typed = event.target.value;
        const match = games.find((game) => game.title === typed);
        setSearch(typed);
        onPick(match ? match.id : "");
    }

    return (
        <>
            <input
                type="text"
                id={id}
                list={id + "-options"}
                placeholder="Start typing a game..."
                value={search}
                onChange={handleChange}
                required={required}
            />
            <datalist id={id + "-options"}>
                {games.map((game) => (
                    <option key={game.id} value={game.title} />
                ))}
            </datalist>
            {search && !typedGame && (
                <p className="field-hint">No game called "{search}" yet. Pick one from the list.</p>
            )}
        </>
    );
}

export default GameSearchInput;

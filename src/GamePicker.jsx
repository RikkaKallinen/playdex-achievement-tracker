import { useState } from "react";
import { X } from "lucide-react";

function GamePicker({ games, pickedIds, onAdd, onRemove, lockedIds = [] }) {
    const [search, setSearch] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const pickedGames = games.filter((game) => pickedIds.includes(game.id));
    const availableGames = games.filter((game) => !pickedIds.includes(game.id));

    function addGame(game) {
        onAdd(game.id);
        setSearch("");
        setIsSearching(false);
    }

    function closeSearch() {
        setSearch("");
        setIsSearching(false);
    }

    function handleChange(event) {
        const typed = event.target.value;
        const match = availableGames.find((game) => game.title === typed);
        if (match) {
            addGame(match);
            return;
        }

        setSearch(typed);
    }

    function handleKeyDown(event) {
        if (event.key === "Escape") {
            closeSearch();
            return;
        }

        if (event.key !== "Enter") {
            return;
        }

        event.preventDefault();
        const typed = search.trim().toLowerCase();
        const match = availableGames.find((game) => game.title.toLowerCase() === typed)
            || availableGames.find((game) => typed && game.title.toLowerCase().includes(typed));
        if (match) {
            addGame(match);
        }
    }

    return (
        <div className="game-picker">
            {pickedGames.map((game) => (
                <span key={game.id} className="badge badge-game game-picker-pill">
                    {game.title}
                    {!lockedIds.includes(game.id) && (
                        <button
                            type="button"
                            className="game-picker-remove"
                            onClick={() => onRemove(game.id)}
                            aria-label={"Remove " + game.title}
                        >
                            <X size={12} aria-hidden="true" />
                        </button>
                    )}
                </span>
            ))}

            {isSearching ? (
                <>
                    <input
                        type="search"
                        className="game-picker-search"
                        aria-label="Add a game you're playing"
                        placeholder="Type a game..."
                        list="session-game-options"
                        value={search}
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                        onBlur={() => {
                            if (search === "") {
                                closeSearch();
                            }
                        }}
                        autoFocus
                    />
                    <datalist id="session-game-options">
                        {availableGames.map((game) => (
                            <option key={game.id} value={game.title} />
                        ))}
                    </datalist>
                </>
            ) : (
                <button type="button" className="game-picker-add" onClick={() => setIsSearching(true)}>
                    + Add a game you're playing
                </button>
            )}
        </div>
    );
}

export default GamePicker;

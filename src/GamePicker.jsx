import { useState } from "react";
import { X } from "lucide-react";
import GameCombobox from "./GameCombobox";

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

    // The dropdown handles Enter and its own Escape; a second Escape (list already closed) closes the search
    function handleKeyDown(event) {
        if (event.key === "Escape") {
            closeSearch();
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
                <GameCombobox
                    className="game-picker-search"
                    aria-label="Add a game you're playing"
                    placeholder="Type a game..."
                    games={availableGames}
                    value={search}
                    onTextChange={setSearch}
                    onPick={addGame}
                    onKeyDown={handleKeyDown}
                    onBlur={() => {
                        if (search === "") {
                            closeSearch();
                        }
                    }}
                    autoFocus
                />
            ) : (
                <button type="button" className="game-picker-add" onClick={() => setIsSearching(true)}>
                    + Add a game you're playing
                </button>
            )}
        </div>
    );
}

export default GamePicker;

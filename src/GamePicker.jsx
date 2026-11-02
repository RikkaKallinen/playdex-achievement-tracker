import { useState } from "react";
import { X } from "lucide-react";

function GamePicker({ games, pickedIds, onAdd, onRemove, lockedIds = [] }) {
    const [search, setSearch] = useState("");
    const pickedGames = games.filter((game) => pickedIds.includes(game.id));
    const availableGames = games.filter((game) => !pickedIds.includes(game.id));

    function handleChange(event) {
        const typed = event.target.value;
        const match = availableGames.find((game) => game.title === typed);
        if (match) {
            onAdd(match.id);
            setSearch("");
            return;
        }

        setSearch(typed);
    }

    return (
        <div className="game-picker">
            {pickedGames.length > 0 && (
                <div className="game-picker-pills">
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
                </div>
            )}
            <input
                type="search"
                aria-label="Add a game"
                placeholder="+ Add a game you're playing..."
                list="session-game-options"
                value={search}
                onChange={handleChange}
            />
            <datalist id="session-game-options">
                {availableGames.map((game) => (
                    <option key={game.id} value={game.title} />
                ))}
            </datalist>
        </div>
    );
}

export default GamePicker;

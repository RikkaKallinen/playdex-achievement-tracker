import { useState } from "react";
import GameCombobox from "./GameCombobox";

// initialGameId fills the box when editing something that already has a game
function GameSearchInput({ id, games, onPick, required = false, initialGameId = "" }) {
    const [search, setSearch] = useState(() => {
        const initialGame = games.find((game) => game.id === initialGameId);
        return initialGame ? initialGame.title : "";
    });
    const typedGame = games.find((game) => game.title === search);

    function handleTextChange(typed) {
        const match = games.find((game) => game.title === typed);
        setSearch(typed);
        onPick(match ? match.id : "");
    }

    return (
        <>
            <GameCombobox
                id={id}
                games={games}
                placeholder="Start typing a game..."
                required={required}
                value={search}
                onTextChange={handleTextChange}
                onPick={(game) => {
                    setSearch(game.title);
                    onPick(game.id);
                }}
            />
            {search && !typedGame && (
                <p className="field-hint">Pick a game from the list to link it.</p>
            )}
        </>
    );
}

export default GameSearchInput;

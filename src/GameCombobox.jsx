import { useId, useState } from "react";

// Ignores capitals, ® ™ and apostrophes, so "civ" finds "Sid Meier's Civilization® V"
function simplify(text) {
    return text.toLowerCase().replace(/[®™'’]/g, "");
}

function findGames(games, typed) {
    const wanted = simplify(typed.trim());
    return wanted ? games.filter((game) => simplify(game.title).includes(wanted)) : games;
}

// A text box with our own dropdown of games. Clicking in lists every game; typing narrows it to titles containing the text.
// Arrow keys move through the list (scrolling it to keep the highlighted game in view), Enter picks, Escape closes.
// Games are picked on mousedown, not click: a click would blur the box first, which closes the list before the click lands
function GameCombobox({ games, value, onTextChange, onPick, onKeyDown, onBlur, ...inputProps }) {
    const listId = useId();
    const [isOpen, setIsOpen] = useState(false);
    const [highlighted, setHighlighted] = useState(0);
    const matches = findGames(games, value);

    function pick(game) {
        onPick(game);
        setIsOpen(false);
    }

    function handleKeyDown(event) {
        if (isOpen && matches.length > 0) {
            if (event.key === "ArrowDown") {
                event.preventDefault();
                setHighlighted(Math.min(highlighted + 1, matches.length - 1));
                return;
            }

            if (event.key === "ArrowUp") {
                event.preventDefault();
                setHighlighted(Math.max(highlighted - 1, 0));
                return;
            }

            if (event.key === "Enter") {
                // Enter picks a game instead of submitting the form
                event.preventDefault();
                pick(matches[Math.min(highlighted, matches.length - 1)]);
                return;
            }
        }

        if (event.key === "Escape" && isOpen) {
            setIsOpen(false);
            return;
        }

        if (onKeyDown) {
            onKeyDown(event);
        }
    }

    return (
        <div className="game-combobox">
            <input
                {...inputProps}
                type="text"
                role="combobox"
                aria-expanded={isOpen}
                aria-controls={listId}
                aria-autocomplete="list"
                autoComplete="off"
                value={value}
                onChange={(event) => {
                    onTextChange(event.target.value);
                    setIsOpen(true);
                    setHighlighted(0);
                }}
                onFocus={() => setIsOpen(true)}
                onClick={() => setIsOpen(true)}
                onKeyDown={handleKeyDown}
                onBlur={(event) => {
                    setIsOpen(false);
                    if (onBlur) {
                        onBlur(event);
                    }
                }}
            />
            {isOpen && (
                <ul id={listId} role="listbox" className="game-combobox-list">
                    {matches.length === 0 && (
                        <li className="game-combobox-empty">No games match "{value}"</li>
                    )}
                    {matches.map((game, index) => (
                        <li
                            key={game.id}
                            role="option"
                            aria-selected={index === highlighted}
                            className={index === highlighted ? "highlighted" : ""}
                            ref={index === highlighted ? (item) => item && item.scrollIntoView({ block: "nearest" }) : null}
                            onMouseDown={(event) => {
                                event.preventDefault();
                                pick(game);
                            }}
                            onMouseEnter={() => setHighlighted(index)}
                        >
                            {game.title}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default GameCombobox;

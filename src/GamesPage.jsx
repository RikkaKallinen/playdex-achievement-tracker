import { useState } from "react";
import { useNavigate } from "react-router";
import AddGameForm from "./AddGameForm";
import GameCard from "./GameCard";

function isBacklog(game) {
    if (typeof game.playtimeMinutes === "number" && game.playtimeMinutes === 0) {
        return true;
    }

    if (game.achievements.length === 0) {
        return false;
    }

    return !game.achievements.some((achievement) => achievement.earned);
}

function GamesPage({ games, onAddGame, onDeleteGame, onRestoreGame }) {
    const navigate = useNavigate();
    const [isAdding, setIsAdding] = useState(false);
    const [shownTab, setShownTab] = useState("playing");

    const activeGames = games.filter((game) => !game.deleted);
    const deletedGames = games.filter((game) => game.deleted);
    const playedGames = activeGames.filter((game) => !isBacklog(game));
    const backlogGames = activeGames.filter((game) => isBacklog(game));

    const tabs = [
        { value: "playing", label: "Playing", count: playedGames.length },
        { value: "backlog", label: "Backlog", count: backlogGames.length }
    ];
    const shownGames = shownTab === "backlog" ? backlogGames : playedGames;

    function renderGameCard(game) {
        return (
            <GameCard
                key={game.id}
                game={game}
                onSelect={() => navigate("/games/" + game.id)}
                onDelete={() => onDeleteGame(game)}
            />
        );
    }

    return (
        <>
            <section>
                <h2>My games</h2>
                {isAdding ? (
                    <div className="add-panel">
                        <AddGameForm
                            onAddGame={(newGame) => {
                                onAddGame(newGame);
                                setIsAdding(false);
                            }}
                            onCancel={() => setIsAdding(false)}
                        />
                    </div>
                ) : (
                    <div className="game-header-actions">
                        <button type="button" onClick={() => setIsAdding(true)}>+ Add game</button>
                    </div>
                )}

                {activeGames.length === 0 && <p>No games yet</p>}

                {activeGames.length > 0 && (
                    <div className="filter-chips">
                        {tabs.map((tab) => (
                            <button
                                key={tab.value}
                                type="button"
                                className={tab.value === shownTab ? "chip selected" : "chip"}
                                onClick={() => setShownTab(tab.value)}
                            >
                                {tab.label} ({tab.count})
                            </button>
                        ))}
                    </div>
                )}

                {activeGames.length > 0 && shownGames.length === 0 && <p>Nothing here yet</p>}

                <div className="game-grid">
                    {shownGames.map(renderGameCard)}
                </div>
            </section>

            {deletedGames.length > 0 && (
                <section>
                    <h2>Deleted games</h2>
                    {deletedGames.map((game) => (
                        <p key={game.id}>
                            {game.title}{" "}
                            <button onClick={() => onRestoreGame(game.id)}>Restore</button>
                        </p>
                    ))}
                </section>
            )}
        </>
    );
}

export default GamesPage;

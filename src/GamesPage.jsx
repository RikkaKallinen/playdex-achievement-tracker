import { useState } from "react";
import { useNavigate } from "react-router";
import AddGameForm from "./AddGameForm";
import GameCard from "./GameCard";
import { countAchievements } from "./stats";
import { platformNames } from "./data";
import SlidingHighlight from "./SlidingHighlight";

function isBacklog(game) {
    if (typeof game.playtimeMinutes === "number" && game.playtimeMinutes === 0) {
        return true;
    }

    if (game.achievements.length === 0) {
        return false;
    }

    return !game.achievements.some((achievement) => achievement.earned);
}

function getPercent(game) {
    const counts = countAchievements([game]);
    return counts.total > 0 ? counts.unlocked / counts.total : 0;
}

function getLastActivity(game) {
    const dates = game.achievements
        .filter((achievement) => achievement.earnedDate)
        .map((achievement) => achievement.earnedDate);
    if (game.lastPlayed) {
        dates.push(game.lastPlayed);
    }

    return dates.sort().at(-1) || "";
}

const sortOptions = [
    { value: "az", label: "A-Z", compare: () => 0 },
    { value: "recent", label: "Recently played", compare: (a, b) => getLastActivity(b).localeCompare(getLastActivity(a)) },
    { value: "unlocked", label: "Most unlocked", compare: (a, b) => countAchievements([b]).unlocked - countAchievements([a]).unlocked },
    { value: "percent", label: "Highest completion", compare: (a, b) => getPercent(b) - getPercent(a) },
    { value: "hours", label: "Most hours played", compare: (a, b) => (b.playtimeMinutes || 0) - (a.playtimeMinutes || 0) }
];

function GamesPage({ games, onAddGame, onDeleteGame, onRestoreGame }) {
    const navigate = useNavigate();
    const [isAdding, setIsAdding] = useState(false);
    const [shownTab, setShownTab] = useState("playing");
    const [sortBy, setSortBy] = useState("az");
    const [platformFilter, setPlatformFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");

    const activeGames = games.filter((game) => !game.deleted);
    const deletedGames = games.filter((game) => game.deleted);
    const playedGames = activeGames.filter((game) => !isBacklog(game));
    const backlogGames = activeGames.filter((game) => isBacklog(game));

    const tabs = [
        { value: "playing", label: "Playing", count: playedGames.length },
        { value: "backlog", label: "Backlog", count: backlogGames.length }
    ];
    const tabGames = shownTab === "backlog" ? backlogGames : playedGames;
    const sortOption = sortOptions.find((option) => option.value === sortBy);
    const filteredGames = tabGames.filter((game) => {
        if (platformFilter !== "all" && game.platform !== platformFilter) {
            return false;
        }

        if (statusFilter === "complete" && getPercent(game) < 1) {
            return false;
        }

        if (statusFilter === "incomplete" && getPercent(game) === 1) {
            return false;
        }

        return true;
    });
    const shownGames = [...filteredGames].sort(sortOption.compare);

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
                        <SlidingHighlight className="chip-highlight" />

                        <div className="game-controls">
                            <select
                                aria-label="Sort games"
                                value={sortBy}
                                onChange={(event) => setSortBy(event.target.value)}
                            >
                                {sortOptions.map((option) => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                            </select>
                            <select
                                aria-label="Filter by platform"
                                value={platformFilter}
                                onChange={(event) => setPlatformFilter(event.target.value)}
                            >
                                <option value="all">All platforms</option>
                                {Object.keys(platformNames).map((platform) => (
                                    <option key={platform} value={platform}>{platformNames[platform]}</option>
                                ))}
                                <option value="other">Other</option>
                            </select>
                            <select
                                aria-label="Filter by status"
                                value={statusFilter}
                                onChange={(event) => setStatusFilter(event.target.value)}
                            >
                                <option value="all">Any status</option>
                                <option value="complete">100% complete</option>
                                <option value="incomplete">Not complete</option>
                            </select>
                        </div>
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

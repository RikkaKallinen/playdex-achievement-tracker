import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router";
import AchievementCard from "./AchievementCard";
import AddAchievementForm from "./AddAchievementForm";
import { getGoalStatus } from "./goalStatus";
import { getPlatformText } from "./data";
import GameCover from "./GameCover";
import PlatformStat from "./PlatformStat";
import ProgressRing from "./ProgressRing";
import { countAchievements } from "./stats";
import { fetchSteamStats } from "./steamSync";
import { buildJournalFeed, filterFeedForGame } from "./journalFeed";
import { NewEntryForm } from "./JournalForms";
import JournalFeedList from "./JournalFeedList";

function GamePage({ games, goals, sessions, journalEntries, onAddAchievement, onToggleAchievement, onDeleteAchievement, onUpdateAchievement, onUpdateGameCover, onUpdateGame, onAddJournalEntry, onDeleteJournalEntry, onDeleteSession, onAddSessionNote, onDeleteGoal, steamId }) {
    const { gameId } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const game = games.find((game) => game.id === gameId);
    const highlightName = searchParams.get("achievement");
    const shownSection = searchParams.get("tab") === "journal" ? "journal" : "achievements";
    const [isAdding, setIsAdding] = useState(false);
    const [isAddingEntry, setIsAddingEntry] = useState(false);
    const [failedBanner, setFailedBanner] = useState(null);
    const [achievementFilter, setAchievementFilter] = useState("all");

    useEffect(() => {
        if (!highlightName) {
            return;
        }

        const card = document.getElementById("achievement-" + highlightName);
        if (card) {
            card.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    }, [gameId, highlightName]);

    if (!game) {
        return (
            <section>
                <p>Game not found.</p>
                <Link to="/">Back to games</Link>
            </section>
        );
    }

    const gameGoals = goals.filter((goal) => goal.gameId === game.id);
    const inProgressGoals = gameGoals.filter((goal) => !getGoalStatus(goal, games).completed);
    const journalFeed = filterFeedForGame(buildJournalFeed({ games, goals, sessions, journalEntries }), game.id);

    const heroUrl = game.heroUrl === undefined && game.steamAppId
        ? "https://cdn.cloudflare.steamstatic.com/steam/apps/" + game.steamAppId + "/library_hero.jpg"
        : game.heroUrl;
    const bannerChoice = game.bannerChoice || (heroUrl ? "hero" : "cover");
    let bannerMode = "none";
    if (bannerChoice === "hero" && heroUrl && heroUrl !== failedBanner) {
        bannerMode = "hero";
    } else if (bannerChoice !== "none" && game.coverUrl) {
        bannerMode = "cover";
    }

    const counts = countAchievements([game]);
    const percent = counts.total > 0 ? Math.round((counts.unlocked / counts.total) * 100) : 0;

    const achievementFilters = [
        { value: "all", label: "All", count: counts.total },
        { value: "unlocked", label: "Unlocked", count: counts.unlocked },
        { value: "locked", label: "Locked", count: counts.total - counts.unlocked }
    ];

    const shownAchievements = game.achievements.filter((achievement) => {
        if (achievementFilter === "unlocked") {
            return achievement.earned;
        }

        if (achievementFilter === "locked") {
            return !achievement.earned;
        }

        return true;
    });

    return (
        <>
            <section>
                <Link to="/" className="back-link">← Back to games</Link>

                <div className={bannerMode === "none" ? "game-header" : "game-header with-banner"}>
                    {bannerMode === "hero" && (
                        <div className="game-banner" aria-hidden="true">
                            <img src={heroUrl} alt="" onError={() => setFailedBanner(heroUrl)} />
                        </div>
                    )}
                    {bannerMode === "cover" && (
                        <div className="game-banner from-cover" aria-hidden="true">
                            <img className="banner-backdrop" src={game.coverUrl} alt="" />
                            <img className="banner-cover" src={game.coverUrl} alt="" />
                        </div>
                    )}
                    {bannerMode === "none" && (
                        <GameCover game={game} className="game-cover game-header-cover" />
                    )}
                    <div className="game-header-info">
                        <h2>{game.title}</h2>
                        <p className="badge">{getPlatformText(game)}</p>
                        {game.genres && game.genres.length > 0 && (
                            <div className="genre-pills">
                                {game.genres.map((genre) => (
                                    <span key={genre} className="badge badge-muted">{genre}</span>
                                ))}
                            </div>
                        )}
                        <p className="game-header-stats">
                            {counts.unlocked} / {counts.total} achievements · {percent}% complete
                        </p>
                        <PlatformStat game={game} />
                    </div>
                    <ProgressRing percent={percent} size="large" />
                </div>

                <div className="section-tabs" role="tablist">
                    <button
                        type="button"
                        role="tab"
                        aria-selected={shownSection === "achievements"}
                        className={shownSection === "achievements" ? "section-tab selected" : "section-tab"}
                        onClick={() => setSearchParams({}, { replace: true })}
                    >
                        Achievements <span className="section-tab-count">{counts.total}</span>
                    </button>
                    <button
                        type="button"
                        role="tab"
                        aria-selected={shownSection === "journal"}
                        className={shownSection === "journal" ? "section-tab selected" : "section-tab"}
                        onClick={() => setSearchParams({ tab: "journal" }, { replace: true })}
                    >
                        Journal <span className="section-tab-count">{journalFeed.length}</span>
                    </button>
                </div>
            </section>

            {shownSection === "achievements" && (
                <section>
                    <div className="game-header-actions">
                        {!isAdding && (
                            <button type="button" onClick={() => setIsAdding(true)}>+ Add achievement</button>
                        )}
                        <details>
                            <summary>Cover &amp; banner</summary>
                            <label htmlFor="cover-url">Cover image link</label>
                            <input
                                type="url"
                                id="cover-url"
                                placeholder="https://..."
                                value={game.coverUrl || ""}
                                onChange={(event) => onUpdateGameCover(game.id, event.target.value)}
                            />
                            <label htmlFor="banner-choice">Banner</label>
                            <select
                                id="banner-choice"
                                value={bannerChoice}
                                onChange={(event) => onUpdateGame(game.id, { bannerChoice: event.target.value })}
                            >
                                {heroUrl && <option value="hero">Steam artwork</option>}
                                <option value="cover">Game cover</option>
                                <option value="none">No banner</option>
                            </select>
                        </details>
                    </div>

                    {isAdding && (
                        <div className="add-panel">
                            <AddAchievementForm
                                platform={game.platform}
                                onAddAchievement={(newAchievement) => onAddAchievement(game.id, newAchievement)}
                                onCancel={() => setIsAdding(false)}
                            />
                        </div>
                    )}

                    {game.achievements.length === 0 && <p>No achievements yet</p>}

                    {game.achievements.length > 0 && (
                        <div className="filter-chips">
                            {achievementFilters.map((filter) => (
                                <button
                                    key={filter.value}
                                    type="button"
                                    className={filter.value === achievementFilter ? "chip selected" : "chip"}
                                    onClick={() => setAchievementFilter(filter.value)}
                                >
                                    {filter.label} ({filter.count})
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="achievement-list">
                        {shownAchievements.map((achievement) => (
                            <AchievementCard
                                key={achievement.name}
                                achievement={achievement}
                                highlighted={achievement.name === highlightName}
                                onToggle={() => onToggleAchievement(game.id, achievement.name)}
                                onDelete={() => onDeleteAchievement(game.id, achievement.name)}
                                onUpdate={(changes) => onUpdateAchievement(game.id, achievement.name, changes)}
                                onLoadStats={steamId && game.steamAppId ? () => fetchSteamStats(steamId, game.steamAppId) : null}
                            />
                        ))}
                    </div>
                </section>
            )}

            {shownSection === "journal" && (
                <section>
                    {isAddingEntry ? (
                        <div className="add-panel">
                            <NewEntryForm
                                games={games}
                                fixedGameId={game.id}
                                onAdd={(gameId, entry) => {
                                    onAddJournalEntry(gameId, entry);
                                    setIsAddingEntry(false);
                                }}
                                onCancel={() => setIsAddingEntry(false)}
                            />
                        </div>
                    ) : (
                        <div className="game-header-actions">
                            <button type="button" onClick={() => setIsAddingEntry(true)}>+ New entry</button>
                        </div>
                    )}

                    {inProgressGoals.length > 0 && (
                        <div className="summary-card journal-pinned">
                            <h3 className="label">Goals in progress</h3>
                            <ul className="journal-pinned-list">
                                {inProgressGoals.map((goal) => (
                                    <li key={goal.id}>
                                        {goal.text}
                                        {goal.target && <span className="stat-detail"> {goal.progress} / {goal.target}</span>}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <JournalFeedList
                        feed={journalFeed}
                        games={games.filter((otherGame) => !otherGame.deleted)}
                        currentGameId={game.id}
                        emptyMessage="Nothing in this game's journal yet."
                        onAddSessionNote={onAddSessionNote}
                        onUpdateAchievement={onUpdateAchievement}
                        onAddEntry={onAddJournalEntry}
                        onDeleteSession={onDeleteSession}
                        onDeleteEntry={onDeleteJournalEntry}
                        onDeleteGoal={onDeleteGoal}
                    />
                </section>
            )}
        </>
    );
}

export default GamePage;

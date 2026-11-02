import { useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router";
import { BookOpen, ChartColumn, Gamepad2, Settings, Target, Zap } from "lucide-react";
import { getPlatformText } from "./data";
import { countAchievements } from "./stats";
import { getGoalStatus } from "./goalStatus";
import SlidingHighlight from "./SlidingHighlight";

const navLinks = [
    { to: "/", label: "Games", Icon: Gamepad2 },
    { to: "/goals", label: "Goals", Icon: Target },
    { to: "/session", label: "Session", Icon: Zap },
    { to: "/journal", label: "Journal", Icon: BookOpen },
    { to: "/summary", label: "Summary", Icon: ChartColumn },
    { to: "/settings", label: "Settings", Icon: Settings }
];

function Sidebar({ games, profile, goals, activeSession }) {
    const navigate = useNavigate();
    // Re-render on every page change so the nav highlight can follow the active link
    useLocation();
    const [search, setSearch] = useState("");

    function openGame(game) {
        navigate("/games/" + game.id);
        setSearch("");
    }

    function handleSearchChange(event) {
        const typed = event.target.value;
        const exactMatch = games.find((game) => game.title === typed);
        if (exactMatch) {
            openGame(exactMatch);
            return;
        }

        setSearch(typed);
    }

    function handleSearchSubmit(event) {
        event.preventDefault();
        const firstMatch = games.find((game) => game.title.toLowerCase().includes(search.trim().toLowerCase()));
        if (search.trim() && firstMatch) {
            openGame(firstMatch);
        }
    }

    const shownGamertags = profile.gamertags.filter((gamertag) => gamertag.shown && gamertag.tag);
    const counts = countAchievements(games);
    const percent = counts.total > 0 ? Math.round((counts.unlocked / counts.total) * 100) : 0;

    const inProgressCount = goals.filter((goal) => !getGoalStatus(goal, games).completed).length;
    const sessionGoals = activeSession
        ? goals.filter((goal) => activeSession.goalIds.includes(goal.id))
        : [];
    const sessionGoalsDone = sessionGoals.filter((goal) => getGoalStatus(goal, games).completed).length;

    return (
        <aside className="sidebar">
            <div className="brand">
                <span className="brand-icon" aria-hidden="true">
                    <Gamepad2 size={26} />
                </span>
                <div>
                    <h1>Playdex</h1>
                    <p>Track it. Log it. Beat it.</p>
                </div>
            </div>

            <form className="game-search" role="search" onSubmit={handleSearchSubmit}>
                <input
                    type="search"
                    aria-label="Find a game"
                    placeholder="Find a game..."
                    list="sidebar-game-options"
                    value={search}
                    onChange={handleSearchChange}
                />
                <datalist id="sidebar-game-options">
                    {games.map((game) => (
                        <option key={game.id} value={game.title} />
                    ))}
                </datalist>
            </form>

            <nav>
                {navLinks.map(({ to, label, Icon }) => (
                    <NavLink key={to} to={to} end={to === "/"}>
                        <Icon size={18} aria-hidden="true" />
                        {label}
                        {to === "/goals" && inProgressCount > 0 && (
                            <span className="nav-badge" aria-label={inProgressCount + " in progress"}>{inProgressCount}</span>
                        )}
                        {to === "/session" && activeSession && (
                            <span
                                className={activeSession.pausedAt ? "live-dot paused" : "live-dot"}
                                aria-label={activeSession.pausedAt ? "Session paused" : "Session in progress"}
                            />
                        )}
                    </NavLink>
                ))}
                <SlidingHighlight className="nav-highlight" selector=".active" />
            </nav>

            {activeSession ? (
                <Link to="/session" className="session-card live">
                    <span className="label">{activeSession.pausedAt ? "Session paused" : "Session in progress"}</span>
                    <span className="session-card-text">
                        {sessionGoals.length > 0
                            ? sessionGoalsDone + " of " + sessionGoals.length + " goals done"
                            : "No goals picked"}
                    </span>
                    <span className="session-card-link">Back to session →</span>
                </Link>
            ) : (
                <Link to="/session" className="session-card">
                    <span className="session-card-text">Ready to play?</span>
                    <span className="session-card-link">Start a session →</span>
                </Link>
            )}

            <div className="sidebar-bottom">
                <div className="sidebar-profile">
                    <span className="avatar" aria-hidden="true">
                        {profile.avatarUrl
                            ? <img src={profile.avatarUrl} alt="" />
                            : (profile.name || "Player").charAt(0).toUpperCase()}
                    </span>
                    <div className="profile-text">
                        <p className="profile-name">{profile.name || "Player"}</p>
                        {shownGamertags.map((gamertag) => (
                            <p key={gamertag.id} className="profile-tag">
                                <span className="profile-platform">{getPlatformText(gamertag)}</span> {gamertag.tag}
                            </p>
                        ))}
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-grid">
                        <div>
                            <p className="label">Games</p>
                            <p className="stat-number">{games.length.toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="label">Achievements</p>
                            <p className="stat-number">
                                {counts.unlocked.toLocaleString()}<span className="unit"> / {counts.total.toLocaleString()}</span>
                            </p>
                        </div>
                    </div>
                    <div className="stat-bar">
                        <div className="stat-bar-fill" style={{ width: percent + "%" }} />
                    </div>
                </div>

                <p className="label sidebar-footer">All data stored locally</p>
            </div>
        </aside>
    );
}

export default Sidebar;

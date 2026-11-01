import { NavLink } from "react-router";
import { ChartColumn, Gamepad2, Settings, Target, Zap } from "lucide-react";
import { getPlatformText } from "./data";
import { countAchievements } from "./stats";

const navLinks = [
    { to: "/", label: "Games", Icon: Gamepad2 },
    { to: "/goals", label: "Goals", Icon: Target },
    { to: "/session", label: "Session", Icon: Zap },
    { to: "/summary", label: "Summary", Icon: ChartColumn },
    { to: "/settings", label: "Settings", Icon: Settings }
];

function Sidebar({ games, profile }) {
    const shownGamertags = profile.gamertags.filter((gamertag) => gamertag.shown && gamertag.tag);
    const counts = countAchievements(games);
    const percent = counts.total > 0 ? Math.round((counts.unlocked / counts.total) * 100) : 0;

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

            <nav>
                {navLinks.map(({ to, label, Icon }) => (
                    <NavLink key={to} to={to} end={to === "/"}>
                        <Icon size={18} aria-hidden="true" />
                        {label}
                    </NavLink>
                ))}
            </nav>

            <p className="label sidebar-footer">All data stored locally</p>
        </aside>
    );
}

export default Sidebar;

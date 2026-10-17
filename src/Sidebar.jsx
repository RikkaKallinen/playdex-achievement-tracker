import { NavLink } from "react-router";

const navLinks = [
    { to: "/", label: "Games", icon: "🎮" },
    { to: "/goals", label: "Goals", icon: "🎯" },
    { to: "/session", label: "Session", icon: "⚡" },
    { to: "/summary", label: "Summary", icon: "📊" },
    { to: "/settings", label: "Settings", icon: "⚙️" }
];

function Sidebar({ games }) {
    const achievements = games.flatMap((game) => game.achievements);
    const unlocked = achievements.filter((achievement) => achievement.earned).length;
    const percent = achievements.length > 0 ? Math.round((unlocked / achievements.length) * 100) : 0;

    return (
        <aside className="sidebar">
            <div className="brand">
                <span className="brand-icon" aria-hidden="true">🎮</span>
                <div>
                    <h1>Playdex</h1>
                    <p>Track it. Log it. Beat it.</p>
                </div>
            </div>

            <div className="stat-card">
                <p className="label">Achievements</p>
                <p className="stat-number">
                    {unlocked}<span className="unit"> / {achievements.length}</span>
                </p>
                <div className="stat-bar">
                    <div className="stat-bar-fill" style={{ width: percent + "%" }} />
                </div>
            </div>

            <nav>
                {navLinks.map((link) => (
                    <NavLink key={link.to} to={link.to} end={link.to === "/"}>
                        <span aria-hidden="true">{link.icon}</span>
                        {link.label}
                    </NavLink>
                ))}
            </nav>

            <p className="label sidebar-footer">All data stored locally</p>
        </aside>
    );
}

export default Sidebar;

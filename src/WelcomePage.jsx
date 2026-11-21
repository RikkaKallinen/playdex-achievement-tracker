import { useEffect, useState } from "react";
import { Gamepad2 } from "lucide-react";
import AchievementCard from "./AchievementCard";
import GoalCard from "./GoalCard";
import SessionTimer from "./SessionTimer";
import CountUp from "./CountUp";
import SlidingHighlight from "./SlidingHighlight";
import { formatDate } from "./formatDate";

const clipLength = 6000;

function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function today() {
    return new Date().toLocaleDateString("en-CA");
}

// How long the current clip has been showing, ticking 10 times a second.
// With reduce motion on it jumps straight to the end, so every clip shows its finished state
function useClipTime() {
    const [elapsed, setElapsed] = useState(() => (prefersReducedMotion() ? clipLength : 0));

    useEffect(() => {
        if (prefersReducedMotion()) {
            return;
        }

        const startedAt = Date.now();
        const timerId = setInterval(() => setElapsed(Date.now() - startedAt), 100);
        return () => clearInterval(timerId);
    }, []);

    return elapsed;
}

// Each clip below is a real Playdex component fed sample data, stepped along by useClipTime.
// The games are made up on purpose, so the clips make sense to anyone whatever they play

function AchievementsClip() {
    const elapsed = useClipTime();
    // 12 / 20 climbing to 20 between 0.6 s and 3.4 s, then it unlocks
    const progress = Math.min(20, 12 + Math.max(0, Math.floor((elapsed - 600) / 350)));
    const unlocked = elapsed > 3600;

    return (
        <div className="welcome-clip-stack">
            <AchievementCard
                achievement={{
                    name: "Relic Hunter",
                    description: "Find 20 hidden relics.",
                    source: "steam",
                    earned: unlocked,
                    earnedDate: unlocked ? today() : null,
                    progressStat: "relics",
                    progressValue: progress,
                    progressTarget: 20,
                    rarity: 8.4
                }}
            />
            <AchievementCard
                achievement={{
                    name: "First Steps",
                    description: "Finish the tutorial.",
                    source: "steam",
                    earned: true,
                    earnedDate: "2026-11-02",
                    rarity: 92.3
                }}
            />
        </div>
    );
}

const sampleGames = [
    { id: "arena", title: "Skyward Arena", achievements: [] },
    { id: "pines", title: "Hollow Pines", achievements: [] }
];

function GoalsClip() {
    const elapsed = useClipTime();
    // 30 / 50 climbing to 50, then the goal completes
    const progress = Math.min(50, 30 + Math.max(0, Math.floor((elapsed - 500) / 150)));
    const completed = progress === 50;

    return (
        <div className="welcome-clip-stack">
            <GoalCard
                preview
                games={sampleGames}
                goal={{
                    id: "demo-goal",
                    type: "open",
                    text: "Win 50 ranked matches",
                    gameId: "arena",
                    target: 50,
                    progress: progress,
                    completed: completed,
                    completedDate: completed ? today() : null,
                    tags: ["Challenge"]
                }}
            />
            <GoalCard
                preview
                games={sampleGames}
                goal={{
                    id: "demo-goal-2",
                    type: "open",
                    text: "Find every secret area",
                    gameId: "pines",
                    target: null,
                    progress: 0,
                    completed: false,
                    completedDate: null,
                    tags: ["Exploration"]
                }}
            />
        </div>
    );
}

function SessionClip() {
    // Started 1 h 23 min ago, so the timer is already mid-session when the clip appears
    const [startedAt] = useState(() => Date.now() - 83 * 60 * 1000);

    return (
        <div className="session-live-header welcome-session">
            <div>
                <p className="label">Session in progress</p>
                <p className="session-live-date">{formatDate(today())}</p>
            </div>
            <SessionTimer startedAt={startedAt} />
            <div className="session-live-progress">
                <span className="stat-tile-value">2</span>
                <span className="stat-detail">of 3 goals done</span>
            </div>
            <div className="welcome-session-games">
                <span className="badge badge-game">Skyward Arena</span>
                <span className="badge badge-game">Hollow Pines</span>
            </div>
        </div>
    );
}

function SummaryClip() {
    const tiles = [
        { label: "Games", value: 130 },
        { label: "Achievements unlocked", value: 1189 },
        { label: "Perfect games", value: 12 },
        { label: "Hours played", value: 2468 }
    ];

    return (
        <div className="stat-tiles">
            {tiles.map((tile) => (
                <div key={tile.label} className="stat-tile">
                    <p className="label">{tile.label}</p>
                    <p className="stat-tile-value"><CountUp value={tile.value} /></p>
                </div>
            ))}
        </div>
    );
}

const journalText = "Found the last relic behind the waterfall. Two weeks of searching and it was right there the whole time.";

function JournalClip() {
    const elapsed = useClipTime();
    // Types itself out, about 30 letters a second
    const shownText = journalText.slice(0, Math.max(0, Math.floor((elapsed - 300) / 33)));

    return (
        <article className="journal-item welcome-journal">
            <div className="journal-body">
                <p className="label">{formatDate(today())} · Hollow Pines</p>
                <blockquote className="journal-quote">
                    <span className="journal-quote-game">Relic Hunter</span>
                    {shownText}
                    <span className="welcome-caret" aria-hidden="true" />
                </blockquote>
            </div>
        </article>
    );
}

const clips = [
    { label: "Achievements", caption: "Your Steam achievements sync in, with progress bars for the ones that count up.", Clip: AchievementsClip },
    { label: "Goals", caption: "Set goals, tag them, and watch them fill up.", Clip: GoalsClip },
    { label: "Sessions", caption: "Time tonight's session, pause for snacks, and wrap up with notes.", Clip: SessionClip },
    { label: "Summary", caption: "Your gaming life in numbers.", Clip: SummaryClip },
    { label: "Journal", caption: "Keep a journal of the moments worth remembering.", Clip: JournalClip }
];

function WelcomePage({ signInFailed }) {
    const [shownClip, setShownClip] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    // Reduce motion: no automatic switching, the chips still work
    const autoPlay = !isPaused && !prefersReducedMotion();

    useEffect(() => {
        if (!autoPlay) {
            return;
        }

        const timerId = setTimeout(() => setShownClip((shownClip + 1) % clips.length), clipLength);
        return () => clearTimeout(timerId);
    }, [shownClip, autoPlay]);

    const { caption, Clip } = clips[shownClip];

    function signIn() {
        window.location.assign("/api/auth/steam");
    }

    return (
        <div className="welcome">
            <header className="welcome-header">
                <div className="brand">
                    <span className="brand-icon" aria-hidden="true">
                        <Gamepad2 size={26} />
                    </span>
                    <div>
                        <h1>Playdex</h1>
                        <p>Track it. Log it. Beat it.</p>
                    </div>
                </div>
                <button type="button" onClick={signIn}>Sign in through Steam</button>
            </header>

            <section className="welcome-hero">
                <div className="welcome-copy">
                    <h2>Every game, achievement and play session in one place</h2>
                    <p>
                        Playdex brings in your Steam library, achievements and hours played, then helps you set goals,
                        time your sessions and keep a journal of the moments worth remembering.
                    </p>
                    {signInFailed && <p className="field-hint">Steam sign-in didn't work. Try again.</p>}
                    <button type="button" className="welcome-signin" onClick={signIn}>Sign in through Steam</button>
                    <p className="stat-detail">
                        Steam handles the login, so Playdex never sees your password.
                        Xbox, PlayStation and other games can be added by hand once you're in.
                    </p>
                </div>

                <div
                    className="welcome-demo"
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                >
                    <div className="filter-chips" role="group" aria-label="Feature clips">
                        {clips.map((clip, index) => (
                            <button
                                key={clip.label}
                                type="button"
                                className={index === shownClip ? "chip selected" : "chip"}
                                aria-pressed={index === shownClip}
                                onClick={() => setShownClip(index)}
                            >
                                {clip.label}
                            </button>
                        ))}
                        <SlidingHighlight className="chip-highlight" />
                    </div>

                    {/* key restarts the clip (and its timer bar) every time it comes round */}
                    <div className="welcome-stage" key={shownClip} aria-live="polite">
                        <Clip />
                    </div>
                    <div
                        className={autoPlay ? "welcome-timer playing" : "welcome-timer"}
                        key={"timer-" + shownClip + "-" + autoPlay}
                        aria-hidden="true"
                    />
                    <p className="welcome-caption">{caption}</p>
                </div>
            </section>
        </div>
    );
}

export default WelcomePage;

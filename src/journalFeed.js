import { getGoalStatus } from "./goalStatus";

const typeOrder = ["session", "entry", "goal", "unlocks"];

export function buildJournalFeed({ games, goals, sessions, journalEntries }) {
    const findGame = (gameId) => games.find((game) => game.id === gameId);
    const items = [];

    for (const session of sessions.filter((session) => session.ended)) {
        const sessionGoals = goals.filter((goal) => session.goalIds.includes(goal.id));
        const summaryGameIds = (session.summaries || []).map((summary) => summary.gameId);
        const goalGameIds = sessionGoals.map((goal) => goal.gameId).filter((gameId) => gameId);
        const gameIds = [...new Set([...(session.gameIds || []), ...goalGameIds, ...summaryGameIds])];

        items.push({
            type: "session",
            id: "session-" + session.id,
            sourceId: session.id,
            date: session.endedDate || session.startedDate,
            minutes: session.startedAt && session.endedAt
                ? Math.round((session.endedAt - session.startedAt - (session.pausedMs || 0)) / 60000)
                : session.minutes || null,
            loggedLater: Boolean(session.loggedLater),
            games: gameIds.map(findGame).filter((game) => game),
            goalsDone: sessionGoals.filter((goal) => getGoalStatus(goal, games).completed).length,
            goalsTotal: sessionGoals.length,
            summaries: (session.summaries || []).map((summary) => ({
                game: findGame(summary.gameId),
                text: summary.text
            }))
        });
    }

    for (const goal of goals) {
        const status = getGoalStatus(goal, games);
        if (goal.type !== "achievement" && status.completed && status.completedDate) {
            items.push({
                type: "goal",
                id: "goal-" + goal.id,
                sourceId: goal.id,
                date: status.completedDate,
                game: status.game,
                text: goal.text
            });
        }
    }

    for (const game of games) {
        const unlocksByDate = {};
        for (const achievement of game.achievements) {
            if (achievement.earned && achievement.earnedDate) {
                unlocksByDate[achievement.earnedDate] = [...(unlocksByDate[achievement.earnedDate] || []), achievement];
            }
        }

        for (const [date, achievements] of Object.entries(unlocksByDate)) {
            items.push({
                type: "unlocks",
                id: "unlocks-" + game.id + "-" + date,
                date: date,
                game: game,
                achievements: achievements
            });
        }
    }

    for (const entry of journalEntries) {
        const unlockCard = items.find((item) =>
            item.type === "unlocks" && item.game.id === entry.gameId && item.date === entry.date
        );
        if (unlockCard) {
            unlockCard.dayNotes = [...(unlockCard.dayNotes || []), { id: entry.id, text: entry.text }];
            continue;
        }

        items.push({
            type: "entry",
            id: "entry-" + entry.id,
            sourceId: entry.id,
            date: entry.date,
            game: findGame(entry.gameId),
            text: entry.text
        });
    }

    return items.sort((a, b) =>
        b.date.localeCompare(a.date) || typeOrder.indexOf(a.type) - typeOrder.indexOf(b.type)
    );
}

export function groupByDay(items) {
    const days = [];

    for (const item of items) {
        const lastDay = days[days.length - 1];
        if (lastDay && lastDay.date === item.date) {
            lastDay.items.push(item);
        } else {
            days.push({ date: item.date, items: [item] });
        }
    }

    return days;
}

export function filterFeedForGame(feed, gameId) {
    return feed.filter((item) => {
        if (item.type === "session") {
            return item.games.some((game) => game.id === gameId);
        }

        return item.game && item.game.id === gameId;
    });
}

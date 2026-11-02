export const periods = [
    { value: "week", label: "This week" },
    { value: "month", label: "This month" },
    { value: "year", label: "This year" },
    { value: "all", label: "All time" }
];

function toDateString(date) {
    return date.toLocaleDateString("en-CA");
}

function daysBetween(firstDate, secondDate) {
    return Math.round((new Date(secondDate + "T00:00") - new Date(firstDate + "T00:00")) / 86400000);
}

export function getPeriodStart(period) {
    const today = new Date();

    if (period === "week") {
        const daysSinceMonday = (today.getDay() + 6) % 7;
        return toDateString(new Date(today.getFullYear(), today.getMonth(), today.getDate() - daysSinceMonday));
    }

    if (period === "month") {
        return toDateString(new Date(today.getFullYear(), today.getMonth(), 1));
    }

    if (period === "year") {
        return toDateString(new Date(today.getFullYear(), 0, 1));
    }

    return "";
}

export function getUnlocks(games) {
    return games
        .flatMap((game) => game.achievements
            .filter((achievement) => achievement.earned && achievement.earnedDate)
            .map((achievement) => ({ game: game, achievement: achievement, date: achievement.earnedDate }))
        )
        .sort((a, b) => b.date.localeCompare(a.date));
}

export function getLongestStreak(unlocks) {
    const days = [...new Set(unlocks.map((unlock) => unlock.date))].sort();
    let longest = 0;
    let current = 0;
    let previousDay = null;

    for (const day of days) {
        current = previousDay && daysBetween(previousDay, day) === 1 ? current + 1 : 1;
        longest = Math.max(longest, current);
        previousDay = day;
    }

    return longest;
}

export function getActivityBuckets(unlocks, period) {
    const today = new Date();
    const buckets = [];

    if (period === "week") {
        const start = new Date(getPeriodStart("week") + "T00:00");
        for (let index = 0; index < 7; index++) {
            const day = new Date(start.getFullYear(), start.getMonth(), start.getDate() + index);
            buckets.push({ key: toDateString(day), label: day.toLocaleDateString("en-US", { weekday: "short" }) });
        }
    } else if (period === "month") {
        const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
        for (let dayNumber = 1; dayNumber <= daysInMonth; dayNumber++) {
            const day = new Date(today.getFullYear(), today.getMonth(), dayNumber);
            buckets.push({ key: toDateString(day), label: String(dayNumber) });
        }
    } else if (period === "year") {
        for (let month = 0; month < 12; month++) {
            const firstOfMonth = new Date(today.getFullYear(), month, 1);
            buckets.push({
                key: toDateString(firstOfMonth).slice(0, 7),
                label: firstOfMonth.toLocaleDateString("en-US", { month: "short" })
            });
        }
    } else {
        const years = unlocks.map((unlock) => Number(unlock.date.slice(0, 4)));
        const firstYear = years.length > 0 ? Math.min(...years) : today.getFullYear();
        for (let year = firstYear; year <= today.getFullYear(); year++) {
            buckets.push({ key: String(year), label: String(year) });
        }
    }

    return buckets.map((bucket) => {
        const bucketUnlocks = unlocks.filter((unlock) => unlock.date.startsWith(bucket.key));
        return { ...bucket, unlocks: bucketUnlocks, count: bucketUnlocks.length };
    });
}

export function formatPercent(rarity) {
    if (typeof rarity !== "number") {
        return null;
    }

    return (rarity < 10 ? rarity.toFixed(1) : Math.round(rarity)) + "%";
}

export function formatRarity(rarity) {
    const percent = formatPercent(rarity);
    return percent ? percent + " of players" : null;
}

export const genreOrder = ["Racing", "Sports", "Strategy", "Simulation", "RPG", "Adventure", "Action", "Casual", "Massively Multiplayer"];

export function getAutomaticMainGenre(game) {
    if (!game.genres || game.genres.length === 0) {
        return null;
    }

    return genreOrder.find((genre) => game.genres.includes(genre)) || "Other";
}

export function getMainGenre(game) {
    return game.mainGenre || getAutomaticMainGenre(game);
}

export function cleanDescription(description) {
    return (description || "").replace(/\s*\(Creator:[^)]*\)\s*$/i, "");
}

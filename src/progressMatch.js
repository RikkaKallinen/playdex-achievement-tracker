const ignoredWords = ["count", "the", "of", "in", "your", "you", "to", "with", "and", "at", "on", "for", "total", "number", "amount", "times", "any"];

function getWords(text) {
    return (text || "")
        .toLowerCase()
        .split(/[^a-z]+/)
        .filter((word) => word.length >= 3 && !ignoredWords.includes(word))
        .map((word) => word
            .replace(/ves$/, "f")
            .replace(/ies$/, "y")
            .replace(/(ing|ed|es|s)$/, "")
            .replace(/e$/, "")
        );
}

export function findTargetInDescription(description) {
    const match = (description || "").match(/\d[\d,]*/);
    return match ? Number(match[0].replaceAll(",", "")) : null;
}

export function findProgressStat(achievement, stats) {
    if (!findTargetInDescription(achievement.description)) {
        return null;
    }

    const achievementWords = getWords(achievement.name + " " + achievement.description);
    const fittingStats = stats.filter((stat) => {
        const statWords = getWords(stat.displayName);
        return stat.displayName !== stat.name
            && statWords.length > 0
            && statWords.every((word) => achievementWords.includes(word));
    });

    return fittingStats.length === 1 ? fittingStats[0] : null;
}

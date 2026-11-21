// "Science" and "science" count as the same tag
export function hasTag(tags, tag) {
    return tags.some((existingTag) => existingTag.toLowerCase() === tag.toLowerCase());
}

function collectTags(goals) {
    const tags = [];

    for (const goal of goals) {
        for (const tag of goal.tags || []) {
            if (!hasTag(tags, tag)) {
                tags.push(tag);
            }
        }
    }

    return tags.sort((a, b) => a.localeCompare(b));
}

// Each game has its own tags; goals with no game share their own pool
export function getTagsForGame(goals, gameId) {
    return collectTags(goals.filter((goal) => (goal.gameId || "") === (gameId || "")));
}

export function getAllTags(goals) {
    return collectTags(goals);
}

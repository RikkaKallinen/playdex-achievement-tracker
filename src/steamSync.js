export function mergeSteamGames(games, steamGames) {
    const updatedGames = games.map((game) => {
        const steamMatch = steamGames.find((steamGame) => isSameGame(game, steamGame));
        if (!steamMatch) {
            return game;
        }

        return {
            ...game,
            steamAppId: steamMatch.steamAppId,
            playtimeMinutes: steamMatch.playtimeMinutes,
            lastPlayed: steamMatch.lastPlayed,
            coverUrl: game.coverUrl || steamMatch.coverUrl,
            achievements: steamMatch.achievements
                ? mergeAchievements(game.achievements, steamMatch.achievements)
                : game.achievements
        };
    });

    const newGames = steamGames
        .filter((steamGame) => !games.some((game) => isSameGame(game, steamGame)))
        .map((steamGame) => ({
            id: crypto.randomUUID(),
            title: steamGame.title,
            platform: "steam",
            otherPlatform: "",
            coverUrl: steamGame.coverUrl,
            steamAppId: steamGame.steamAppId,
            playtimeMinutes: steamGame.playtimeMinutes,
            lastPlayed: steamGame.lastPlayed,
            achievements: steamGame.achievements || []
        }));

    return [...updatedGames, ...newGames];
}

function isSameGame(game, steamGame) {
    if (game.steamAppId) {
        return game.steamAppId === steamGame.steamAppId;
    }

    return game.platform === "steam" && game.title.toLowerCase() === steamGame.title.toLowerCase();
}

function mergeAchievements(existingAchievements, steamAchievements) {
    const synced = steamAchievements.map((steamAchievement) => {
        const existing = existingAchievements.find((achievement) =>
            achievement.steamApiName === steamAchievement.steamApiName || achievement.name === steamAchievement.name
        );

        return existing ? { ...existing, ...steamAchievement } : steamAchievement;
    });

    const manualOnly = existingAchievements.filter((achievement) =>
        achievement.source !== "steam" && !steamAchievements.some((steamAchievement) => steamAchievement.name === achievement.name)
    );

    return [...synced, ...manualOnly];
}

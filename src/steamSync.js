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
            genres: steamMatch.genres || game.genres,
            heroUrl: steamMatch.heroUrl !== undefined ? steamMatch.heroUrl : game.heroUrl,
            achievements: steamMatch.achievements
                ? mergeAchievements(game.achievements, steamMatch.achievements, steamMatch.stats)
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
            genres: steamGame.genres,
            heroUrl: steamGame.heroUrl,
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

function mergeAchievements(existingAchievements, steamAchievements, stats) {
    const synced = steamAchievements.map((steamAchievement) => {
        const existing = existingAchievements.find((achievement) =>
            achievement.steamApiName === steamAchievement.steamApiName || achievement.name === steamAchievement.name
        );

        if (!existing) {
            return steamAchievement;
        }

        const merged = { ...existing, ...steamAchievement };
        if (existing.progressPicked) {
            merged.progressStat = existing.progressStat;
            merged.progressTarget = existing.progressTarget;
            merged.progressValue = existing.progressValue;
        }

        if (merged.progressStat && stats) {
            const stat = stats.find((stat) => stat.name === merged.progressStat);
            merged.progressValue = stat ? stat.value : 0;
        }

        return merged;
    });

    const manualOnly = existingAchievements.filter((achievement) =>
        achievement.source !== "steam" && !steamAchievements.some((steamAchievement) => steamAchievement.name === achievement.name)
    );

    return [...synced, ...manualOnly];
}

export async function fetchSteamStats(steamId, appId) {
    try {
        const response = await fetch("/api/steam/stats?steamId=" + steamId + "&appId=" + appId);
        return response.ok ? await response.json() : [];
    } catch {
        return [];
    }
}

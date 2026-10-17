import { trophyTiers } from "./data";

export function countAchievements(games) {
    const achievements = games.flatMap((game) => game.achievements);

    return {
        unlocked: achievements.filter((achievement) => achievement.earned).length,
        total: achievements.length
    };
}

export function countGamerscore(games) {
    const achievements = games.flatMap((game) => game.achievements);
    const earnedAchievements = achievements.filter((achievement) => achievement.earned);

    return {
        earned: earnedAchievements.reduce((sum, achievement) => sum + (achievement.gamerscore || 0), 0),
        total: achievements.reduce((sum, achievement) => sum + (achievement.gamerscore || 0), 0)
    };
}

export function countTrophies(games) {
    const earnedAchievements = games
        .flatMap((game) => game.achievements)
        .filter((achievement) => achievement.earned);

    return Object.keys(trophyTiers).map((tier) => ({
        tier: tier,
        name: trophyTiers[tier],
        count: earnedAchievements.filter((achievement) => achievement.trophyTier === tier).length
    }));
}
export function getGoalStatus(goal, games) {
    const game = games.find((game) => game.id === goal.gameId);

    const achievement = goal.type === "achievement" && game
        ? game.achievements.find((achievement) => achievement.name === goal.achievementName)
        : null;

    return {
        game: game,
        completed: achievement ? achievement.earned : goal.completed,
        completedDate: achievement ? achievement.earnedDate : goal.completedDate
    };
}

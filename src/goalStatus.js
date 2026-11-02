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

export function repairGoalLinks(goals, games) {
    let changed = false;

    const repairedGoals = goals.map((goal) => {
        if (goal.type !== "achievement" || games.some((game) => game.id === goal.gameId)) {
            return goal;
        }

        const matchingGames = games.filter((game) =>
            game.achievements.some((achievement) => achievement.name === goal.achievementName)
        );
        if (matchingGames.length !== 1) {
            return goal;
        }

        changed = true;
        return { ...goal, gameId: matchingGames[0].id };
    });

    return changed ? repairedGoals : goals;
}

export function groupGoalsByGame(goals, games) {
    const groups = [];

    for (const goal of goals) {
        const key = goal.gameId || "none";
        let group = groups.find((existingGroup) => existingGroup.key === key);

        if (!group) {
            const game = games.find((game) => game.id === goal.gameId);
            group = { key: key, title: game ? game.title : "No game", goals: [] };
            groups.push(group);
        }

        group.goals.push(goal);
    }

    return groups.sort((a, b) => {
        if (a.key === "none") {
            return 1;
        }

        if (b.key === "none") {
            return -1;
        }

        return a.title.localeCompare(b.title);
    });
}

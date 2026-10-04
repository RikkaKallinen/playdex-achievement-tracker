const platformNames = {
    steam: "Steam",
    xbox: "Xbox",
    playstation: "PlayStation"
};

const starterGames = [
    {
        title: "Peak",
        platform: "steam",
        achievements: [
            {
                name: "Beachcomber Badge",
                description: "Climb past the SHORE",
                earned: true,
                earnedDate: "2025-06-23"
            },
            {
                name: "Trailblazer",
                description: "Climb past the TROPICS",
                earned: true,
                earnedDate: "2025-06-23"
            },
            {
                name: "Alpinist Badge",
                description: "Climb past the ALPINE",
                earned: true,
                earnedDate: "2025-06-23" 
            }
        ]
    },
    {
        title: "Stardew Valley",
        platform: "steam",
        achievements: [
            {
                name: "Two Thumbs Up",
                description: "See a movie",
                earned: true,
                earnedDate: "2025-01-12" 
            },
            {
                name: "Living Large",
                description: "Upgrade your house to the maximun size",
                earned: true,
                earnedDate: "2025-01-05"
            }
        ] 
    }

]

const savedGames = localStorage.getItem("playdex-games");
const games = savedGames ? JSON.parse(savedGames) : starterGames;

function saveGames() {
    localStorage.setItem("playdex-games", JSON.stringify(games));
}

const gameList = document.querySelector("#game-list");

function showGames() {
    gameList.replaceChildren();

    for (const game of games) {
        const card = document.createElement("article");
        card.className = "game-card";

        const title = document.createElement("h3");
        title.textContent = game.title;

        const platform = document.createElement("p");
        if (game.platform === "other") {
            platform.textContent = "Other - " + game.otherPlatform;
        } else {
            platform.textContent = platformNames[game.platform];
        }

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", (event) => {
            event.stopPropagation();
            if (!confirm("Delete " + game.title + " and all its achievements?")) {
                return;
            }
            const index = games.indexOf(game);
            games.splice(index, 1);
            saveGames();
            showGames();
            if (selectedGame === game) {
                showAchievements(games[0]);
            }
        });

        card.append(title, platform, deleteButton);

        card.addEventListener("click", () => {
            showAchievements(game);
        });

        gameList.append(card);
    }
}

showGames();

const achievementList = document.querySelector("#achievement-list");
const selectedGameTitle = document.querySelector("#selected-game-title");
let selectedGame = games[0];

function showAchievements(game) {
    selectedGame = game;
    achievementList.replaceChildren();

    if (!game) {
        selectedGameTitle.textContent = "No games yet";
        return;
    }

    selectedGameTitle.textContent = game.title;

    for (const achievement of game.achievements) {
        const card = document.createElement("article");
        card.className = "achievement-card";
        if (achievement.earned) {
            card.classList.add("unlocked");
        }

        const name = document.createElement("h3");
        name.textContent = achievement.name;

        const description = document.createElement("p");
        description.textContent = achievement.description;

        const label = document.createElement("label");
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = achievement.earned;
        label.append(checkbox, " Unlocked");

        checkbox.addEventListener("change", () => {
            achievement.earned = checkbox.checked;
            if (checkbox.checked && !achievement.earnedDate) {
                achievement.earnedDate = new Date().toLocaleDateString("en-CA");
            }
            saveGames();
            showAchievements(game);
        });

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", () => {
            const index = game.achievements.indexOf(achievement);
            game.achievements.splice(index, 1);
            saveGames();
            showAchievements(game);
        });

        card.append(name, description, label, deleteButton);

        if (achievement.earned) {
            const unlockedOn = document.createElement("p");
            const time = document.createElement("time");
            time.dateTime = achievement.earnedDate;
            time.textContent = new Date(achievement.earnedDate + "T00:00").toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric"
            });
            unlockedOn.append("Unlocked on ", time);
            card.append(unlockedOn);
        }

        achievementList.append(card);
    }
}

showAchievements(games[0]);

const addGameForm = document.querySelector("#add-game-form");

addGameForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const newGame = {
        title: addGameForm.elements.title.value,
        platform: addGameForm.elements.platform.value,
        otherPlatform: addGameForm.elements.otherPlatform.value,
        achievements: []
    };

    games.push(newGame);
    saveGames();
    showGames();
    addGameForm.reset();
    updateOtherPlatformField();
});

const platformSelect = addGameForm.elements.platform;
const otherPlatformField = document.querySelector("#other-platform-field");

function updateOtherPlatformField() {
    const isOther = platformSelect.value === "other";
    otherPlatformField.hidden = !isOther;
    addGameForm.elements.otherPlatform.required = isOther;
}

platformSelect.addEventListener("change", updateOtherPlatformField);

const addAchievementForm = document.querySelector("#add-achievement-form");

addAchievementForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!selectedGame) {
        return;
    }

    const newAchievement = {
        name: addAchievementForm.elements.name.value,
        description: addAchievementForm.elements.description.value,
        earned: false,
        earnedDate: null
    };

    selectedGame.achievements.push(newAchievement);
    saveGames();
    showAchievements(selectedGame);
    addAchievementForm.reset();
});


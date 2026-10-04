const platformNames = {
    steam: "Steam",
    xbox: "Xbox",
    playstation: "PlayStation"
};

const games = [
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

        card.append(title, platform);

        card.addEventListener("click", () => {
            showAchievements(game);
        });

        gameList.append(card);
    }
}

showGames();



const achievementList = document.querySelector("#achievement-list");
const selectedGameTitle = document.querySelector("#selected-game-title");

function showAchievements(game) {
    selectedGameTitle.textContent = game.title;
    achievementList.replaceChildren();

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
            showAchievements(game);
        });

        card.append(name, description, label);

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

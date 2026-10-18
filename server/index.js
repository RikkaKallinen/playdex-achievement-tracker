import express from "express";

const app = express();
const port = 3001;

app.get("/api/steam/games", async (request, response) => {
    const params = new URLSearchParams({
        key: process.env.STEAM_API_KEY,
        steamid: request.query.steamId,
        include_appinfo: "true"
    });

    const steamResponse = await fetch("https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?" + params);

    if (!steamResponse.ok) {
        response.status(502).json({ error: "Steam request failed" });
        return;
    }

    const data = await steamResponse.json();
    response.json(data.response.games || []);
});

app.get("/api/steam/achievements", async (request, response) => {
    const params = new URLSearchParams({
        key: process.env.STEAM_API_KEY,
        steamid: request.query.steamId,
        appid: request.query.appId
    });

    const playerResponse = await fetch("https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v1/?" + params);

    if (!playerResponse.ok) {
        response.json([]);
        return;
    }

    const schemaResponse = await fetch("https://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v2/?" + params);
    const playerData = await playerResponse.json();
    const schemaData = await schemaResponse.json();

    const playerAchievements = playerData.playerstats.achievements || [];
    const schemaAchievements = schemaData.game.availableGameStats?.achievements || [];

    const achievements = schemaAchievements.map((schemaAchievement) => {
        const playerAchievement = playerAchievements.find((achievement) => achievement.apiname === schemaAchievement.name);
        const earned = playerAchievement ? playerAchievement.achieved === 1 : false;

        return {
            steamApiName: schemaAchievement.name,
            name: schemaAchievement.displayName,
            description: schemaAchievement.description || "",
            source: "steam",
            gamerscore: null,
            trophyTier: null,
            iconUrl: schemaAchievement.icon,
            earned: earned,
            earnedDate: earned ? new Date(playerAchievement.unlocktime * 1000).toLocaleDateString("en-CA") : null
        };
    });

    response.json(achievements);
});

app.listen(port, () => {
    console.log("Playdex server running on http://localhost:" + port);
});

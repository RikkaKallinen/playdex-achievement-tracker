import express from "express";

const app = express();
const port = 3001;

async function findCoverUrl(appId) {
    const simpleUrl = "https://cdn.cloudflare.steamstatic.com/steam/apps/" + appId + "/header.jpg";
    const simpleResponse = await fetch(simpleUrl, { method: "HEAD" });
    if (simpleResponse.ok) {
        return simpleUrl;
    }

    const storeResponse = await fetch("https://store.steampowered.com/api/appdetails?filters=basic&appids=" + appId);
    if (!storeResponse.ok) {
        return "";
    }

    const storeData = await storeResponse.json();
    return storeData?.[appId]?.data?.header_image || "";
}

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
    const steamGames = data.response.games || [];

    const games = await Promise.all(steamGames.map(async (steamGame) => ({
        steamAppId: steamGame.appid,
        title: steamGame.name,
        playtimeMinutes: steamGame.playtime_forever,
        lastPlayed: steamGame.rtime_last_played > 0
            ? new Date(steamGame.rtime_last_played * 1000).toLocaleDateString("en-CA")
            : null,
        coverUrl: await findCoverUrl(steamGame.appid)
    })));

    response.json(games);
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

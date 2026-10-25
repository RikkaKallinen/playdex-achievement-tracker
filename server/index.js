import express from "express";
import { findProgressStat, findTargetInDescription } from "../src/progressMatch.js";

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
        title: steamGame.name.trim(),
        playtimeMinutes: steamGame.playtime_forever,
        lastPlayed: steamGame.rtime_last_played > 0
            ? new Date(steamGame.rtime_last_played * 1000).toLocaleDateString("en-CA")
            : null,
        coverUrl: await findCoverUrl(steamGame.appid)
    })));

    response.json(games);
});

async function getStats(params, schemaData) {
    const schemaStats = schemaData.game?.availableGameStats?.stats || [];
    if (schemaStats.length === 0) {
        return [];
    }

    const userResponse = await fetch("https://api.steampowered.com/ISteamUserStats/GetUserStatsForGame/v2/?" + params);
    const userData = userResponse.ok ? await userResponse.json() : {};
    const userStats = userData.playerstats?.stats || [];

    return schemaStats.map((schemaStat) => {
        const userStat = userStats.find((stat) => stat.name === schemaStat.name);

        return {
            name: schemaStat.name,
            displayName: schemaStat.displayName || schemaStat.name,
            value: userStat ? userStat.value : 0
        };
    });
}

app.get("/api/steam/achievements", async (request, response) => {
    const params = new URLSearchParams({
        key: process.env.STEAM_API_KEY,
        steamid: request.query.steamId,
        appid: request.query.appId
    });

    const playerResponse = await fetch("https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v1/?" + params);

    if (!playerResponse.ok) {
        response.json({ achievements: [], stats: [] });
        return;
    }

    const schemaResponse = await fetch("https://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v2/?" + params);
    const playerData = await playerResponse.json();
    const schemaData = await schemaResponse.json();
    const stats = await getStats(params, schemaData);

    const playerAchievements = playerData.playerstats.achievements || [];
    const schemaAchievements = schemaData.game.availableGameStats?.achievements || [];

    const achievements = schemaAchievements.map((schemaAchievement) => {
        const playerAchievement = playerAchievements.find((achievement) => achievement.apiname === schemaAchievement.name);
        const earned = playerAchievement ? playerAchievement.achieved === 1 : false;

        const achievement = {
            steamApiName: schemaAchievement.name,
            name: schemaAchievement.displayName,
            description: schemaAchievement.description || "",
            source: "steam",
            gamerscore: null,
            trophyTier: null,
            iconUrl: schemaAchievement.icon.replace("https://steamcdn-a.akamaihd.net/steamcommunity/public/images/", "https://shared.akamai.steamstatic.com/community_assets/images/"),
            earned: earned,
            earnedDate: earned ? new Date(playerAchievement.unlocktime * 1000).toLocaleDateString("en-CA") : null
        };

        const progressStat = earned ? null : findProgressStat(achievement, stats);

        return {
            ...achievement,
            progressStat: progressStat ? progressStat.name : null,
            progressTarget: progressStat ? findTargetInDescription(achievement.description) : null,
            progressValue: progressStat ? progressStat.value : null
        };
    });

    response.json({ achievements: achievements, stats: stats });
});

app.get("/api/steam/stats", async (request, response) => {
    const params = new URLSearchParams({
        key: process.env.STEAM_API_KEY,
        steamid: request.query.steamId,
        appid: request.query.appId
    });

    const schemaResponse = await fetch("https://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v2/?" + params);
    if (!schemaResponse.ok) {
        response.json([]);
        return;
    }

    const schemaData = await schemaResponse.json();
    response.json(await getStats(params, schemaData));
});

app.listen(port, () => {
    console.log("Playdex server running on http://localhost:" + port);
});

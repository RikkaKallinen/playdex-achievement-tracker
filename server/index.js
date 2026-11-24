import express from "express";
import { findProgressStat, findTargetInDescription } from "../src/progressMatch.js";
import { addAuthRoutes } from "./auth.js";
import { addDataRoutes } from "./data.js";

const app = express();
// Hosting services pick the port themselves through PORT; on this computer it stays 3001
const port = process.env.PORT || 3001;

addAuthRoutes(app);
addDataRoutes(app);

async function findCoverUrl(appId) {
    const simpleUrl = "https://cdn.cloudflare.steamstatic.com/steam/apps/" + appId + "/header.jpg";

    try {
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
    } catch {
        return simpleUrl;
    }
}

async function findHeroUrls(appIds) {
    const heroUrls = {};

    for (let index = 0; index < appIds.length; index += 50) {
        const chunk = appIds.slice(index, index + 50);
        const input = {
            ids: chunk.map((appId) => ({ appid: appId })),
            context: { language: "english", country_code: "US" },
            data_request: { include_assets: true }
        };

        try {
            const storeResponse = await fetch(
                "https://api.steampowered.com/IStoreBrowseService/GetItems/v1/?input_json=" + encodeURIComponent(JSON.stringify(input))
            );
            if (!storeResponse.ok) {
                continue;
            }

            const storeData = await storeResponse.json();
            for (const item of storeData.response?.store_items || []) {
                const assets = item.assets;
                if (assets?.library_hero && assets.asset_url_format) {
                    heroUrls[item.appid] = "https://shared.akamai.steamstatic.com/store_item_assets/"
                        + assets.asset_url_format.replace("${FILENAME}", assets.library_hero);
                }
            }
        } catch {
            continue;
        }
    }

    return heroUrls;
}

app.get("/api/steam/games", async (request, response) => {
    const params = new URLSearchParams({
        key: process.env.STEAM_API_KEY,
        steamid: request.query.steamId,
        include_appinfo: "true",
        include_played_free_games: "true"
    });

    const steamResponse = await fetch("https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?" + params);

    if (!steamResponse.ok) {
        response.status(502).json({ error: "Steam request failed" });
        return;
    }

    const data = await steamResponse.json();
    const ownedGames = data.response.games || [];

    const recentResponse = await fetch("https://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v1/?" + params);
    const recentData = recentResponse.ok ? await recentResponse.json() : {};
    const familyGames = (recentData.response?.games || []).filter((recentGame) =>
        !ownedGames.some((ownedGame) => ownedGame.appid === recentGame.appid)
    );

    const steamGames = [...ownedGames, ...familyGames];

    const heroUrls = await findHeroUrls(steamGames.map((steamGame) => steamGame.appid));

    const games = await Promise.all(steamGames.map(async (steamGame) => ({
        steamAppId: steamGame.appid,
        title: steamGame.name.trim(),
        playtimeMinutes: steamGame.playtime_forever,
        lastPlayed: steamGame.rtime_last_played > 0
            ? new Date(steamGame.rtime_last_played * 1000).toLocaleDateString("en-CA")
            : null,
        coverUrl: await findCoverUrl(steamGame.appid),
        heroUrl: heroUrls[steamGame.appid] || null
    })));

    response.json(games);
});

async function getRarity(appId) {
    try {
        const rarityResponse = await fetch("https://api.steampowered.com/ISteamUserStats/GetGlobalAchievementPercentagesForApp/v0002/?gameid=" + appId);
        if (!rarityResponse.ok) {
            return {};
        }

        const rarityData = await rarityResponse.json();
        const rarity = {};
        for (const achievement of rarityData.achievementpercentages?.achievements || []) {
            rarity[achievement.name] = Number(achievement.percent);
        }

        return rarity;
    } catch {
        return {};
    }
}

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

    // Only "Requested app has no stats" really means the game has no achievements. Anything else (Steam blocking us
    // for too many requests, a private profile, Steam being down) is a failure, and is reported as one: answering
    // "no achievements" would make the sync wipe the ones already saved
    if (!playerResponse.ok) {
        const body = await playerResponse.text();
        if (/no stats/i.test(body)) {
            response.json({ achievements: [], stats: [] });
            return;
        }

        const reason = /not public/i.test(body) ? "private" : "busy";
        response.status(502).json({ error: reason });
        return;
    }

    const schemaResponse = await fetch("https://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v2/?" + params);
    if (!schemaResponse.ok) {
        response.status(502).json({ error: "busy" });
        return;
    }
    const playerData = await playerResponse.json();
    const schemaData = await schemaResponse.json();
    const stats = await getStats(params, schemaData);

    const rarity = await getRarity(request.query.appId);
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
            earnedDate: earned ? new Date(playerAchievement.unlocktime * 1000).toLocaleDateString("en-CA") : null,
            rarity: rarity[schemaAchievement.name] ?? null
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

app.get("/api/steam/genres", async (request, response) => {
    const appIds = String(request.query.appIds || "").split(",").filter((appId) => appId);
    const genres = {};

    for (const appId of appIds) {
        try {
            const storeResponse = await fetch("https://store.steampowered.com/api/appdetails?filters=genres&appids=" + appId);
            if (storeResponse.status === 429) {
                break;
            }

            if (!storeResponse.ok) {
                continue;
            }

            const storeData = await storeResponse.json();
            genres[appId] = (storeData?.[appId]?.data?.genres || []).map((genre) => genre.description);
        } catch {
            continue;
        }
    }

    response.json(genres);
});

// Online, this one server also hands out the built website (npm run build makes the dist folder).
// Any address that isn't a file or an /api route gets index.html, so React's router can show the right page
const distFolder = new URL("../dist", import.meta.url).pathname;
app.use(express.static(distFolder));
app.get("/{*page}", (request, response) => {
    response.sendFile("index.html", { root: distFolder });
});

app.listen(port, () => {
    console.log("Playdex server running on http://localhost:" + port);
});

import crypto from "node:crypto";

// Steam sign-in uses OpenID 2.0: we send the person to Steam's login page, Steam sends them back
// with their Steam ID, and we ask Steam directly to confirm that reply is genuine before trusting it
const steamLoginUrl = "https://steamcommunity.com/openid/login";
const cookieName = "playdex_session";
const thirtyDays = 30 * 24 * 60 * 60 * 1000;

// Where Playdex lives: http://localhost:5173 on this computer (the Vite address the browser uses), or APP_URL once it's online.
// It can't be read from the request, because Vite's proxy rewrites requests to say localhost:3001 on their way to the server
function getAppUrl() {
    return process.env.APP_URL || "http://localhost:5173";
}

// The session cookie is "who you are + when it expires", plus a signature made with SESSION_SECRET.
// Anyone can read a cookie, but without the secret nobody can change the Steam ID inside without breaking the signature
function sign(value) {
    return crypto.createHmac("sha256", process.env.SESSION_SECRET).update(value).digest("base64url");
}

function makeSessionCookie(steamId) {
    const payload = Buffer.from(JSON.stringify({ steamId: steamId, expires: Date.now() + thirtyDays })).toString("base64url");
    return payload + "." + sign(payload);
}

function readCookies(request) {
    const cookies = {};
    for (const part of (request.headers.cookie || "").split(";")) {
        const equalsAt = part.indexOf("=");
        if (equalsAt > 0) {
            cookies[part.slice(0, equalsAt).trim()] = part.slice(equalsAt + 1).trim();
        }
    }
    return cookies;
}

// The signed-in person's Steam ID, or null. Later routes (saving data) will use this to know whose data it is
export function getSignedInSteamId(request) {
    const [payload, signature] = (readCookies(request)[cookieName] || "").split(".");
    if (!payload || !signature) {
        return null;
    }

    const expected = sign(payload);
    if (signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
        return null;
    }

    try {
        const session = JSON.parse(Buffer.from(payload, "base64url").toString());
        return session.expires > Date.now() ? session.steamId : null;
    } catch {
        return null;
    }
}

async function isGenuineSteamReply(query) {
    const check = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
        if (key.startsWith("openid.")) {
            check.set(key, String(value));
        }
    }
    check.set("openid.mode", "check_authentication");

    try {
        const steamResponse = await fetch(steamLoginUrl, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: check
        });
        return /is_valid\s*:\s*true/.test(await steamResponse.text());
    } catch {
        return false;
    }
}

export function addAuthRoutes(app) {
    if (!process.env.SESSION_SECRET) {
        throw new Error("SESSION_SECRET is missing from .env, so sign-in can't work");
    }

    // The "Sign in through Steam" button goes here, and we pass the person straight on to Steam
    app.get("/api/auth/steam", (request, response) => {
        const appUrl = getAppUrl();
        const params = new URLSearchParams({
            "openid.ns": "http://specs.openid.net/auth/2.0",
            "openid.mode": "checkid_setup",
            "openid.return_to": appUrl + "/api/auth/steam/return",
            "openid.realm": appUrl,
            "openid.identity": "http://specs.openid.net/auth/2.0/identifier_select",
            "openid.claimed_id": "http://specs.openid.net/auth/2.0/identifier_select"
        });
        response.redirect(steamLoginUrl + "?" + params);
    });

    // Steam sends the person back here after they log in
    app.get("/api/auth/steam/return", async (request, response) => {
        const appUrl = getAppUrl();
        const query = request.query;
        const steamIdMatch = String(query["openid.claimed_id"] || "")
            .match(/^https:\/\/steamcommunity\.com\/openid\/id\/(\d{17})$/);

        const looksRight = query["openid.mode"] === "id_res"
            && query["openid.op_endpoint"] === steamLoginUrl
            && String(query["openid.return_to"] || "").startsWith(appUrl + "/api/auth/steam/return")
            && steamIdMatch;

        if (!looksRight || !(await isGenuineSteamReply(query))) {
            response.redirect(appUrl + "/?signin=failed");
            return;
        }

        response.cookie(cookieName, makeSessionCookie(steamIdMatch[1]), {
            httpOnly: true,
            sameSite: "lax",
            secure: appUrl.startsWith("https://"),
            maxAge: thirtyDays,
            path: "/"
        });
        response.redirect(appUrl + "/");
    });

    // The app asks this on load: who's signed in? Name and picture come from the Steam profile
    app.get("/api/auth/me", async (request, response) => {
        const steamId = getSignedInSteamId(request);
        if (!steamId) {
            response.json({ signedIn: false });
            return;
        }

        let name = null;
        let avatarUrl = null;
        try {
            const params = new URLSearchParams({ key: process.env.STEAM_API_KEY, steamids: steamId });
            // Steam gets 4 seconds; if it is slow you stay signed in, just without the name and picture
            const summaryResponse = await fetch("https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?" + params, { signal: AbortSignal.timeout(4000) });
            const player = (await summaryResponse.json()).response?.players?.[0];
            name = player?.personaname || null;
            avatarUrl = player?.avatarfull || null;
        } catch {
            // Signed in either way; the name and picture are just nice to have
        }

        response.json({ signedIn: true, steamId: steamId, name: name, avatarUrl: avatarUrl });
    });

    app.post("/api/auth/signout", (request, response) => {
        response.clearCookie(cookieName, { path: "/" });
        response.json({ signedIn: false });
    });
}

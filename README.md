# Playdex

Track it. Log it. Beat it.

Playdex is a gaming tracker I built. You sign in with Steam, it pulls in your games and achievements, and then you can set goals, time your play sessions and keep a journal.

## What it does

- Syncs your Steam library: games, achievements, hours played, cover art and genres
- Shows progress on achievements that count up (like 12 / 20) and how rare each one is
- Goals you can count up or just tick off, with tags and a filter
- A session timer: pick the goals you're working on tonight, pause when you need to, and update your progress when you're done
- A journal that puts your sessions, unlocks and your own notes in one timeline
- A summary page with streaks, your top games, favourite genres and an activity chart
- Xbox, PlayStation and other games can be added by hand
- Saves to your account automatically, and you can download a backup

## Tech

- React 19, React Router and Vite
- Node.js and Express 5
- PostgreSQL (hosted on Neon) with Prisma
- Steam sign-in (OpenID) and the Steam Web API

## How some of it works

**Sign-in.** Steam handles the login, so Playdex never sees your password. When Steam sends someone back, the server double-checks with Steam that the reply is real, then sets a signed cookie so you stay signed in.

**Saving.** Your data is split into five parts: games, goals, sessions, journal and settings. When one changes, only that part gets saved, after a short pause so quick edits don't each send a request.

**Privacy.** The server only ever reads or saves the data for whoever is signed in.

**Steam problems.** The Steam API key only lives on the server. If Steam is busy or a profile is private, the app says so instead of wiping achievements that already synced.

## Running it yourself

You'll need Node.js 24 or newer, a [Steam Web API key](https://steamcommunity.com/dev/apikey) and a PostgreSQL database (a free [Neon](https://neon.tech) one works).

1. Install:

   ```
   npm install
   ```

2. Make a `.env` file in the project folder:

   ```
   STEAM_API_KEY=your Steam Web API key
   SESSION_SECRET=any long random text
   DATABASE_URL=your PostgreSQL connection string
   ```

3. Set up the database:

   ```
   npx prisma migrate deploy
   ```

4. Start the server and the site in two terminals:

   ```
   npm run server
   npm run dev
   ```

5. Open http://localhost:5173

## Folders

```
src/       the React app
server/    the Express server (Steam sign-in, Steam data, saving)
prisma/    the database setup
```

---

© 2026 Rikka Kallinen. All rights reserved.

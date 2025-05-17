# Pit Panda

Pit Panda is a web application created by [Kelly Dance](https://github.com/kelly-dance) for viewing player stats in the Hypixel Pit. It can be accessed at [https://pitpanda.rocks/](https://pitpanda.rocks/).

## Requirements

- Node.js (try v16 if the image API acts weird)
- MongoDB (persistent player data)
- Redis (for leaderboards)
- `.env` file

## Installation

Installation is exactly the same as any other JS webapp, but be sure to install the [frontend](https://github.com/pitpanda/pitpandafrontend) and its dependencies as well.

```bash
cd PitPandaFrontend
npm install
```

The .env file should have the MongoDB and Redis connections in it.
```
ENV=PROD
MONGO=...
APIKEY=...
TOKEN=...
PREFIX=... // Discord bot prefix
REDIS_PORT=...
```

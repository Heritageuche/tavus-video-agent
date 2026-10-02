# Tavus video agent

A simple webpage where visitors start a live video call with your Tavus AI agent.

## Run it
1. Install Node.js (version 18 or newer) from nodejs.org.
2. Rename `.env.example` to `.env` and paste your Tavus API key into it.
3. Change `AGENT_JOB` in `.env` to describe what your agent should do.
4. Open a terminal in this folder and run:  `node server.js`
5. Open http://localhost:3000 and click "Start video call".

## Put it online (Render)

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/Heritageuche/tavus-video-agent)

Click the button above. Render reads `render.yaml`, asks you for your
`TAVUS_API_KEY`, and gives you a public web address.

Your key is typed into Render, never into this repo.

On the free plan the site sleeps after ~15 minutes idle; the next visitor
waits ~50 seconds for it to wake.

## Keep going with Claude Code
Open this folder in Claude Code and ask things like:
- "Change the agent's job to answer questions about my business"
- "Put this on my website"
- "Use my own face from Tavus instead of the stock one"

Your API key stays in `.env`. Never put it in index.html or share it.
Each call uses your Tavus minutes (free plan: about 20 per month).

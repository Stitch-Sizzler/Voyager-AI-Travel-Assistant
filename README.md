# Cloudflare AI Travel Agent

This repository contains an AI-powered travel assistant built exclusively on the Cloudflare platform.

## Application Architecture

This application implements an AI agent loop utilizing Cloudflare Agents:
1. **LLM:** Powered by `llama-4-scout-17b-16e-instruct` via Workers AI.
2. **User Input:** Chat UI built with React, communicating with the backend over WebSockets, served dynamically.
3. **Tools:** Implements custom server-side tools (`getWeather` and `getAttraction`) that the LLM calls based on user prompts.

## Running the Application Locally

Prerequisites: Node.js (18+) and an active Cloudflare account.

1. `npm install`
2. `npx wrangler types`
3. `npm run deploy`
4. Open the URL (ending in `wokers.dev`) in a browser.

## Test Tools

Once the assistant is running, try the following: `What is the weather and top attraction in Tokyo?`

**Note: The assistant currently uses randomized weather data and mock data for attractions.**
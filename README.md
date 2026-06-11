# Voyager — AI Travel Assistant

An immersive, premium AI-powered travel assistant dashboard built entirely on the Cloudflare platform using Cloudflare Agents, Durable Objects, and Workers AI. Deployed live at: **[https://cf-ai-voyager-travel-agent.s-mohiuddin-msm.workers.dev](https://cf-ai-voyager-travel-agent.s-mohiuddin-msm.workers.dev)**.

---

## Model & Custom Tools

Voyager is powered by the `@cf/meta/llama-4-scout-17b-16e-instruct` large language model running on Cloudflare Workers AI. The model has access to the following 10 custom travel tools:

*   **`getWeather`**: Fetches weather forecasts for any city.
*   **`getAttractions`**: Lists top landmarks and city attractions.
*   **`estimateFlightCost`**: Estimates flight expenses for economy/business.
*   **`getFlightDistance`**: Computes flight distances and travel times.
*   **`getCurrencyExchange`**: Performs real-time currency conversions.
*   **`getPackingList`**: Recommends items tailored to destinations and styles.
*   **`getLocalPhrases`**: Translates phrases and details phonetic pronunciations.
*   **`getLocalNews`**: Returns local headlines and link details.
*   **`getSunTimes`**: Retrieves sun schedules (sunrise, sunset, solar noon).
*   **`getAirQuality`**: Determines European AQI ratings and PM metrics.

---

## Application Architecture

This application implements a stateful agent loop using the Cloudflare Agents SDK:

1.  **State Management**: Utilizes Cloudflare Durable Objects to store chat histories and agent context.
2.  **Client-Server Stream**: Chat interface built with React, communicating with the backend over WebSockets/SSE stream.

---

## User Interface

*   **Dynamic 3D HUD Interface**: Features 10 floating, interactive prompt suggestions laid out in a balanced 3D cockpit arrangement, complete with custom scale transformations and skews.
*   **Twinkling Stellar Atmosphere**: Dynamic background featuring 250 custom twinkling stars that adapt to light and dark modes (colorful pastels in light mode, clean white in dark mode).
*   **Custom Rich-Output Cards**: Tailored widget components for rendering complex backend data (news articles, packing tables, currency flows, sunset/sunrise diagrams, and colorful AQI scales).

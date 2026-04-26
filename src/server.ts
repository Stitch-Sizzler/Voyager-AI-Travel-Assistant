import { AIChatAgent } from "@cloudflare/ai-chat";
import { routeAgentRequest } from "agents";
import { createWorkersAI } from "workers-ai-provider";
import { streamText, convertToModelMessages, pruneMessages, tool, stepCountIs } from "ai";
import { z } from "zod";

export class TravelAgent extends AIChatAgent {
  async onChatMessage() {
    const workersai = createWorkersAI({ binding: this.env.AI });
    
    const result = streamText({
      model: workersai("@cf/meta/llama-4-scout-17b-16e-instruct"),
      system: "You are a helpful travel assistant. You can check the weather and recommend top attractions for any city. Always use your tools to get the information before answering.",
      messages: pruneMessages({
        messages: await convertToModelMessages(this.messages),
        toolCalls: "before-last-2-messages",
      }),
      tools: {
        getWeather: tool({
          description: "Get the current weather for a city",
          inputSchema: z.object({
            city: z.string().describe("City name"),
          }),
          execute: async ({ city }) => {
            const conditions = ["Sunny", "Partly Cloudy", "Rainy", "Breezy"];
            const temp = Math.floor(Math.random() * 20) + 10; 
            return {
              city,
              temperature: `${temp}°C`,
              condition: conditions[Math.floor(Math.random() * conditions.length)],
            };
          },
        }),
        getAttraction: tool({
          description: "Get the top tourist attraction for a city",
          inputSchema: z.object({
            city: z.string().describe("City name"),
          }),
          execute: async ({ city }) => {
            const attractions: Record<string, string> = {
              "paris": "The Eiffel Tower",
              "tokyo": "Senso-ji Temple",
              "london": "The British Museum",
              "new york": "Central Park",
              "edmonton": "West Edmonton Mall",
              "calgary": "Wilder Institute/Calgary Zoo",
              "toronto": "CN Tower",
              "orlando": "Walt Disney World"
            };
            const normalizedCity = city.toLowerCase();
            const attraction = attractions[normalizedCity] || "The Historic Downtown Square";
            return { city, topAttraction: attraction };
          }
        })
      },
      stopWhen: stepCountIs(5),
    });

    return result.toUIMessageStreamResponse();
  }
}

export default {
  async fetch(request: Request, env: any) {
    return (
      (await routeAgentRequest(request, env)) ||
      new Response("Not found", { status: 404 })
    );
  },
};
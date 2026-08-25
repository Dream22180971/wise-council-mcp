#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { consultTool, handleConsult } from "./tools/consult.js";
import { reviewTool, handleReview } from "./tools/review.js";
import { brainstormTool, handleBrainstorm } from "./tools/brainstorm.js";
import { critiqueTool, handleCritique } from "./tools/critique.js";
import { suggestTool, handleSuggest } from "./tools/suggest.js";
import { roundtableTool, handleRoundtable } from "./tools/roundtable.js";

const server = new Server(
  {
    name: "wise-council",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List all available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      roundtableTool,
      consultTool,
      reviewTool,
      brainstormTool,
      critiqueTool,
      suggestTool,
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "roundtable":
        return await handleRoundtable(args as any);
      case "consult":
        return await handleConsult(args as any);
      case "review":
        return await handleReview(args as any);
      case "brainstorm":
        return await handleBrainstorm(args as any);
      case "critique":
        return await handleCritique(args as any);
      case "suggest":
        return await handleSuggest(args as any);
      default:
        return {
          content: [
            {
              type: "text",
              text: `Unknown tool: ${name}`,
            },
          ],
          isError: true,
        };
    }
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Wise Council MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});

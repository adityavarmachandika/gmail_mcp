import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { google } from 'googleapis';
import authenticate from './config'

// Create server instance
const server = new McpServer({
  name: "gmail_mcp",
  version: "1.0.0",
  capabilities: {
    resources: {},
    tools: {},
  },
});


const checkmail=async ()=>{
    const auth= await authenticate()
    const gmail = google.gmail({ version: 'v1', auth });

    //get id of each mail and threadid
    const res = await gmail.users.messages.list({
    userId: 'me', // "me" means the authenticated user
    maxResults: 10
    });

}

checkmail()
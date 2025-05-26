import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import getGmailMessages from "./utils/get_latest_gmail.js";
import { EmailData } from "./utils/get_latest_gmail.js";
// Create server instance
const server = new McpServer({
  name: "gmail_mcp",
  version: "1.0.0",
  capabilities: {
    resources: {},
    tools: {},
  },
});



server.tool("summerize_mails","summerize the latest 10 mails from the user gmail account",{},
  async ()=>{
    const emails:EmailData[]=await getGmailMessages()

    if(!emails){
      return{
        content:[
          {
            type:"text",
            text:"no emails found"
          }

        ]
      }
    }
    const summary= emails.map((email,i)=>(
      `Email ${i + 1}:\nSubject: ${email.subject}\nBody: ${email.body.slice(0, 100)}...\n `
    )).join()
    return {
      content:[
        {
          type:"text",
          text:summary
        }
      ]
    }
  }
)

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Weather MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import getGmailMessages from "./utils/get_mails.js";
import { EmailData } from "./utils/get_mails.js";
import { z } from "zod";
import send_mails from "./utils/send_mails.js";
import authenticate from "./config.js";
import { gmail_v1, google } from "googleapis";

// Create server instance
const server = new McpServer({
  name: "gmail_mcp",
  version: "1.0.0",
  capabilities: {
    resources: {},
    tools: {},
  },
});

let gmail:gmail_v1.Gmail


//tool to get the latest emails
server.tool("get_mail","get the mails from the gmail api (latest or using keyword) based on the user preference and highlight that you feel important",{
  size:z.number().describe("number of mails that is requested by the user to be fetched"),
  queryString:z.string().describe("Gmail search query (e.g., keyword or date). Leave empty to fetch recent emails.")
},
async ({queryString,size})=>{
  const emails:EmailData[]=await getGmailMessages(gmail,size,queryString)

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



//tool to send an email
server.tool("send_email","write an email to user by providing the subject body and sender gmail id",
  {
    to:z.string().describe(`the reciver's email address`),
    body: z.string().describe(`the body of the email that the user wants to send`),
    subject:z.string().describe(`the subject of the email that it is refreing to`)
  },
  async ({body,to,subject})=>{
    
    const encodedData=await send_mails(body,to,subject,gmail)
    let result
    
    if(encodedData==200)
      result="done"
    else
    result="not done"
  
  return {
    content:[
          {
            type:"text",
            text:result
          }
        ]
      }
      
    }
  )
  
  async function main() {
    
    try{
      const auth= await authenticate();
      gmail = google.gmail({ version: 'v1', auth });
  }
  catch(error){
    console.log("auth error", error)
  }

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Gmail MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
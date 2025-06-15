import express from 'express';
import { google } from 'googleapis';
import open from 'open';
import fs from 'fs'
import dotenv from 'dotenv'
import path from 'path';
import { fileURLToPath } from 'url';
import { Request,Response } from 'express';
import { OAuth2Client } from 'google-auth-library';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



dotenv.config({
  path: path.resolve(__dirname, '../.env'), // Adjusting the directory for the env varibles
});

//required credentials for the oauth login
const GOOGLE_CLIENT_ID=process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET=process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI=process.env.GOOGLE_REDIRECT_URI;
const SCOPES=['https://www.googleapis.com/auth/gmail.readonly','https://www.googleapis.com/auth/gmail.send']


//create client
const client=new google.auth.OAuth2(GOOGLE_CLIENT_ID,GOOGLE_CLIENT_SECRET,GOOGLE_REDIRECT_URI)




const authenticate=async ():Promise<OAuth2Client>=>{

  //check if the user is already loged in recently

  let usedtoken:boolean=false;

  if(fs.existsSync('tokens.json')){
    const tokens=JSON.parse(fs.readFileSync('tokens.json').toString())
    const expiryDate = tokens.expiry_date ? new Date(tokens.expiry_date) : null;
    if (expiryDate && expiryDate > new Date()) {  
      usedtoken=true;
      client.setCredentials(tokens);
      console.log("using existing token")
    }
  }

  if(usedtoken){
    return client;
  }
  else{
    const authurl= client.generateAuthUrl({ access_type: 'offline', prompt: 'consent', scope: SCOPES })
    console.log(authurl)
    await open(authurl)
    return new Promise((resolve)=>{
      const app=express();

      app.get('/callback',async (req:Request,res:Response)=>{
        const code= req.query.code as string

        try{
            const {tokens}=await client.getToken(code);
            fs.writeFileSync('tokens.json',JSON.stringify(tokens))
            client.setCredentials(tokens)

            console.log("all successfull")
            res.json({"message":"this is successful"})
            resolve(client);
            server.close()
        }
        catch(error){
          console.log(error)
        }
      })
      const server = app.listen(3999, () => console.log('Listening on http://localhost:3999/'));
    })

    
  }


}
export default authenticate
import express, { request } from 'express';
import { google } from 'googleapis';
import open from 'open';
import fs from 'fs'
import dotenv from 'dotenv'
import { Request,Response } from 'express';

dotenv.config()
const app=express();

//required credentials for the oauth login
const GOOGLE_CLIENT_ID=process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET=process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI=process.env.GOOGLE_REDIRECT_URI;
const SCOPES=['https://www.googleapis.com/auth/gmail.readonly']

const client=new google.auth.OAuth2(GOOGLE_CLIENT_ID,GOOGLE_CLIENT_SECRET,GOOGLE_REDIRECT_URI)

const authenticate=async ()=>{

  
  //check if the user is already loged in recently
  if(fs.existsSync('tokens.json')){
    client.setCredentials(JSON.parse(fs.readFileSync('tokens.json').toString()))
  }
  else{
    const authurl= client.generateAuthUrl({ access_type: 'offline', scope: SCOPES })
    await open(authurl)
  }

}


app.get('/auth',async(req:Request,res:Response)=>{
  try{
    await authenticate()
    res.json({"auth":"successfull"})
  }
  catch(error){
    console.log(error)
    res.send("there is an error")
  }
})


app.get('/callback',async (req:Request,res:Response)=>{
  const code= req.query.code as string

  try{
      const {tokens}=await client.getToken(code);
      fs.writeFileSync('tokens.json',JSON.stringify(tokens))
      client.setCredentials(tokens)

      console.log("all successfull")
  }
  catch(error){
    console.log(error)
  }
})

app.listen('3999',()=>{
  console.log(`it is running on 3999 port`)
})
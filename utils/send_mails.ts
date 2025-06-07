import { gmail_v1, google } from "googleapis";
import authenticate from "../config.js";

const send_mails= async (body:string, to:string, subject:string, gmail:gmail_v1.Gmail)=>{
    const message = [
    `To: ${to}`,
    `Subject: ${subject}`,
    'Content-Type: text/plain; charset=UTF-8',
    '',
    body
    ].join('\n');

    const encodedmessage=Buffer.from(message)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, ''); 

    const issent=gmail.users.messages.send({
        userId:'me',
        requestBody:{
            raw:encodedmessage
        }
    })
    console.log(issent)
    return (await issent).status
}

export default send_mails
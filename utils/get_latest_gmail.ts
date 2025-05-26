import { z } from "zod";
import { google } from 'googleapis';
import authenticate from '../config.js'



export interface EmailData {
    subject: string;
    body: string;
}

interface MessageHeader {
    name: string;
    value: string;
}

interface MessagePart {
    mimeType?: string;
    body?: {
        data?: string;
    };
    parts?: MessagePart[];
}

interface MessagePayload {
    headers: MessageHeader[];
    body?: {
        data?: string;
    };
    parts?: MessagePart[];
}

interface FullMessage {
    payload: MessagePayload;
}

const getGmailMessages = async (): Promise<EmailData[]> => {
    const auth = await authenticate();
    const gmail = google.gmail({ version: 'v1', auth });

    try {
        // Get list of messages
        const res = await gmail.users.messages.list({
            userId: 'me',
            maxResults: 10
        });

        if (!res.data.messages) {
            console.log("No messages found");
            return [];
        }

        const emails: EmailData[] = [];

        // Process each message
        for (const message of res.data.messages) {
            if (!message.id) continue;

            const fullMessage = await gmail.users.messages.get({
                userId: 'me',
                id: message.id,
                format: 'full'
            });

            if (!fullMessage.data.payload) continue;

            const email = extractEmailData(fullMessage.data as FullMessage);
            emails.push(email);
        }

        return emails;

    } catch (error) {
        console.error('Error fetching emails:', error);
        return [];
    }
};

function extractEmailData(messageData: FullMessage): EmailData {
    const headers = messageData.payload.headers;
    
    // Extract subject
    const subject = headers.find((h: MessageHeader) => h.name === 'Subject')?.value || 'No Subject';
    
    // Extract body
    const body = extractBody(messageData.payload);
    
    return {
        subject,
        body
    };
}

function extractBody(payload: MessagePayload): string {
    let body = '';

    // Check if message has direct body content
    if (payload.body?.data) {
        body = decodeBase64(payload.body.data);
    }
    // Check for multipart message
    else if (payload.parts) {
        body = extractFromParts(payload.parts);
    }

    return cleanBody(body);
}

function extractFromParts(parts: MessagePart[]): string {
    // Look for plain text first
    for (const part of parts) {
        if (part.mimeType === 'text/plain' && part.body?.data) {
            return decodeBase64(part.body.data);
        }
    }
    
    // If no plain text, look for HTML
    for (const part of parts) {
        if (part.mimeType === 'text/html' && part.body?.data) {
            const html = decodeBase64(part.body.data);
            return stripHtml(html);
        }
    }
    
    return 'No readable content';
}

function decodeBase64(data: string): string {
    return Buffer.from(data, 'base64').toString('utf-8');
}

function stripHtml(html: string): string {
    return html
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>');
}

function cleanBody(body: string): string {
    return body
        .replace(/\r\n/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

export default getGmailMessages
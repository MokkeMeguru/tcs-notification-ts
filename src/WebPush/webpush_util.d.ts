export interface VapidDetail  {
    owner: string;
    pubkey: string;
    privatekey: string;
}

export interface Subscription {
    endpoint: string,
    keys: {
        auth: string,
        p256dh: string
    }
}

interface Headers {
    [header: string]: string;
}

interface SendResponse {
    statusCode: number;
    headers: Headers;
    body: string;
}

export interface Message {
    titile: string;
    message: string;
    body: string;
}
export type Send = (subs: Subscription, message: Message) => Promise<SendResponse>;

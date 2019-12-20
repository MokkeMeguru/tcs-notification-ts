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

// {
//  "notification": {
//    "actions": NotificationAction[],
//    "badge": USVString
//    "body": DOMString,
//    "data": any,
//    "dir": "auto"|"ltr"|"rtl",
//    "icon": USVString,
//    "image": USVString,
//    "lang": DOMString,
//    "renotify": boolean,
//    "requireInteraction": boolean,
//    "silent": boolean,
//    "tag": DOMString,
//    "timestamp": DOMTimeStamp,
//    "title": DOMString,
//    "vibrate": number[]
//  }
// }


export interface Message {
    title: string;
    message: string;
    body: string;
}
export type Send = (subs: Subscription, message: any) => Promise<SendResponse>;

import {VapidDetail, Send} from './webpush_util.d';

export class WebPush {
    private webpush: any;
    public constructor(init: VapidDetail) {
        this.webpush = require('web-push');
        this.webpush.setVapidDetails(
            init.owner,
            init.pubkey,
            init.privatekey
        );
    };
    public send: Send = async (subs, message) => {
        return await this.webpush.sendNotification(subs, JSON.stringify(message));
    }
}

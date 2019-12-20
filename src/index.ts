import cron = require('node-cron');
import {psql_client} from './connection_info';
import {PSQLClient} from './Boundary/psql_util';
import { QueryArgs} from './Boundary/psql_util.d'
import { get_whole_device_with_user } from './Boundary/device'
import { sendNotification } from 'web-push';
import {CronSendNotifications} from './index.d'
import {WebPush} from './WebPush/webpush_util'
import { VapidDetail, Subscription, Message} from './WebPush/webpush_util.d'
import {vapid_detail} from './vapid_keys'

const psqlclient = new PSQLClient (psql_client);
const  webpush = new WebPush (vapid_detail);
const appname = 'task-cabinet';
psqlclient.connect_client ();

const cronSendNotifications: CronSendNotifications = async (psqlclient) => {
    console.log ('[info] scheduled notification');
    let res = await get_whole_device_with_user (psqlclient);
    res.forEach ((r) => {
        const subs: Subscription = {
            endpoint: r.endpoint,
            keys: {
                auth: r.auth,
                p256dh: r.p256dh
            }
        };
        const message: any = {
              notification: {
              titile: `Push Notification from ${appname}`,
              body: body: `Are you ${r.name} ?`,
              icon: "assets/main-page-logo-small-hat.png",
              vibrate: [100, 50, 100],
              data:
              {message: `Hello! You have a task.`},
              actions: [{action:"explore", titile: "Go to the site"}]}
        }
        webpush.send(subs, message).catch ((err) => console.log ('[ERROR]', err));
    })
}

// ref: https://chuckwebtips.hatenablog.com/entry/2017/04/23/173359
// ref: https://qiita.com/n0bisuke/items/66abf6ca1c12f495aa04
cron.schedule('* * * * *', async () => {
    console.log('hello from typescript via cron');
    await cronSendNotifications (psqlclient);
});

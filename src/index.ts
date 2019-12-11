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

const cronSendNotifications: CronSendNotifications = (psqlclient) => {
        psqlclient.connect_client ()
        .then ((_) => {
            console.log ('[info] scheduled notification');
            get_whole_device_with_user(psqlclient)
                .then (
                    (res) =>  {
                        res.forEach ((r) => {
                            const subs: Subscription = {
                                endpoint: r.endpoint,
                                keys: {
                                    auth: r.auth,
                                    p256dh: r.p256dh
                                }
                            };
                            const message: Message = {
                                titile: `Push Notification from ${appname}`,
                                message: `Hello! You have a task.`,
                                body: `Are you ${r.name} ?`
                            }
                            webpush.send(subs, message).catch ((err) => console.log ('[ERROR]', err));
                        });
                        psqlclient.disconnect ().catch ((err) => console.log ('[ERROR]', err));
                    }
                ).catch ((err) => console.log ('[ERROR]', err));
        })
        .catch ((err) => {
            console.log ('[ERROR]', err);
        });
}

// ref: https://qiita.com/n0bisuke/items/66abf6ca1c12f495aa04
cron.schedule('* * * * *', () => {
    console.log('hello from typescript via cron');
    cronSendNotifications (psqlclient);
});


// const queryargs: QueryArgs = {
//     query: 'select * from users',
//     params: []
// };


// psqlclient.connect_client ()
//     .then ((_) => {
//         // psqlclient.eval_query( queryargs)
//         //     .then ((res) => {
//         //         console.log (res)})
//         //     .catch ((_) => {
//         //         console.log ('error');
//         //     });
//         get_whole_device_with_user(psqlclient)
//             .then (
//             (res) =>  console.log (res)
//         ).catch ((err) => console.log (err));
//     })
//     .catch ((err) => {
//         console.log ('connection error');
//         console.log (err);
//     });


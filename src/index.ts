import cron = require("node-cron");
import { psql_client } from "./connection_info";
import { PSQLClient } from "./Boundary/psql_util";
import { QueryArgs } from "./Boundary/psql_util.d";
import { sendNotification } from "web-push";
import { CronSendNotifications } from "./index.d";
import { WebPush } from "./WebPush/webpush_util";
import { VapidDetail, Subscription, Message } from "./WebPush/webpush_util.d";
import { vapid_detail } from "./vapid_keys";
import { getWholeDeviceWithUser } from "./Boundary/device";
import { getTasksByUserID } from "./Boundary/task";

const psqlclient = new PSQLClient(psql_client);
const webpush = new WebPush(vapid_detail);
psqlclient.connect_client();

interface TestMessage {
  notification: any;
  data: any;
  actions: any;
}

export enum Algorithm {
  DEADLINE_FIRST,
  SMALL_ESTIMATE_FIRST
}

function selectTaskWithAlgorithm(tasks: any[], algorithm: Algorithm): any {
  if (algorithm === Algorithm.DEADLINE_FIRST) {
    tasks.sort((a, b) => (a.deadline < b.deadline ? -1 : 1));
    console.log("[info] tasks");
    console.log(tasks);
    return tasks[0];
  } else if (algorithm === Algorithm.SMALL_ESTIMATE_FIRST) {
    tasks.sort((a, b) => (a.estimate > b.estimate ? -1 : 1));
    console.log("[info] tasks");
    console.log(tasks);
    return tasks[0];
  } else {
    throw new Error(`[error] unsupported algorithm`);
  }
}

function selectAlgorithm() {
  return Algorithm.DEADLINE_FIRST;
  // return Algorithm.SMALL_ESTIMATE_FIRST;
  /**
   * TODO:
   * hatanaka  1時間前
   * ランダムさんなら、一定回数を越えるまで、というよりは
   * (aの選択回数+10):(bの選択回数+10)
   * くらいの比率で常にランダムに返せたらよさそうです
   */
}

const cronSendNotifications: CronSendNotifications = async psqlclient => {
  let deviceWithUsers = await getWholeDeviceWithUser(psqlclient);
  for (const deviceWithUser of deviceWithUsers) {
    // Get tasks by the given user
    const userID = deviceWithUser.user_id;
    const tasks = await getTasksByUserID(psqlclient, userID);
    if (tasks.length === 0) {
      return;
    }
    const algorithm = selectAlgorithm();
    const notifiedTask = selectTaskWithAlgorithm(tasks, algorithm);

    console.log("[info] algorithm, notifiedTask");
    console.log(algorithm);
    console.log(notifiedTask);

    // Create notification
    const subs: Subscription = {
      endpoint: deviceWithUser.endpoint,
      keys: {
        auth: deviceWithUser.auth,
        p256dh: deviceWithUser.p256dh
      }
    };
    let message = {
      notification: {
        title: `${deviceWithUser.name} さんのタスクのお知らせ`,
        body: `${notifiedTask.name} (見積り: ${notifiedTask.estimate})`,
        icon: "assets/icons/icon-72x72.png",
        vibrate: [100, 50, 100],
        data: {
          message: `Hello! You have a task.`,
          url: `https://enpitut2019.github.io/task-cabinet/task/${notifiedTask.id}`
        },
        actions: [{ action: "explore", title: "アプリを開く" }]
      }
    };
    webpush
      .send(subs, JSON.stringify(message))
      .then(_ =>
        console.log(
          `[info] pushed to '${deviceWithUser.name}' via '${
            deviceWithUser.endpoint
          }' message: ${JSON.stringify(message)}`
        )
      )
      .catch(err => console.log(`[error] ${err}`));
    console.log("[info] message:");
    console.log(message);
  }
};

// ref: https://chuckwebtips.hatenablog.com/entry/2017/04/23/173359
// ref: https://qiita.com/n0bisuke/items/66abf6ca1c12f495aa04
cron.schedule("* * * * *", async () => {
  console.log("[info] run cron");
  await cronSendNotifications(psqlclient);
});

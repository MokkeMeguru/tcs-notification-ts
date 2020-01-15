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
import { getAlgorithmHistory } from "./Boundary/algorithm";
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
  DEADLINE_FIRST = 1,
  SMALL_ESTIMATE_FIRST = 2
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

/**
 * (aの選択回数+10):(bの選択回数+10)
 * の比率でアルゴリズムを返す
 * @param history
 */
function selectAlgorithm(history: Array<any>) {
  const DEFAULT = Algorithm.DEADLINE_FIRST;
  const DEFAULT_ANCHOR = 10;  // 各カウントに足し合わせる

  let deadlineCount = 0;
  let smallEstimateCount = 0;

  history.forEach(obj => {
    if (obj.alg === Algorithm.DEADLINE_FIRST) {
      deadlineCount = obj.value;
    } else if (obj.alg === Algorithm.SMALL_ESTIMATE_FIRST) {
      smallEstimateCount = obj.value;
    }
  });
  const deadlineWeight = deadlineCount + DEFAULT_ANCHOR;
  const smallEstimateWeight = smallEstimateCount + DEFAULT_ANCHOR;

  const rand = Math.floor(Math.random() * (deadlineWeight + smallEstimateWeight));

  if (rand < deadlineWeight) return Algorithm.DEADLINE_FIRST;
  if (rand < deadlineWeight + smallEstimateWeight) return Algorithm.SMALL_ESTIMATE_FIRST;
  return DEFAULT;
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
    const his = await getAlgorithmHistory(psqlclient, userID);
    const algorithm = selectAlgorithm(his);
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
          url: `https://enpitut2019.github.io/task-cabinet/task/${notifiedTask.id}?pushType=${algorithm}`
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

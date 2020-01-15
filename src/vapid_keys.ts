import { VapidDetail, Subscription } from "./WebPush/webpush_util.d";

const owner: string = "mailto:meguru.mokke@gmail.com";
const vapid_pub: string =
  "BKC5-9mK29h2-ryo14BqYqppcN0HtDwFyNZLfmiMvumImyC3sKaWAt_gabaY_u-ffxC2uUDeJcmlBgDpHuo6FBE=";
const vapid_private: string = "WIlSwDskbKRs9419msvy3iV30jAlh1PTnnxdqBZ65zc=";

export const vapid_detail: VapidDetail = {
  owner: owner,
  pubkey: vapid_pub,
  privatekey: vapid_private
};

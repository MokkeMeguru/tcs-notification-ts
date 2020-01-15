import { GetWholeDeviceWithUser } from "./device.d";
import { QueryArgs } from "./psql_util.d";

export const get_whole_device_with_user: GetWholeDeviceWithUser = async client => {
  const queryargs: QueryArgs = {
    query:
      "SELECT name, endpoint, auth, p256dh FROM user_device LEFT OUTER JOIN users ON user_device.user_id= users.id",
    params: []
  };
  let res = client.eval_query(queryargs);
  return res;
};

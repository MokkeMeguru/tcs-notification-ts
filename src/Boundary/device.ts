import { GetWholeDeviceWithUser } from "./device.d";
import { QueryArgs } from "./psql_util.d";

export const getWholeDeviceWithUser: GetWholeDeviceWithUser = async client => {
  const queryargs: QueryArgs = {
    query:
      "SELECT name, endpoint, auth, p256dh, user_id FROM user_device LEFT OUTER JOIN users ON user_device.user_id = users.id",
    params: []
  };
  let res = client.eval_query(queryargs);
  return res;
};

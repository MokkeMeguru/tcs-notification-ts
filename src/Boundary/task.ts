import { GetTasksByUserID } from "./task.d";
import { QueryArgs } from "./psql_util.d";
import { PSQLClient } from "./psql_util";

export const getTasksByUserID: GetTasksByUserID = async (
  client: PSQLClient,
  userID: number
) => {
  const queryargs: QueryArgs = {
    query:
      "SELECT name, deadline, estimate, id from task where user_id = $1::int and is_deleted != true and finished_at IS NULL;",
    params: [userID]
  };
  let res = client.eval_query(queryargs);
  return res;
};

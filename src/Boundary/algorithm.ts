import { GetAlgorithmHistory } from "./algorithm.d";
import { QueryArgs } from "./psql_util.d";
import { PSQLClient } from './psql_util';

export const getAlgorithmHistory: GetAlgorithmHistory = async (
    client: PSQLClient,
    userID: number) => {
  const queryargs: QueryArgs = {
    query:
      "SELECT * FROM select_alg WHERE user_id = $1::int",
    params: [userID]
  };
  let res = client.eval_query(queryargs);
  return res;
};

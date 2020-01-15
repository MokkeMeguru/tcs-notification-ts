import { PSQLClient } from "./psql_util";
import { QueryArgs } from "./psql_util.d";

declare type GetAlgorithmHistory = (
    client: PSQLClient,
    userID: number
) => Promise<any[]>;

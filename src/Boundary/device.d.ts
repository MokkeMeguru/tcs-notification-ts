import { PSQLClient } from "./psql_util";
import { QueryArgs } from "./psql_util.d";

declare type GetWholeDeviceWithUser = (client: PSQLClient) => Promise<any[]>;

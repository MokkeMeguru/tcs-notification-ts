import {Connection, PSQLClientInit} from './Boundary/psql_util.d'
import { PSQLClient } from './Boundary/psql_util'

const connection: Connection = {
    user: "meguru",
    host: "dev_db",
    database: "tcs_db",
    password: "emacs",
    port: 5432
};

export const psql_client: PSQLClientInit = {
    connect_info : connection,
};

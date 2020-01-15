import { Client } from "pg";
export interface Connection {
  user: string;
  host: string;
  database: string;
  password: string;
  port: number;
}

export interface PSQLClientInit {
  connect_info: Connection;
}

export type ConnectClient = () => Promise<void>;

export interface QueryArgs {
  query: string;
  params: any[];
}

export type EvalQuery = (query_args: QueryArgs) => Promise<any[]>;

export type Disconnect = () => Promise<void>;

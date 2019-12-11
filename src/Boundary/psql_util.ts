import {Connection, PSQLClientInit, ConnectClient, EvalQuery, Disconnect} from './psql_util.d'
import { Client } from 'pg';

export class PSQLClient {
    private connect_info: Connection;
    private client: Client;
    public constructor(init: PSQLClientInit) {
        this.connect_info = init.connect_info;
        this.client = new Client (this.connect_info);
    };
    public connect_client: ConnectClient = async () => {
        return this.client.connect ();
    }
    public eval_query: EvalQuery = async (query_args) => {
        const result = await this.client.query (query_args.query, query_args.params);
        return result.rows;
    }
    public disconnect:Disconnect = async () => {
        return this.client.end ();
    }
}

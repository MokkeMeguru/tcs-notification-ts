import {PSQLClient} from './Boundary/psql_util';

export type CronSendNotifications = (psqlclient: PSQLClient) => void;

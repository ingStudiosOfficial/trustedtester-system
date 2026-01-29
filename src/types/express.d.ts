import type { Db, MongoClient } from 'mongodb';

declare global {
    namespace Express {
        interface Request {
            db: Db;
            client: MongoClient;
            serverUrl: string;
            trustedSecret: string;
        }
    }
}

export {};

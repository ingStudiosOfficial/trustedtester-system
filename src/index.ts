import express, { type NextFunction, type Request, type Response } from 'express';
import cors from 'cors';
import { Db, MongoClient } from 'mongodb';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { mainRouter } from './routes/index.js';
import { createCode } from './admin/createCode.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({
    path: path.join(__dirname, '../.env'),
});

if (!process.env.MONGODB_CONNECTION_STRING) {
    console.error('Could not get MongoDB connection string.');
    process.exit(1);
}

if (!process.env.SERVER_URL) {
    console.error('Could not get server URL.');
    process.exit(1);
}

if (!process.env.TRUSTED_SECRET) {
    console.error('Trusted secret missing.');
    process.exit(1);
}

const serverUrl = process.env.SERVER_URL;
const trustedSecret = process.env.TRUSTED_SECRET;

const client = new MongoClient(process.env.MONGODB_CONNECTION_STRING);
let database: Db;

const app = express();
app.set('trust proxy', 1);
app.use(cookieParser());
app.use(express.json());
app.use((req: Request, res: Response, next: NextFunction) => {
    req.db = database;
    req.client = client;
    req.serverUrl = serverUrl;
    req.trustedSecret = trustedSecret;
    next();
});
app.use(mainRouter);

async function connectToMongo() {
    try {
        await client.connect();
        database = client.db(process.env.DB_NAME);
        console.log('Successfully connected to MongoDB.');
    } catch (error) {
        console.error('Error while connecting to MongoDB:', error);
        process.exit(1);
    }
}

async function startServer() {
    const scriptArgs = process.argv.slice(2);
    await connectToMongo();

    if (scriptArgs.length !== 0) {
        switch (scriptArgs[0]) {
            case 'create':
                const appId = scriptArgs[1];
                const appUrl = scriptArgs[2];
                const redeemCount = Number(scriptArgs[3]) || 1;

                if (!appId || !appUrl) {
                    console.error('App ID or app URL missing.');
                    process.exit(1);
                }

                createCode(database, serverUrl, appId, appUrl, redeemCount);
        }
    } else {
        app.listen(Number(process.env.PORT), () => {
            console.log('Server started successfully!');
        });
    }
}

startServer();
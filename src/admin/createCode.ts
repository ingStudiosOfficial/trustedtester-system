import { ObjectId, type Db } from "mongodb";
import type { TrustedCode } from "../interfaces/TrustedCode.js";
import clipboard from "clipboardy";

export async function createCode(database: Db, serverUrl: string, appId: string, appUrl: string, redeemCount: number) {
    try {
        const generatedCode = new ObjectId();

        const insertResult = await database.collection<TrustedCode>('trustedcodes').insertOne({
            _id: generatedCode,
            appId: appId,
            appUrl: appUrl,
            redeemCount: redeemCount,
        });

        if (!insertResult.insertedId) {
            console.error('Failed to create code.');
            process.exit(1);
        }

        const generatedUrl = `${serverUrl}/?code=${generatedCode.toString()}&appId=${appId}`;
        console.log('Successfully created code:', generatedUrl);
        await clipboard.write(generatedUrl);

        process.exit(0);
    } catch (error) {
        console.error('Failed to create code:', error);
    }
}
import type { ObjectId } from "mongodb";

export interface TrustedCode {
    _id: ObjectId;
    appId: string;
    appUrl: string;
    redeemCount: number;
}
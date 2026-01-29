import { Router, type Request, type Response } from 'express';
import path from 'path';
import type { TrustedCode } from '../interfaces/TrustedCode.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({
    path: path.join(__dirname, '../.env'),
});

export const mainRouter = Router();

mainRouter.get('', async (req: Request, res: Response) => {
    const code = req.query.code;
    const appId = req.query.appId;

    if (!code || !appId) {
        return res.status(400).sendFile(path.join(__dirname, '../public', 'notfound.html'));
    }

    if (!(typeof code === 'string') || !ObjectId.isValid(code)) {
        return res.status(400).sendFile(path.join(__dirname, '../public', 'invalidcode.html'));
    }

    const codeValid = await req.db.collection<TrustedCode>('trustedcodes').findOne({ _id: new ObjectId(code), appId: appId });

    if (!codeValid) {
        return res.status(400).sendFile(path.join(__dirname, '../public', 'invalidcode.html'));
    }

    if (codeValid.redeemCount <= 0) {
        return res.status(409).sendFile(path.join(__dirname, '../public', 'maxredeem.html'))
    }

    console.log('Successfully verified trusted tester:', codeValid);

    const jwtToken = jwt.sign(
        {
            iss: req.serverUrl,
            app: appId,
            scope: ['beta'],
        },
        req.trustedSecret,
        { expiresIn: '20d' },
    );

    res.status(200).type('html').send(`
        <!DOCTYPE html>
        <html>
            <head>
                <meta charset="utf-8" />
                <title>Finishing setup…</title>
            </head>
            <body>
                <p>Finishing tester setup…</p>

                <form id="handoff" method="POST" action="${codeValid.appUrl}/api/trustedtester/set/">
                <input type="hidden" name="token" value="${jwtToken}" />
                </form>

                <script>
                document.getElementById('handoff').submit();
                </script>
            </body>
        </html>    
    `);
});
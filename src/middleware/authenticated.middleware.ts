import { Request, Response, NextFunction } from 'express';
import token from '@/utils/token';
import UserModel from '@/resources/user/user.model';
import Token from '@/utils/interfaces/token.interface';
import HttpException from '@/utils/exceptions/http.exception';
import jwt from 'jsonwebtoken';

async function authenticatedMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<Response | void> {
    const bearer = req.headers.authorization;

    if (!bearer || !bearer.startsWith('Bearer ')) {
        return next(new HttpException(401, 'Unauthorized'));
    }
    const accessToken = bearer.split('Bearer ')[1].trim();

    if (!accessToken) {
        return next(new HttpException(401, 'Unauthorized'));
    }

    try {
        const payloadVerifyAccessToken: Token | jwt.JsonWebTokenError =
            await token.verifyAccessToken(accessToken);

        if (payloadVerifyAccessToken instanceof jwt.JsonWebTokenError) {
            return next(new HttpException(401, 'Unauthorized'));
        }

        const user = await UserModel.findById(
            payloadVerifyAccessToken.id
        ).select(['-password']);

        if (!user) {
            return next(new HttpException(401, 'Unauthorized'));
        }

        req.user = user;

        return next();
    } catch (error: any) {
        return next(new HttpException(401, error.message));
    }
}

export { authenticatedMiddleware };

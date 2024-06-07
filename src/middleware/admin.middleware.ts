import { Request, Response, NextFunction } from 'express';
import HttpException from '@/utils/exceptions/http.exception';

async function adminMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    const secretKey = req.headers.secretkey;
    if (!secretKey || secretKey !== process.env.SECRET_KEY) {
        return next(new HttpException(403, 'No access'));
    }

    next();
}

export { adminMiddleware };
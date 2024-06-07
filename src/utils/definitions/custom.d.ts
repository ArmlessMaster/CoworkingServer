import User from '@/resources/user/user.interface';

declare global {
    namespace Express {
        export interface Request {
            user: User;
        }
    }
}

declare global {
    namespace Express {
        interface Request {
            properties: {
                [key: string]: any;
            };
        }
    }
}
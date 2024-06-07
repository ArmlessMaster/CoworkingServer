import { Router, Request, Response, NextFunction } from 'express';
import Controller from '@/utils/interfaces/controller.interface';
import UserService from '@/resources/user/user.service';
import validationMiddleware from '@/middleware/validation.middleware';
import validate from '@/resources/user/user.validation';
import { adminMiddleware } from '@/middleware/admin.middleware';
import HttpException from '@/utils/exceptions/http.exception';
import { authenticatedMiddleware } from '@/middleware/authenticated.middleware';

class UserController implements Controller {
    public path = '/user';
    public router = Router();
    private UserService = new UserService();

    constructor() {
        this.initialiseRoutes();
    }

    private initialiseRoutes(): void {
        this.router.post(
            `${this.path}`,
            validationMiddleware(validate.create),
            adminMiddleware,
            this.create
        );
        this.router.post(
            `${this.path}/login`,
            validationMiddleware(validate.login),
            this.login
        );
        this.router.get(`${this.path}`, authenticatedMiddleware, this.getMe);
    }

    private create = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            const { email, password } = req.properties;

            await this.UserService.create(email, password);

            res.status(204).send();
        } catch (error: any) {
            next(new HttpException(400, error.message));
        }
    };

    private login = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            const { email, password } = req.properties;

            const accessToken = await this.UserService.login(email, password);

            res.status(200).json({ data: accessToken });
        } catch (error: any) {
            next(new HttpException(400, error.message));
        }
    };

    private getMe = (
        req: Request,
        res: Response,
        next: NextFunction
    ): Response | void => {
        if (!req.user) {
            return next(new HttpException(404, 'No logged in'));
        }

        res.status(200).send({ data: req.user });
    };
}

export default UserController;

import { Router, Request, Response, NextFunction } from 'express';
import HttpException from '@/utils/exceptions/http.exception';
import CoworkingService from '@/resources/coworking/coworking.service';
import validationMiddleware from '@/middleware/validation.middleware';
import validate from '@/resources/coworking/coworking.validation';
import { authenticatedMiddleware } from '@/middleware/authenticated.middleware';
import upload from '@/utils/multer/multer';

class CoworkingController {
    public path = '/coworking';
    public router = Router();
    private coworkingService = new CoworkingService();

    constructor() {
        this.initialiseRoutes();
    }

    private initialiseRoutes(): void {
        this.router.get(
            `${this.path}/available-appointment-times`,
            validationMiddleware(validate.getAvailableAppointmentTimes),
            this.getAvailableAppointmentTimes
        );

        this.router.post(
            `${this.path}`,
            validationMiddleware(validate.create),
            authenticatedMiddleware,
            this.create
        );
        this.router.put(
            `${this.path}`,
            validationMiddleware(validate.update),
            authenticatedMiddleware,
            this.update
        );
        this.router.get(`${this.path}/get-one/:_id`, this.getOneById);
        this.router.get(
            `${this.path}`,
            validationMiddleware(validate.search),
            this.search
        );
        this.router.get(
            `${this.path}/admin-search`,
            validationMiddleware(validate.search),
            authenticatedMiddleware,
            this.adminSearch
        );
        this.router.delete(
            `${this.path}`,
            validationMiddleware(validate.remove),
            authenticatedMiddleware,
            this.remove
        );

        this.router.get(`${this.path}/price`, this.getMinMaxCoworkingPrice);
        this.router.get(
            `${this.path}/admin-price`,
            authenticatedMiddleware,
            this.getMinMaxCoworkingPriceAdmin
        );

        this.router.post(
            `${this.path}/image`,
            upload.single('file'),
            validationMiddleware(validate.uploadImage),
            authenticatedMiddleware,
            this.uploadImage
        );
        this.router.delete(
            `${this.path}/image`,
            validationMiddleware(validate.deleteImage),
            authenticatedMiddleware,
            this.deleteImage
        );

        this.router.post(
            `${this.path}/estimate`,
            validationMiddleware(validate.createEstimate),
            this.createEstimate
        );
        this.router.delete(
            `${this.path}/estimate`,
            validationMiddleware(validate.deleteEstimate),
            this.deleteEstimate
        );

        this.router.post(
            `${this.path}/survey`,
            validationMiddleware(validate.createSurvey),
            this.createSurvey
        );
        this.router.put(
            `${this.path}/survey-confirm`,
            validationMiddleware(validate.confirmSurvey),
            authenticatedMiddleware,
            this.confirmSurvey
        );
        this.router.put(
            `${this.path}/survey-remove`,
            validationMiddleware(validate.removeSurvey),
            authenticatedMiddleware,
            this.removeSurvey
        );
        this.router.get(
            `${this.path}/survey/get-one/:_id`,
            authenticatedMiddleware,
            this.getOneSurveyById
        );
        this.router.get(
            `${this.path}/survey-search`,
            validationMiddleware(validate.searchSurvey),
            authenticatedMiddleware,
            this.searchSurvey
        );
    }

    private getAvailableAppointmentTimes = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            const { _id, date, seatsNumber } = req.properties;

            const availableAppointmentTimes =
                await this.coworkingService.getAvailableAppointmentTimes(
                    _id,
                    date,
                    seatsNumber
                );

            res.status(200).json({ data: availableAppointmentTimes });
        } catch (error: any) {
            next(new HttpException(400, error.message));
        }
    };

    private create = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            if (!req.user) {
                return next(new HttpException(401, 'Unauthorized'));
            }
            const userId = req.user._id;

            const {
                name,
                region,
                city,
                address,
                phoneNumber,
                email,
                description,
                price,
                maxSeats,
                service,
                workSchedule,
            } = req.properties;

            const coworking = await this.coworkingService.create(
                userId,
                name,
                region,
                city,
                address,
                phoneNumber,
                email,
                description,
                price,
                maxSeats,
                service,
                workSchedule
            );

            res.status(201).json({ data: coworking });
        } catch (error: any) {
            next(new HttpException(400, error.message));
        }
    };

    private update = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            if (!req.user) {
                return next(new HttpException(401, 'Unauthorized'));
            }
            const userId = req.user._id;

            const {
                _id,
                name,
                region,
                city,
                address,
                phoneNumber,
                email,
                description,
                price,
                maxSeats,
                service,
                workSchedule,
            } = req.properties;

            const coworking = await this.coworkingService.update(
                _id,
                userId,
                name,
                region,
                city,
                address,
                phoneNumber,
                email,
                description,
                price,
                maxSeats,
                service,
                workSchedule
            );

            res.status(201).json({ data: coworking });
        } catch (error: any) {
            next(new HttpException(400, error.message));
        }
    };

    private getOneById = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            const coworking = await this.coworkingService.getOneById(
                req.params._id
            );

            res.status(200).json({ data: coworking });
        } catch (error: any) {
            next(new HttpException(400, error.message));
        }
    };

    private search = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            const searchOptions = req.properties as {
                [key: string]: any;
            };

            const coworkings = await this.coworkingService.search(
                searchOptions
            );

            res.status(200).json({ data: coworkings });
        } catch (error: any) {
            next(new HttpException(400, error.message));
        }
    };

    private adminSearch = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            if (!req.user) {
                return next(new HttpException(401, 'Unauthorized'));
            }
            const userId = req.user._id;

            const searchOptions = req.properties as {
                [key: string]: any;
            };

            const coworkings = await this.coworkingService.adminSearch(
                userId,
                searchOptions
            );

            res.status(200).json({ data: coworkings });
        } catch (error: any) {
            next(new HttpException(400, error.message));
        }
    };

    private remove = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            if (!req.user) {
                return next(new HttpException(401, 'Unauthorized'));
            }
            const userId = req.user._id;

            const { _id } = req.properties;

            const coworking = await this.coworkingService.remove(_id, userId);

            res.status(201).json({ data: coworking });
        } catch (error: any) {
            next(new HttpException(400, error.message));
        }
    };

    private getMinMaxCoworkingPrice = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            const prices =
                await this.coworkingService.getMinMaxCoworkingPrice();

            res.status(201).json({ data: prices });
        } catch (error: any) {
            next(new HttpException(400, error.message));
        }
    };

    private getMinMaxCoworkingPriceAdmin = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            if (!req.user) {
                return next(new HttpException(401, 'Unauthorized'));
            }
            const userId = req.user._id;

            const prices =
                await this.coworkingService.getMinMaxCoworkingPriceAdmin(
                    userId
                );

            res.status(201).json({ data: prices });
        } catch (error: any) {
            next(new HttpException(400, error.message));
        }
    };

    private uploadImage = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            const { _id, file } = req.properties;
            const userId = req.user._id;

            await this.coworkingService.uploadImage(_id, file, userId);

            res.status(204).send();
        } catch (error: any) {
            next(new HttpException(400, error.message));
        }
    };

    private deleteImage = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            const { _id, path } = req.properties;
            const userId = req.user._id;

            await this.coworkingService.deleteImage(_id, path, userId);

            res.status(204).send();
        } catch (error: any) {
            next(new HttpException(400, error.message));
        }
    };

    private createEstimate = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            const { userId, rating, review, _id } = req.properties;

            await this.coworkingService.createEstimate(
                userId,
                rating,
                review,
                _id
            );

            res.status(204).send();
        } catch (error: any) {
            next(new HttpException(400, error.message));
        }
    };

    private deleteEstimate = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            const { _id, estimateId, userId } = req.properties;

            await this.coworkingService.deleteEstimate(_id, estimateId, userId);

            res.status(204).send();
        } catch (error: any) {
            next(new HttpException(400, error.message));
        }
    };

    private createSurvey = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            const {
                _id,
                userId,
                name,
                email,
                phoneNumber,
                date,
                startTime,
                endTime,
                numberSeats,
            } = req.properties;

            const survey = await this.coworkingService.createSurvey(
                _id,
                userId,
                name,
                email,
                phoneNumber,
                date,
                startTime,
                endTime,
                numberSeats
            );

            res.status(201).json({ data: survey });
        } catch (error: any) {
            next(new HttpException(400, error.message));
        }
    };

    private confirmSurvey = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            if (!req.user) {
                return next(new HttpException(401, 'Unauthorized'));
            }
            const userId = req.user._id;

            const { _id, status } = req.properties;

            const survey = await this.coworkingService.confirmSurvey(
                userId,
                _id,
                status
            );

            res.status(201).json({ data: survey });
        } catch (error: any) {
            next(new HttpException(400, error.message));
        }
    };

    private removeSurvey = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            if (!req.user) {
                return next(new HttpException(401, 'Unauthorized'));
            }
            const userId = req.user._id;

            const { _id } = req.properties;

            const survey = await this.coworkingService.removeSurvey(
                userId,
                _id
            );

            res.status(201).json({ data: survey });
        } catch (error: any) {
            next(new HttpException(400, error.message));
        }
    };

    private getOneSurveyById = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            if (!req.user) {
                return next(new HttpException(401, 'Unauthorized'));
            }
            const userId = req.user._id;

            const survey = await this.coworkingService.getOneSurveyById(
                userId,
                req.params._id
            );

            res.status(200).json({ data: survey });
        } catch (error: any) {
            next(new HttpException(400, error.message));
        }
    };

    private searchSurvey = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            if (!req.user) {
                return next(new HttpException(401, 'Unauthorized'));
            }
            const userId = req.user._id;

            const searchOptions = req.properties as {
                [key: string]: any;
            };

            const surveys = await this.coworkingService.searchSurvey(
                userId,
                searchOptions
            );

            res.status(200).json({ data: surveys });
        } catch (error: any) {
            next(new HttpException(400, error.message));
        }
    };
}

export default CoworkingController;

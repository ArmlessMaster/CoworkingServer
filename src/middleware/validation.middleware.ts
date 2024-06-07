import { Request, Response, NextFunction, RequestHandler } from 'express';
import Joi from 'joi';

function validationMiddleware(schema: Joi.Schema): RequestHandler {
    return async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        const validationOptions = {
            abortEarly: false,
            allowUnknown: true,
            stripUnknown: true,
        };
        try {
            const data = {
                ...req.body,
                ...req.query,
                ...req.params,
                files: req.files,
                file: req.file,
            };

            for (const key in data) {
                if (data.hasOwnProperty(key)) {
                    try {
                        data[key] = JSON.parse(data[key]);
                    } catch (error) {}
                }
            }

            const value = await schema.validateAsync(data, validationOptions);
            req.properties = value;
            next();
        } catch (e: any) {
            const errors: string[] = [];
            e.details.forEach((error: Joi.ValidationErrorItem) => {
                errors.push(error.message);
            });
            res.status(400).send({ errors: errors });
        }
    };
}

export default validationMiddleware;

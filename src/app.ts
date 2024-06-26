import express, { Application } from 'express';
import mongoose from 'mongoose';
import compression from 'compression';
import cors from 'cors';
import morgan from 'morgan';
import Controller from '@/utils/interfaces/controller.interface';
import ErrorMiddleware from '@/middleware/error.middleware';
import helmet from 'helmet';
import cookie from 'cookie-parser';
import fs from 'fs';

class App {
    public express: Application;
    public port: number;

    constructor(controllers: Controller[], port: number) {
        this.express = express();
        this.port = port;

        this.initialiseFileStorage();
        this.initialiseDatabaseConnection();
        this.initialiseMiddleware();
        this.initialiseControllers(controllers);
        this.initialiseErrorHandling();
    }

    private initialiseMiddleware(): void {
        this.express.use(
            helmet({
                crossOriginResourcePolicy: false,
            })
        );
        this.express.use(
            cors({
                credentials: true,
                origin: [
                    `${process.env.FRONTEND_APP_URL}`,
                    `${process.env.MOBILE_APP_URL}`,
                    `${process.env.ADMIN_APP_URL}`,
                    `${process.env.BACKEND_APP_URL}`,
                    `${process.env.IP_URL_ONE}`,
                    `${process.env.IP_URL_TWO}`,
                ],
            })
        );
        this.express.use(morgan('dev'));
        this.express.use(express.json());
        this.express.use(express.urlencoded({ extended: false }));
        this.express.use(compression());
        this.express.use(cookie());
        this.express.use(
            `${process.env.UPLOADS_DESTINATION}`.substring(1),
            express.static(`${process.env.UPLOADS_DESTINATION}`)
        );
    }

    private initialiseFileStorage(): void {
        if (!fs.existsSync(`${process.env.UPLOADS_DESTINATION}`)) {
            fs.mkdirSync(`${process.env.UPLOADS_DESTINATION}`);
        }
    }

    private initialiseControllers(controllers: Controller[]): void {
        controllers.forEach((controller: Controller) => {
            this.express.use('/api', controller.router);
        });
    }

    private initialiseErrorHandling(): void {
        this.express.use(ErrorMiddleware);
    }

    private initialiseDatabaseConnection(): void {
        const { MONGO_USER, MONGO_PASSWORD, MONGO_PATH } = process.env;
        mongoose.set('strictQuery', true);
        mongoose.connect(
            `mongodb+srv://${MONGO_USER}:${MONGO_PASSWORD}${MONGO_PATH}`
        );
    }

    public listen(): void {
        this.express.listen(this.port, () => {
            console.log(`App listening on port ${this.port}`);
        });
    }
}

export default App;

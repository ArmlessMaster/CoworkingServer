"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const compression_1 = __importDefault(require("compression"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const error_middleware_1 = __importDefault(require("@/middleware/error.middleware"));
const helmet_1 = __importDefault(require("helmet"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const fs_1 = __importDefault(require("fs"));
class App {
    constructor(controllers, port) {
        this.express = (0, express_1.default)();
        this.port = port;
        this.initialiseFileStorage();
        this.initialiseDatabaseConnection();
        this.initialiseMiddleware();
        this.initialiseControllers(controllers);
        this.initialiseErrorHandling();
    }
    initialiseMiddleware() {
        this.express.use((0, helmet_1.default)({
            crossOriginResourcePolicy: true,
        }));
        this.express.use((0, cors_1.default)({
            credentials: true,
            origin: [
                `${process.env.FRONTEND_APP_URL}`,
                `${process.env.MOBILE_APP_URL}`,
                `${process.env.ADMIN_APP_URL}`,
                `${process.env.BACKEND_APP_URL}`,
            ],
        }));
        this.express.use((0, morgan_1.default)('dev'));
        this.express.use(express_1.default.json());
        this.express.use(express_1.default.urlencoded({ extended: false }));
        this.express.use((0, compression_1.default)());
        this.express.use((0, cookie_parser_1.default)());
        this.express.use(`${process.env.UPLOADS_DESTINATION}`.substring(1), express_1.default.static(`${process.env.UPLOADS_DESTINATION}`));
    }
    initialiseFileStorage() {
        if (!fs_1.default.existsSync(`${process.env.UPLOADS_DESTINATION}`)) {
            fs_1.default.mkdirSync(`${process.env.UPLOADS_DESTINATION}`);
        }
    }
    initialiseControllers(controllers) {
        controllers.forEach((controller) => {
            this.express.use('/api', controller.router);
        });
    }
    initialiseErrorHandling() {
        this.express.use(error_middleware_1.default);
    }
    initialiseDatabaseConnection() {
        const { MONGO_USER, MONGO_PASSWORD, MONGO_PATH } = process.env;
        mongoose_1.default.set('strictQuery', true);
        mongoose_1.default.connect(`mongodb+srv://${MONGO_USER}:${MONGO_PASSWORD}${MONGO_PATH}`);
    }
    listen() {
        this.express.listen(this.port, () => {
            console.log(`App listening on port ${this.port}`);
        });
    }
}
exports.default = App;

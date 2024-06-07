"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const envalid_1 = require("envalid");
function validateEnv() {
    (0, envalid_1.cleanEnv)(process.env, {
        NODE_ENV: (0, envalid_1.str)({
            choices: ['development', 'production'],
        }),
        PORT: (0, envalid_1.port)({ default: 5000 }),
        FRONTEND_APP_URL: (0, envalid_1.str)(),
        MOBILE_APP_URL: (0, envalid_1.str)(),
        ADMIN_APP_URL: (0, envalid_1.str)(),
        BACKEND_APP_URL: (0, envalid_1.str)(),
        JWT_ACCESS_SECRET: (0, envalid_1.str)(),
        JWT_ACCESS_SECRET_LIFETIME: (0, envalid_1.str)(),
        UPLOADS_DESTINATION: (0, envalid_1.str)(),
        MONGO_PATH: (0, envalid_1.str)(),
        MONGO_USER: (0, envalid_1.str)(),
        MONGO_PASSWORD: (0, envalid_1.str)(),
        SECRET_KEY: (0, envalid_1.str)(),
        MAILER_SMPT_HOST: (0, envalid_1.str)(),
        MAILER_SMPT_PORT: (0, envalid_1.num)(),
        MAILER_SMPT_SECURE: (0, envalid_1.bool)(),
        MAILER_SMPT_USER: (0, envalid_1.str)(),
        MAILER_SMPT_PASSWORD: (0, envalid_1.str)(),
    });
}
exports.default = validateEnv;

import { cleanEnv, str, port, num, bool } from 'envalid';

function validateEnv(): void {
    cleanEnv(process.env, {
        NODE_ENV: str({
            choices: ['development', 'production'],
        }),
        PORT: port({ default: 5000 }),
        FRONTEND_APP_URL: str(),
        MOBILE_APP_URL: str(),
        ADMIN_APP_URL: str(),
        BACKEND_APP_URL: str(),
        JWT_ACCESS_SECRET: str(),
        JWT_ACCESS_SECRET_LIFETIME: str(),
        UPLOADS_DESTINATION: str(),
        MONGO_PATH: str(),
        MONGO_USER: str(),
        MONGO_PASSWORD: str(),
        SECRET_KEY: str(),
        MAILER_SMPT_HOST: str(),
        MAILER_SMPT_PORT: num(),
        MAILER_SMPT_SECURE: bool(),
        MAILER_SMPT_USER: str(),
        MAILER_SMPT_PASSWORD: str(),
    });
}

export default validateEnv;
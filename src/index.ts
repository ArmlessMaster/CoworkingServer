import 'dotenv/config';
import 'module-alias/register';
import validateEnv from '@/utils/validateEnv';
import App from './app';
import UserController from '@/resources/user/user.controller';
import CoworkingController from '@/resources/coworking/coworking.controller';

validateEnv();

const app = new App(
    [new UserController(), new CoworkingController()],
    Number(process.env.PORT)
);

app.listen();

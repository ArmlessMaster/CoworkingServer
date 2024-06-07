import { Document } from 'mongoose';

export default interface User extends Document {
    email: string;
    password: string;

    getUpdate(): Promise<Error | Object>;
    setUpdate(obj: Object): Promise<Error | boolean>;
    isValidPassword(password: string): Promise<Error | boolean>;
}

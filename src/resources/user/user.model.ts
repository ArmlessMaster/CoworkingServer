import { Schema, model } from 'mongoose';
import bcrypt from 'bcrypt';
import User from '@/resources/user/user.interface';

const UserSchema = new Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        password: {
            type: String,
            trim: true,
        },
    },
    { timestamps: true }
);

UserSchema.pre<User>('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    if (this.password) {
        const hash = await bcrypt.hash(this.password, 10);
        this.password = hash;
    }
    next();
});

UserSchema.pre<User>('findOneAndUpdate', async function (this) {
    const update: any = { ...this.getUpdate() };
    if (update.password) {
        update.password = await bcrypt.hash(update.password, 10);
        this.setUpdate(update);
    }
});

UserSchema.methods.isValidPassword = async function (
    password: string
): Promise<Error | boolean> {
    return await bcrypt.compare(password, this.password);
};

export default model<User>('Users', UserSchema);

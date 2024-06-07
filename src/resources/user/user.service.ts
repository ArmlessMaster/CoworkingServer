import UserModel from '@/resources/user/user.model';
import token from '@/utils/token';

class UserService {
    private user = UserModel;

    public async create(
        email: string,
        password: string
    ): Promise<void | Error> {
        try {
            const exists = await this.user.findOne({ email });

            if (exists) {
                throw new Error('User already exists');
            }

            await this.user.create({
                email,
                password,
            });
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    public async login(
        email: string,
        password: string
    ): Promise<string | Error> {
        try {
            let user = await this.user.findOne({ email });

            if (!user) {
                throw new Error('Unable to find user with that data');
            }

            if (await user.isValidPassword(password)) {
                const accessToken = token.createAccessToken(user._id);

                return accessToken;
            } else {
                throw new Error('Wrong credentials given');
            }
        } catch (error: any) {
            throw new Error(error.message);
        }
    }
}

export default UserService;

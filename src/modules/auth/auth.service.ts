import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import db from '../../config/database';
import envConfig from '../../config/env';
import { IHrUser, IJwtPayload, ILoginPayload, ILoginResponse } from '../../types/auth.types';
import { HttpException } from '../../errors/HttpException';

export class AuthService {
  public async login(payload: ILoginPayload): Promise<ILoginResponse> {
    const { email, password } = payload;

    const user: IHrUser | undefined = await db('hr_users').where({ email }).first();

    if (!user) {
      throw HttpException.unauthorized('Invalid email or password.');
    }

    const isPasswordValid: boolean = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      throw HttpException.unauthorized('Invalid password.');
    }

    const jwtPayload: IJwtPayload = {
      id: user.id,
      email: user.email,
      name: user.name,
    };

    const signOptions: SignOptions = {
      expiresIn: envConfig.JWT_EXPIRES_IN as string & SignOptions['expiresIn'],
    };

    const token: string = jwt.sign(jwtPayload, envConfig.JWT_SECRET, signOptions);

    const response: ILoginResponse = {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };

    return response;
  }
}

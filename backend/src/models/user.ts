import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import UnauthorizedError from '../errors/unauthorized-error';
import { IUser, UserModel } from '../types';

const userSchema = new mongoose.Schema<IUser, UserModel>({
  name: {
    type: String,
    minlength: 2,
    maxlength: 30,
    default: 'Ё-мое',
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    minlength: 6,
    required: true,
    select: false,
  },
  tokens: {
    type: [{
      token: {
        type: String,
      },
    }],
    select: false,
  },
});

userSchema.static('findUserByCredentials', function mongooseMethod(email: string, password: string) {
  return this.findOne({ email }).select('+password').then((user) => {
    if (!user) {
      return Promise.reject(new UnauthorizedError('Неправильная почта или пароль'));
    }

    return bcrypt.compare(password, user.password).then((matched) => {
      if (!matched) {
        return Promise.reject(new UnauthorizedError('Неправильная почта или пароль'));
      }

      return user;
    });
  });
});

const userModel = mongoose.model<IUser, UserModel>('User', userSchema);

export default userModel;

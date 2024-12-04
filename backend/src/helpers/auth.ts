import ms from 'ms';
import { CookieOptions } from 'express';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import {
  AUTH_ACCESS_TOKEN_EXPIRY, AUTH_REFRESH_TOKEN_EXPIRY, REFRESH_SECRET_KEY, SECRET_KEY,
} from '../config';
import { UserDocument } from '../types';
import NotFoundError from '../errors/not-found-error';

export const checkUserExisting = (user: UserDocument | null) => {
  if (!user) {
    throw new NotFoundError('Пользователь по заданному id отсутствует в базе');
  }
};

export const generateAuthResponse = (user: UserDocument | null, accessToken: string, refreshToken: string) => {
  checkUserExisting(user);

  return {
    cookies: {
      name: 'refreshToken',
      value: refreshToken,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        secure: false,
        maxAge: ms(AUTH_REFRESH_TOKEN_EXPIRY),
        path: '/',
      } as CookieOptions,
    },
    body: {
      success: true,
      user: {
        name: user!.name,
        email: user!.email,
        id: user!._id.toString(),
      },
      accessToken,
    },
  };
};

export const generateUserResponse = (user: UserDocument | null) => {
  checkUserExisting(user);

  return {
    body: {
      success: true,
      user: {
        name: user!.name,
        email: user!.email,
        id: user!._id.toString(),
      },
    },
  };
};

export const generateLogoutResponse = (user: UserDocument | null) => {
  checkUserExisting(user);

  return {
    cookie: {
      name: 'refreshToken',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        secure: false,
        path: '/',
      } as CookieOptions,
    },
    body: {
      success: true,
    },
  };
};

export const signNewTokens = (userId: mongoose.Types.ObjectId) => {
  const accessToken = jwt.sign({ _id: userId }, SECRET_KEY, { expiresIn: AUTH_ACCESS_TOKEN_EXPIRY });
  const refreshToken = jwt.sign({ _id: userId }, REFRESH_SECRET_KEY, { expiresIn: AUTH_REFRESH_TOKEN_EXPIRY });

  return {
    accessToken,
    refreshToken,
  };
};

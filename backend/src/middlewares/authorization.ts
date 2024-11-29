import jwt from 'jsonwebtoken';
import { NextFunction, Response } from 'express';
import { AuthenticatedRequest } from '../types';
import UnauthorizedError from '../errors/unauthorized-error';
import { REFRESH_SECRET_KEY, SECRET_KEY } from '../config';

export const validateAccessToken = (req: AuthenticatedRequest, _: Response, next: NextFunction) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Необходима авторизация'));
  }

  const token = authorization.replace('Bearer ', '');
  let payload;

  try {
    payload = jwt.verify(token, SECRET_KEY);
  } catch (err) {
    return next(new UnauthorizedError('Невалидный токен'));
  }

  req.body.user = payload as jwt.JwtPayload;

  return next();
};

export const validateRefreshToken = (req: AuthenticatedRequest, _: Response, next: NextFunction) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return next(new UnauthorizedError('Необходима авторизация'));
  }

  let payload;

  try {
    payload = jwt.verify(refreshToken, REFRESH_SECRET_KEY);
  } catch (err) {
    return next(new UnauthorizedError('Невалидный токен'));
  }

  req.body.user = payload as jwt.JwtPayload;

  return next();
};

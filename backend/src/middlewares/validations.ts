import { celebrate, Joi, Segments } from 'celebrate';
import { NextFunction, Response } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest } from '../types';
import UnauthorizedError from '../errors/unauthorized-error';
import { REFRESH_SECRET_KEY, SECRET_KEY } from '../config';

const orderSchema = Joi.object().keys({
  email: Joi.string().email().required(),
  phone: Joi.string().required(),
  address: Joi.string().required(),
  payment: Joi.string().required().valid('card', 'online'),
  total: Joi.number(),
  items: Joi.array().not().empty(),
});

const productSchema = Joi.object({
  title: Joi.string().required().min(2).max(30),
  image: Joi.object({
    fileName: Joi.string().required(),
    originalName: Joi.string().required(),
  }),
  category: Joi.string().required(),
  description: Joi.string(),
  price: Joi.number().allow(null),
});

const userSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required().min(6).max(30),
  name: Joi.string(),
});

export const validateOrderBody = celebrate({
  [Segments.BODY]: orderSchema,
});

export const validateProductCreateBody = celebrate({
  [Segments.BODY]: productSchema,
});

export const validateUserBody = celebrate({
  [Segments.BODY]: userSchema,
});

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
  req.body.token = refreshToken;

  return next();
};

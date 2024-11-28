import jwt from 'jsonwebtoken';
import { NextFunction, Response } from 'express';
import { AuthenticatedRequest } from '../types/types';
import { SECRET_KEY } from '../config';

export default (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.status(401).send({
      message: 'Необходима авторизация',
    });
  }

  const token = authorization.replace('Bearer ', '');
  let payload;

  try {
    payload = jwt.verify(token, SECRET_KEY);
  } catch (err) {
    return res.status(401).send({
      message: 'Необходима авторизация',
    });
  }

  req.user = payload as jwt.JwtPayload;

  return next();
};

import { Request, Response, NextFunction } from 'express';
import NotFoundError from '../errors/not-found-error';

export const unknownRouteHandler = (_: Request, __: Response, next: NextFunction) => {
  next(new NotFoundError('Маршрут не найден'));
};

import {
  Request, Response, NextFunction, Router,
} from 'express';
import NotFoundError from '../errors/not-found-error';

const router = Router();

export default router.all('*', (_: Request, __: Response, next: NextFunction) => {
  next(new NotFoundError('Маршрут не найден'));
});

import { Response, Request, NextFunction } from 'express';
import NotFoundError from '../errors/not-found-error';
import BadRequestError from '../errors/bad-request-error';
import ConflictError from '../errors/conflict-error';

export const errorHandler = (err: unknown, _: Request, res: Response, __: NextFunction) => {
  if (err instanceof NotFoundError) {
    res.status(err.statusCode).send({
      message: err.message,
    });
    return;
  }

  if (err instanceof BadRequestError) {
    res.status(err.statusCode).send({
      message: err.message,
    });
    return;
  }

  if (err instanceof ConflictError) {
    res.status(err.statusCode).send({
      message: err.message,
    });
    return;
  }

  if (err instanceof NotFoundError) {
    res.status(err.statusCode).send({
      message: err.message,
    });
  }

  if (err instanceof Error) {
    res.status(500).send({
      message: err.message,
    });
  }
};

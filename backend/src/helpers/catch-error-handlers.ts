import { NextFunction } from 'express';
import { Error as MongooseError } from 'mongoose';
import BadRequestError from '../errors/bad-request-error';
import ConflictError from '../errors/conflict-error';

type ErrorType = 'handleDuplicate' | 'handleNotValidated';

const returnCatchErrorHandler = (next: NextFunction, type?: ErrorType) => {
  switch (type) {
    case 'handleDuplicate':
      return (err: any) => {
        if (err instanceof Error && err.message.includes('E11000')) {
          return next(new ConflictError(err.message));
        }
        if (err instanceof MongooseError.ValidationError) {
          return next(new BadRequestError(err.message));
        }
        return next(err);
      };
    case 'handleNotValidated':
      return (err: any) => {
        if (err instanceof MongooseError.ValidationError) {
          return next(new BadRequestError(err.message));
        }
        return next(err);
      };
    default: {
      return (err: any) => next(err);
    }
  }
};

export default returnCatchErrorHandler;

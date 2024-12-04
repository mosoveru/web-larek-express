import multer from 'multer';
import express, { NextFunction, Request, Response } from 'express';
import { MAXIMUM_FILE_SIZE, UPLOAD_PATH_TEMP } from '../config';
import BadRequestError from '../errors/bad-request-error';
/* global Express */

export const fileMiddleware = multer({
  fileFilter(_: express.Request, file: Express.Multer.File, callback: multer.FileFilterCallback) {
    const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/gif', 'image/svg+xml'];
    if (allowedTypes.includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(new BadRequestError('File extension does not match'));
    }
  },
  storage: multer.diskStorage({
    destination: (_, __, callback) => {
      callback(null, UPLOAD_PATH_TEMP);
    },
    filename: (_, file, callback) => {
      callback(null, file.originalname);
    },
  }),
});

export const checkFileSize = (req: Request, _: Response, next: NextFunction) => {
  const length = req.headers['content-length'];
  if (Number(length) > MAXIMUM_FILE_SIZE) {
    next(new BadRequestError('File size is too large'));
  } else {
    next();
  }
};

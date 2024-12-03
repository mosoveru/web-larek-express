import { NextFunction, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fakerEN } from '@faker-js/faker';
import { MAXIMUM_FILE_SIZE, UPLOAD_PATH, UPLOAD_PATH_TEMP } from '../config';
import BadRequestError from '../errors/bad-request-error';
import { defaultLogger } from '../middlewares/logger';
/* global Express */

const generateFileName = (file: Express.Multer.File) => {
  const uniqueName = fakerEN.string.alpha(8) + path.extname(file.filename);
  return path.join(`/${UPLOAD_PATH}/`, uniqueName);
};

export const uploadFile = (req: Request, res: Response) => {
  const file = req.file!;

  const fileName = generateFileName(file);

  res.status(200).send({
    originalName: file.originalname,
    fileName,
  });
};

export const clearTempFolder = () => {
  try {
    fs.readdir(UPLOAD_PATH_TEMP, (readdirErr, files) => {
      if (readdirErr) {
        throw new Error(readdirErr.message);
      } else {
        files.forEach((file) => {
          const filePath = path.join(UPLOAD_PATH_TEMP, file);
          fs.unlink(filePath, (unlinkErr) => {
            if (unlinkErr) {
              throw new Error(unlinkErr.message);
            }
          });
        });
      }
    });
  } catch (err) {
    if (err instanceof Error) {
      defaultLogger.error(err.message);
    } else {
      defaultLogger.error('Unknown Error Occurred While Cleaning Temp Files');
    }
  }
};

export const checkFileSize = (req: Request, _: Response, next: NextFunction) => {
  const length = req.headers['content-length'];
  if (Number(length) > MAXIMUM_FILE_SIZE) {
    next(new BadRequestError('File size is too large'));
  } else {
    next();
  }
};

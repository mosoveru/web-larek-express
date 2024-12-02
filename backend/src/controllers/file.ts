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

export const uploadFile = (req: Request, res: Response, next: NextFunction) => {
  const file = req.file!;

  if (file.size > MAXIMUM_FILE_SIZE) {
    next(new BadRequestError('File size is too large'));
    return;
  }

  const fileName = generateFileName(file);

  res.status(200).send({
    originalName: file.originalname,
    fileName,
  });
};

export const clearTempFolder = () => {
  try {
    fs.readdir(UPLOAD_PATH_TEMP, (err, files) => {
      if (err) {
        throw new Error(err.message);
      } else {
        files.forEach((file) => {
          const filePath = path.join(UPLOAD_PATH_TEMP, file);
          fs.unlink(filePath, (err) => {
            if (err) {
              throw new Error(err.message);
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

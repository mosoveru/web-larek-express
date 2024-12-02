import multer from 'multer';
import express from 'express';
import { UPLOAD_PATH_TEMP } from '../config';
import BadRequestError from '../errors/bad-request-error';
/* global Express */

const upload = multer({
  fileFilter(_: express.Request, file: Express.Multer.File, callback: multer.FileFilterCallback) {
    const allowedTypes = ['image/png', 'image/svg+xml'];
    if (allowedTypes.includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(new BadRequestError('File extension does not match or file size more than 100Kb'));
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

export default upload;

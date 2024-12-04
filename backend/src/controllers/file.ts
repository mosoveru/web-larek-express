import { Request, Response } from 'express';
import path from 'path';
import { fakerEN } from '@faker-js/faker';
import { UPLOAD_PATH } from '../config';
/* global Express */

const generateFileName = (file: Express.Multer.File) => {
  const uniqueName = fakerEN.string.alpha(8) + path.extname(file.filename);
  return path.join(`/${UPLOAD_PATH}/`, uniqueName);
};

const uploadFile = (req: Request, res: Response) => {
  const file = req.file!;

  const fileName = generateFileName(file);

  res.status(200).send({
    originalName: file.originalname,
    fileName,
  });
};

export default uploadFile;

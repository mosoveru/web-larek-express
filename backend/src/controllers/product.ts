import { Request, Response, NextFunction } from 'express';
import mongoose, { Error as MongooseError } from 'mongoose';
import path from 'path';
import fs from 'fs';
import Product from '../models/product';
import ConflictError from '../errors/conflict-error';
import BadRequestError from '../errors/bad-request-error';
import { UPLOAD_PATH_TEMP } from '../config';

export const getAllProducts = (_: Request, res: Response) => {
  Product.find({}).then((data) => {
    res.status(200).send({
      items: data,
      total: data.length,
    });
  });
};

export const createProduct = (req: Request, res: Response, next: NextFunction) => {
  const product = req.body;
  const COPY_FROM = path.join(__dirname, '../../', UPLOAD_PATH_TEMP, product.image.originalName);
  const COPY_TO = path.join(__dirname, '../', 'public/', product.image.fileName);

  fs.copyFile(COPY_FROM, COPY_TO, () => {});
  Product.create(product).then((data) => {
    res.status(201).send(data);
  }).catch((err) => {
    if (err instanceof Error && err.message.includes('E11000')) {
      next(new ConflictError(err.message));
    }
    if (err instanceof Error && err.message.includes('E11000')) {
      next(new ConflictError(err.message));
    }
    if (err instanceof MongooseError.ValidationError) {
      next(new BadRequestError(err.message));
    } else {
      next(err);
    }
  });
};

export const updateProduct = (req: Request, res: Response, next: NextFunction) => {
  const product = req.body;
  const productId = new mongoose.Types.ObjectId(req.params.productId);

  Product.findByIdAndUpdate(productId, { ...product }, { new: true }).then((data) => {
    if (product.image) {
      const COPY_FROM = path.join(__dirname, '../../', UPLOAD_PATH_TEMP, product.image.originalName);
      const COPY_TO = path.join(__dirname, '../', 'public/', product.image.fileName);

      fs.copyFile(COPY_FROM, COPY_TO, () => {});
    }
    res.status(200).send(data);
  }).catch((err) => {
    if (err instanceof Error && err.message.includes('E11000')) {
      next(new ConflictError(err.message));
    }
    if (err instanceof MongooseError.ValidationError) {
      next(new BadRequestError(err.message));
    } else {
      next(err);
    }
  });
};

export const deleteProduct = (req: Request, res: Response, next: NextFunction) => {
  const productId = new mongoose.Types.ObjectId(req.params.productId);

  Product.findOneAndDelete(productId).then((data) => {
    res.status(200).send(data);
  }).catch((err) => {
    if (err instanceof Error && err.message.includes('E11000')) {
      next(new ConflictError(err.message));
    }
    if (err instanceof MongooseError.ValidationError) {
      next(new BadRequestError(err.message));
    } else {
      next(err);
    }
  });
};

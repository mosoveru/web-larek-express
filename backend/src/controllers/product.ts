import { Request, Response } from 'express';
import Product from '../models/product';

export const getAllProducts = (_: Request, res: Response) => {
  Product.find({}).then((data) => {
    res.status(200).send({
      items: data,
      total: data.length,
    });
  });
};

export const createProduct = (req: Request, res: Response) => {
  const product = req.body;
  Product.create(product).then((data) => {
    res.status(200).send(data);
  }).catch((err) => {
    if (err.code === 11000) {
      res.status(409).send({
        message: 'Товар с таким заголовком уже существует',
      });
    } else {
      res.status(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: 'Validation Failed',
        validation: {
          body: {
            source: 'body',
            keys: Object.keys(err.errors),
            message: `${Object.keys(err.errors).join(' ')} is required`,
          },
        },
      });
    }
  });
};

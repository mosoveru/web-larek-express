import { Request, Response, NextFunction } from 'express';
import { Error, Types } from 'mongoose';
import { fakerEN } from '@faker-js/faker';
import Product from '../models/product';
import BadRequestError from '../errors/bad-request-error';

export const createOrder = (req: Request, res: Response, next: NextFunction) => {
  const orderRequest = req.body;
  const itemsSet = [...new Set(orderRequest.items)];
  const objectIds = orderRequest.items.map((item: string) => new Types.ObjectId(item));

  Product.find({
    _id: { $in: objectIds },
  }).then((data) => {
    const itemsDicrionary = new Map();
    data.forEach((item) => {
      itemsDicrionary.set(item._id.toString(), item.price);
    });
    let total = 0;
    itemsSet.forEach((item) => {
      if (!itemsDicrionary.has(item)) {
        throw new BadRequestError(`Товар с id ${item} не найден`);
      } else {
        const doc = itemsDicrionary.get(item);
        if (doc) {
          total += doc;
        } else {
          throw new BadRequestError(`Товар с id ${item} не продаётся`);
        }
      }
    });
    if (total === orderRequest.total) {
      res.status(200).send({
        message: total,
        id: fakerEN.string.uuid(),
      });
    } else {
      throw new BadRequestError('Неверная сумма заказа');
    }
  }).catch((err) => {
    if (err instanceof Error.ValidationError) {
      next(new BadRequestError(err.message));
    } else {
      next(err);
    }
  });
};

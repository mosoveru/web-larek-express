import { Request, Response, NextFunction } from 'express';
import { Error, Types } from 'mongoose';
import { fakerEN } from '@faker-js/faker';
import Product from '../models/product';
import BadRequestError from '../errors/bad-request-error';

const createOrder = (req: Request, res: Response, next: NextFunction) => {
  const orderRequest = req.body;
  const itemsSet = [...new Set(orderRequest.items)];
  const objectIds = orderRequest.items.map((item: string) => new Types.ObjectId(item));

  Product.find({
    _id: { $in: objectIds },
  }).then((data) => {
    const itemsDictionary = new Map();
    data.forEach((item) => {
      itemsDictionary.set(item._id.toString(), item.price);
    });
    let total = 0;
    itemsSet.forEach((item) => {
      if (!itemsDictionary.has(item)) {
        throw new BadRequestError(`Товар с id ${item} не найден`);
      } else {
        const doc = itemsDictionary.get(item);
        if (doc) {
          total += doc;
        } else {
          throw new BadRequestError(`Товар с id ${item} не продаётся`);
        }
      }
    });
    if (total === orderRequest.total) {
      res.status(200).send({
        total,
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

export default createOrder;

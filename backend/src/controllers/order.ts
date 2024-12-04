import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { fakerEN } from '@faker-js/faker';
import countOrderTotal from '../helpers/order';
import Product from '../models/product';
import BadRequestError from '../errors/bad-request-error';
import returnCatchErrorHandler from '../helpers/catch-error-handlers';

const createOrder = (req: Request, res: Response, next: NextFunction) => {
  const orderRequest = req.body;
  const itemsSet = [...new Set(orderRequest.items)] as string[];
  const objectIds = itemsSet.map((item: string) => new Types.ObjectId(item));

  Product.find({
    _id: { $in: objectIds },
  }).then((data) => {
    const total = countOrderTotal(data, orderRequest.items);
    if (total === orderRequest.total) {
      return res.status(200).send({
        total,
        id: fakerEN.string.uuid(),
      });
    }
    return Promise.reject(new BadRequestError('Неверная сумма заказа'));
  }).catch(returnCatchErrorHandler(next));
};

export default createOrder;

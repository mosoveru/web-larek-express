import { Request, Response } from 'express';
import { Joi } from 'celebrate';
import mongoose from 'mongoose';
import Product from '../models/product';

export const orderSchema = Joi.object().keys({
  email: Joi.string().email().required(),
  phone: Joi.string().required(),
  address: Joi.string().required(),
  payment: Joi.string().valid('card', 'online'),
  total: Joi.number(),
  items: Joi.array().not().empty(),
});

export const createOrder = (req: Request, res: Response) => {
  const orderRequest = req.body;
  const itemsSet = [...new Set(orderRequest.items)];
  const objectIds = orderRequest.items.map((item: string) => new mongoose.Types.ObjectId(item));

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
        throw new Error('Товара не существует');
      } else {
        const doc = itemsDicrionary.get(item);
        if (doc) {
          total += doc;
        } else {
          throw new Error('Товар не продаётся');
        }
      }
    });
    if (total === orderRequest.total) {
      res.status(200).send({
        message: 'Заказ создан',
      });
    } else {
      throw new Error('Неправильная сумма заказа');
    }
  }).catch((err) => {
    res.status(400).send({
      message: err.message,
    });
  });
};

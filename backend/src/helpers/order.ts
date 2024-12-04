import { ProductDocument } from '../types';
import BadRequestError from '../errors/bad-request-error';

const countOrderTotal = (products: ProductDocument[], orderProductsSet: unknown[]) => {
  const itemsDictionary = new Map();
  products.forEach((item) => {
    itemsDictionary.set(item._id.toString(), item.price);
  });
  let total = 0;
  orderProductsSet.forEach((item) => {
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

  return total;
};

export default countOrderTotal;

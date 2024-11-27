import {
  celebrate, Segments, errors, Joi,
} from 'celebrate';
import express from 'express';
import { createOrder } from '../controllers/order';

const orderSchema = Joi.object().keys({
  email: Joi.string().email().required(),
  phone: Joi.string().required(),
  address: Joi.string().required(),
  payment: Joi.string().valid('card', 'online'),
  total: Joi.number(),
  items: Joi.array().not().empty(),
});

const orderRouteValidator = celebrate({
  [Segments.BODY]: orderSchema,
});

const router = express.Router();

router.use(express.json());
router.use(orderRouteValidator);
router.use(errors());
router.post('/order', createOrder);

export default router;

import { celebrate, Segments, errors } from 'celebrate';
import express from 'express';
import { orderSchema, createOrder } from '../controllers/order';

const orderRouteValidator = celebrate({
  [Segments.BODY]: orderSchema,
});

const router = express.Router();

router.use(express.json());
router.use(orderRouteValidator);
router.use(errors());
router.post('/order', createOrder);

export default router;

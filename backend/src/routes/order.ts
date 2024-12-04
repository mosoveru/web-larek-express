import { errors } from 'celebrate';
import express from 'express';
import createOrder from '../controllers/order';
import { validateOrderBody } from '../middlewares/validations';

const router = express.Router();

router.use(express.json());
router.post('/order', validateOrderBody, errors(), createOrder);

export default router;

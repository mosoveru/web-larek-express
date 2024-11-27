import express from 'express';
import {
  Joi, celebrate, Segments, errors,
} from 'celebrate';
import { getAllProducts, createProduct } from '../controllers/product';

const productSchema = Joi.object({
  title: Joi.string().required().min(2).max(30),
  image: Joi.object({
    fileName: Joi.string().required(),
    originalName: Joi.string().required(),
  }),
  category: Joi.string().required(),
  description: Joi.string(),
  price: Joi.valid(Joi.number(), null),
});

const productRouteValidator = celebrate({
  [Segments.BODY]: productSchema,
});

const router = express.Router();

router.use(express.json());
router.use(productRouteValidator);
router.use(errors());
router.get('/product', getAllProducts);
router.post('/product', createProduct);

export default router;

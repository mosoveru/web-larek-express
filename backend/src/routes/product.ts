import express from 'express';
import { errors } from 'celebrate';
import { getAllProducts, createProduct } from '../controllers/product';
import { validateProductCreateBody } from '../middlewares/validations';

const router = express.Router();

router.get('/product', getAllProducts);
router.use(express.json());
router.post('/product', validateProductCreateBody, errors(), createProduct);

export default router;

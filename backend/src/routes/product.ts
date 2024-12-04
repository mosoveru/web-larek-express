import express from 'express';
import { errors } from 'celebrate';
import {
  getAllProducts, createProduct, updateProduct, deleteProduct,
} from '../controllers/product';
import { validateProductCreateBody } from '../middlewares/validations';
import { validateAccessToken } from '../middlewares/auth';

const router = express.Router();

router.get('/product', getAllProducts);
router.use(express.json());
router.post('/product', validateProductCreateBody, validateAccessToken, errors(), createProduct);
router.patch('/product/:productId', validateAccessToken, updateProduct);
router.delete('/product/:productId', validateAccessToken, deleteProduct);

export default router;

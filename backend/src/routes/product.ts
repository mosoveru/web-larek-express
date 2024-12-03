import express from 'express';
import { errors } from 'celebrate';
import {
  getAllProducts, createProduct, updateProduct, deleteProduct,
} from '../controllers/product';
import { validateAccessToken, validateProductCreateBody } from '../middlewares/validations';

const router = express.Router();

router.get('/product', getAllProducts);
router.use(express.json());
router.post('/product', validateProductCreateBody, validateAccessToken, errors(), createProduct);
router.patch('/product/:productId', validateAccessToken, updateProduct);
router.delete('/product/:productId', validateAccessToken, deleteProduct);

export default router;

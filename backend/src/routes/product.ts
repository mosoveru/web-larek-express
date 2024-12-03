import express from 'express';
import { errors } from 'celebrate';
import {
  getAllProducts, createProduct, updateProduct, deleteProduct,
} from '../controllers/product';
import { validateProductCreateBody } from '../middlewares/validations';

const router = express.Router();

router.get('/product', getAllProducts);
router.use(express.json());
router.post('/product', validateProductCreateBody, errors(), createProduct);
router.patch('/product/:productId', updateProduct);
router.delete('/product/:productId', deleteProduct);

export default router;

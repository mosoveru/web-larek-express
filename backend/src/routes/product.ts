import express from 'express';
import path from 'path';
import { getAllProducts, createProduct } from '../controllers/product';

const router = express.Router();

router.use(express.json());
router.use(express.static(path.join(__dirname, '../public')));
router.get('/product', getAllProducts);
router.post('/product', createProduct);

export default router;

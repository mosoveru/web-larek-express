import express from 'express';
import fileMiddleware from '../middlewares/file';
import { uploadFile } from '../controllers/file';

const router = express.Router();
router.post('/upload', fileMiddleware.single('file'), uploadFile);

export default router;

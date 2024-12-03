import express from 'express';
import fileMiddleware from '../middlewares/file';
import { checkFileSize, uploadFile } from '../controllers/file';
import { validateAccessToken } from '../middlewares/validations';

const router = express.Router();
router.post('/upload', validateAccessToken, checkFileSize, fileMiddleware.single('file'), uploadFile);

export default router;

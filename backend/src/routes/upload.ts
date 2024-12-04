import express from 'express';
import { checkFileSize, fileMiddleware } from '../middlewares/file';
import uploadFile from '../controllers/file';

import { validateAccessToken } from '../middlewares/auth';

const router = express.Router();
router.post('/upload', validateAccessToken, checkFileSize, fileMiddleware.single('file'), uploadFile);

export default router;

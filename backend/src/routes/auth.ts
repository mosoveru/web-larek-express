import express from 'express';
import { errors } from 'celebrate';
import {
  getCurrentUser, login, logout, refreshAccessToken, register,
} from '../controllers/auth';
import { validateUserBody } from '../middlewares/validations';
import { validateAccessToken, validateRefreshToken } from '../middlewares/auth';

const router = express.Router();

router.use(express.json());
router.post('/auth/login', validateUserBody, errors(), login);
router.post('/auth/register', validateUserBody, errors(), register);
router.get('/auth/token', validateRefreshToken, refreshAccessToken);
router.get('/auth/logout', validateRefreshToken, logout);
router.get('/auth/user', validateAccessToken, getCurrentUser);

export default router;

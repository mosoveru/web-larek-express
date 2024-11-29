import express from 'express';
import { errors } from 'celebrate';
import { login, logout, register } from '../controllers/auth';
import { validateUserBody } from '../middlewares/validations';
import { validateRefreshToken } from '../middlewares/authorization';

const router = express.Router();

router.use(express.json());
router.post('/auth/login', validateUserBody, errors(), login);
router.post('/auth/register', validateUserBody, errors(), register);
router.get('/auth/logout', validateRefreshToken, logout);

export default router;

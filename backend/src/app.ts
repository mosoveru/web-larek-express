import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import cookieParser from 'cookie-parser';
import { PORT, DB_ADDRESS, ORIGIN_ALLOW } from './config';
import productRouter from './routes/product';
import orderRouter from './routes/order';
import defaultRouter from './routes/index';
import authRouter from './routes/auth';
import handleErrors from './middlewares/error-handler';
import { requestLogger, errorLogger } from './middlewares/logger';

const app = express();

mongoose.connect(DB_ADDRESS);

app.use(cors({
  origin: ORIGIN_ALLOW,
  credentials: true,
}));
app.use(requestLogger);
app.use(cookieParser());
app.use(express.static(path.join(__dirname, './public')));
app.use(productRouter);
app.use(orderRouter);
app.use(authRouter);
app.use(defaultRouter);
app.use(errorLogger);
app.use(handleErrors);

app.listen(PORT);

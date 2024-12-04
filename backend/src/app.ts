import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import cookieParser from 'cookie-parser';
import { CronJob } from 'cron';
import {
  PORT, DB_ADDRESS, ORIGIN_ALLOW, CRON_SCHEDULE,
} from './config';
import productRouter from './routes/product';
import orderRouter from './routes/order';
import uploadRouter from './routes/upload';
import defaultRouter from './routes/index';
import authRouter from './routes/auth';
import handleErrors from './middlewares/error-handler';
import { requestLogger, errorLogger } from './middlewares/logger';
import clearTempFolder from './helpers/temp-cleaner';

const app = express();

mongoose.connect(DB_ADDRESS);
const job = CronJob.from({
  cronTime: CRON_SCHEDULE,
  onTick: clearTempFolder,
});
job.start();

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
app.use(uploadRouter);
app.use(defaultRouter);
app.use(errorLogger);
app.use(handleErrors);

app.listen(PORT);

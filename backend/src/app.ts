import express from 'express';
import 'dotenv/config';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import productRouter from './routes/product';
import orderRouter from './routes/order';
import defaultRouter from './routes/index';
import handleErrors from './middlewares/error-handler';
import { requestLogger, errorLogger } from './middlewares/logger';

const app = express();
const PORT = process.env.PORT || 3000;
const DB_ADDRESS = process.env.DB_ADDRESS || 'mongodb://127.0.0.1:27017';

mongoose.connect(DB_ADDRESS);

app.use(cors());
app.use(requestLogger);
app.use(express.static(path.join(__dirname, '../public')));
app.use(productRouter);
app.use(orderRouter);
app.use(defaultRouter);
app.use(errorLogger);
app.use(handleErrors);

app.listen(PORT, () => {
  console.log('Server running on port', PORT);
});

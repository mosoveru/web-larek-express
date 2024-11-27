import express from 'express';
import 'dotenv/config';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import productRouter from './routes/product';
import orderRouter from './routes/order';
import { errorHandler } from './middlewares/error-handler';
import { unknownRouteHandler } from './middlewares/unknown-route';

const app = express();
const PORT = process.env.PORT || 3000;
const DB_ADDRESS = process.env.DB_ADDRESS || 'mongodb://127.0.0.1:27017';

mongoose.connect(DB_ADDRESS);

app.use(cors());
app.use(express.static(path.join(__dirname, '../public')));
app.use(productRouter);
app.use(orderRouter);
app.use(unknownRouteHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log('Server running on port', PORT);
});

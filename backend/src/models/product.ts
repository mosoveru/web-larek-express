import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { IProduct } from '../types';

const productSchema = new mongoose.Schema<IProduct>({
  title: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 30,
    unique: true,
  },
  image: {
    fileName: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
  },
  category: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
  price: {
    type: Number,
    required: false,
    default: null,
  },
});

productSchema.post('deleteOne', (doc) => {
  const { fileName } = doc;
  const DELETE_FROM = path.join(__dirname, '../public', fileName);

  fs.rm(DELETE_FROM, {
    force: true,
  }, () => {

  });
});

export default mongoose.model<IProduct>('product', productSchema);

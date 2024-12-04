import jwt from 'jsonwebtoken';
import { Request } from 'express';
import mongoose from 'mongoose';

export interface AuthenticatedRequest extends Request {
  body: {
    user: jwt.JwtPayload
    token?: string;
  };
}

type Token = {
  token: string;
}

export interface IUser {
  name: string;
  email: string;
  password: string;
  tokens: Token[];
}

export type UserDocument = mongoose.Document<unknown, any, IUser> & IUser & { _id: mongoose.Types.ObjectId };

export interface UserModel extends mongoose.Model<IUser> {
  findUserByCredentials: (email: string, password: string) => Promise<UserDocument>;
}

export interface IProduct {
  title: string;
  image: {
    fileName: string;
    originalName: string;
  };
  category: string;
  description: string;
  price: number | null;
}

export type ProductDocument = mongoose.Document<unknown, {}, IProduct> & IProduct & { _id: mongoose.Types.ObjectId }

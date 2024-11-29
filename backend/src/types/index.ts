import jwt from 'jsonwebtoken';
import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  body: {
    user: jwt.JwtPayload
  };
}

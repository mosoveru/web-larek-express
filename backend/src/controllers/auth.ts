import {
  NextFunction, Response, Request, CookieOptions,
} from 'express';
import jwt from 'jsonwebtoken';
import ms from 'ms';
import bcrypt from 'bcrypt';
import mongoose, { Error as MongooseError } from 'mongoose';
import User from '../models/user';
import { AuthenticatedRequest, UserDocument } from '../types';
import NotFoundError from '../errors/not-found-error';
import {
  REFRESH_SECRET_KEY, SECRET_KEY, AUTH_REFRESH_TOKEN_EXPIRY, AUTH_ACCESS_TOKEN_EXPIRY,
} from '../config';
import ConflictError from '../errors/conflict-error';
import BadRequestError from '../errors/bad-request-error';

const checkUserExisting = (user: UserDocument | null) => {
  if (!user) {
    throw new NotFoundError('Пользователь по заданному id отсутствует в базе');
  }
};

const generateAuthResponse = (user: UserDocument | null, accessToken: string, refreshToken: string) => {
  checkUserExisting(user);

  return {
    cookies: {
      name: 'refreshToken',
      value: refreshToken,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        secure: false,
        maxAge: ms(AUTH_REFRESH_TOKEN_EXPIRY),
        path: '/',
      } as CookieOptions,
    },
    body: {
      success: true,
      user: {
        name: user!.name,
        email: user!.email,
        id: user!._id.toString(),
      },
      accessToken,
    },
  };
};

const generateUserResponse = (user: UserDocument | null) => {
  checkUserExisting(user);

  return {
    body: {
      success: true,
      user: {
        name: user!.name,
        email: user!.email,
        id: user!._id.toString(),
      },
    },
  };
};

const generateLogoutResponse = (user: UserDocument | null) => {
  checkUserExisting(user);

  return {
    cookie: {
      name: 'refreshToken',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        secure: false,
        path: '/',
      } as CookieOptions,
    },
    body: {
      success: true,
    },
  };
};

const signNewTokens = (userId: mongoose.Types.ObjectId) => {
  const accessToken = jwt.sign({ _id: userId }, SECRET_KEY, { expiresIn: AUTH_ACCESS_TOKEN_EXPIRY });
  const refreshToken = jwt.sign({ _id: userId }, REFRESH_SECRET_KEY, { expiresIn: AUTH_REFRESH_TOKEN_EXPIRY });

  return {
    accessToken,
    refreshToken,
  };
};

type ErrorsType = 'cast' | 'duplicate';

const returnAuthErrorHandler = (next: NextFunction, type?: ErrorsType) => {
  switch (type) {
    case 'cast': return (err: any) => {
      if (err instanceof MongooseError.CastError) {
        next(new BadRequestError('Невалидный id'));
      } else {
        next(err);
      }
    };
    case 'duplicate': return (err: any) => {
      if (err instanceof Error && err.message.includes('E11000')) {
        next(new ConflictError(err.message));
      } else {
        next(err);
      }
    };
    default: {
      return (err: any) => next(err);
    }
  }
};

export const getCurrentUser = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  User.findById(req.body.user._id).then((user) => {
    const { body } = generateUserResponse(user);

    return res.status(200).send(body);
  }).catch(returnAuthErrorHandler(next));
};

export const login = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  User.findUserByCredentials(email, password).then((foundUser) => {
    const { accessToken, refreshToken } = signNewTokens(foundUser._id);

    User.findByIdAndUpdate(foundUser._id, {
      $push: {
        tokens: {
          token: refreshToken,
        },
      },
    }, {
      new: true,
    }).then((user) => {
      const { body, cookies } = generateAuthResponse(user, accessToken, refreshToken);

      res.cookie(cookies.name, cookies.value, cookies.options);
      res.status(200).send(body);
    }).catch(returnAuthErrorHandler(next));
  }).catch(returnAuthErrorHandler(next));
};

export const register = (req: Request, res: Response, next: NextFunction) => {
  const { email, password, name } = req.body;

  bcrypt.hash(password, 10).then((hash) => {
    User.create({
      email,
      password: hash,
      name,
    }).then((createdUser) => {
      const { accessToken, refreshToken } = signNewTokens(createdUser._id);

      User.findByIdAndUpdate(createdUser._id, {
        $push: {
          tokens: {
            token: refreshToken,
          },
        },
      }, {
        new: true,
      }).then((user) => {
        const { body, cookies } = generateAuthResponse(user, accessToken, refreshToken);

        res.cookie(cookies.name, cookies.value, cookies.options);
        res.status(200).send(body);
      }).catch(returnAuthErrorHandler(next));
    }).catch(returnAuthErrorHandler(next, 'duplicate'));
  });
};

export const logout = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { refreshToken } = req.cookies;
  User.findByIdAndUpdate(req.body.user._id, {
    $pull: {
      tokens: {
        token: refreshToken,
      },
    },
  }, {
    new: true,
  }).then((user) => {
    const { body, cookie } = generateLogoutResponse(user);

    res.clearCookie(cookie.name, cookie.options);

    return res.status(200).send(body);
  }).catch(returnAuthErrorHandler(next, 'cast'));
};

export const refreshAccessToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { accessToken, refreshToken } = signNewTokens(req.body.user._id);

  User.findOneAndUpdate({
    _id: req.body.user._id,
    'tokens.token': req.body.token,
  }, {
    $set: {
      'tokens.$': {
        token: refreshToken,
      },
    },
  }, {
    new: true,
  }).then((user) => {
    const { body, cookies } = generateAuthResponse(user, accessToken, refreshToken);

    res.cookie(cookies.name, cookies.value, cookies.options);
    res.status(200).send(body);
  }).catch(returnAuthErrorHandler(next, 'cast'));
};

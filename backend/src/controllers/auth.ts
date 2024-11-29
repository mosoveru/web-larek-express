import { NextFunction, Response, Request } from 'express';
import jwt from 'jsonwebtoken';
import ms from 'ms';
import bcrypt from 'bcrypt';
import { Error as MongooseError } from 'mongoose';
import User from '../models/user';
import { AuthenticatedRequest } from '../types';
import NotFoundError from '../errors/not-found-error';
import {
  REFRESH_SECRET_KEY, SECRET_KEY, AUTH_REFRESH_TOKEN_EXPIRY, AUTH_ACCESS_TOKEN_EXPIRY,
} from '../config';
import ConflictError from '../errors/conflict-error';
import BadRequestError from '../errors/bad-request-error';

export const getCurrentUser = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  User.findOne({
    _id: req.body.user._id,
  }).then((user) => {
    if (!user) {
      return Promise.reject(new NotFoundError('Пользователь по заданному id отсутствует в базе'));
    }

    return res.status(200).send({
      user: {
        name: user.name,
        email: user.email,
        id: user._id.toString(),
      },
      success: true,
    });
  }).catch((err) => {
    next(err);
  });
};

export const login = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  User.findUserByCredentials(email, password).then((foundUser) => {
    const accessToken = jwt.sign({ _id: foundUser._id }, SECRET_KEY, { expiresIn: AUTH_ACCESS_TOKEN_EXPIRY });
    const refreshToken = jwt.sign({ _id: foundUser._id }, REFRESH_SECRET_KEY, { expiresIn: AUTH_REFRESH_TOKEN_EXPIRY });

    User.findByIdAndUpdate(foundUser._id, {
      $push: {
        tokens: {
          token: refreshToken,
        },
      },
    }, {
      new: true,
    }).then((user) => {
      if (!user) {
        return Promise.reject(new NotFoundError('Пользователь не найден'));
      }
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        sameSite: 'lax',
        secure: false,
        maxAge: ms(AUTH_REFRESH_TOKEN_EXPIRY),
        path: '/',
      });

      return res.status(200).send({
        success: true,
        user: {
          name: user.name,
          email: user.email,
          id: user._id.toString(),
        },
        accessToken,
      });
    }).catch((err) => {
      next(err);
    });
  }).catch((err) => {
    next(err);
  });
};

export const register = (req: Request, res: Response, next: NextFunction) => {
  const { email, password, name } = req.body;

  bcrypt.hash(password, 10).then((hash) => {
    User.create({
      email,
      password: hash,
      name,
    }).then((createdUser) => {
      const accessToken = jwt.sign({ _id: createdUser._id }, SECRET_KEY, { expiresIn: AUTH_ACCESS_TOKEN_EXPIRY });
      const refreshToken = jwt.sign({ _id: createdUser._id }, REFRESH_SECRET_KEY, { expiresIn: AUTH_REFRESH_TOKEN_EXPIRY });

      User.findByIdAndUpdate(createdUser._id, {
        $push: {
          tokens: {
            token: refreshToken,
          },
        },
      }, {
        new: true,
      }).then((user) => {
        if (!user) {
          return Promise.reject(new NotFoundError('Пользователь не найден'));
        }
        res.cookie('refreshToken', refreshToken, {
          httpOnly: true,
          sameSite: 'lax',
          secure: false,
          maxAge: ms(AUTH_REFRESH_TOKEN_EXPIRY),
          path: '/',
        });

        return res.status(200).send({
          success: true,
          user: {
            name: user.name,
            email: user.email,
            id: user._id.toString(),
          },
          accessToken,
        });
      }).catch((err) => {
        next(err);
      });
    }).catch((err) => {
      if (err instanceof Error && err.message.includes('E11000')) {
        next(new ConflictError(err.message));
      } else {
        next(err);
      }
    });
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
    if (!user) {
      return Promise.reject(new NotFoundError('Пользователь по заданному id отсутствует в базе'));
    }

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      maxAge: -1,
      path: '/',
    });

    return res.status(200).send({
      success: true,
    });
  }).catch((err) => {
    if (err instanceof MongooseError.CastError) {
      next(new BadRequestError('Невалидный id'));
    } else {
      next(err);
    }
  });
};

export const refreshAccessToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const accessToken = jwt.sign({ _id: req.body.user._id }, SECRET_KEY, { expiresIn: AUTH_ACCESS_TOKEN_EXPIRY });
  const refreshToken = jwt.sign({ _id: req.body.user._id }, REFRESH_SECRET_KEY, { expiresIn: AUTH_REFRESH_TOKEN_EXPIRY });

  User.findByIdAndUpdate({ _id: req.body.user._id }, {
    $push: {
      tokens: {
        token: refreshToken,
      },
    },
  }, {
    new: true,
  }).then((user) => {
    if (!user) {
      return Promise.reject(new NotFoundError('Пользователь по заданному id отсутствует в базе'));
    }

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      maxAge: -1,
      path: '/',
    });

    return res.status(200).send({
      success: true,
      user: {
        name: user.name,
        email: user.email,
        id: user._id.toString(),
      },
      accessToken,
    });
  }).catch((err) => {
    if (err instanceof MongooseError.CastError) {
      next(new BadRequestError('Невалидный id'));
    } else {
      next(err);
    }
  });
};

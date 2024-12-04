import {
  NextFunction, Response, Request,
} from 'express';
import bcrypt from 'bcrypt';
import User from '../models/user';
import { AuthenticatedRequest } from '../types';
import {
  generateAuthResponse,
  generateLogoutResponse,
  generateUserResponse,
  signNewTokens,
} from '../helpers/auth';
import returnCatchErrorHandler from '../helpers/catch-error-handlers';

export const getCurrentUser = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  User.findById(req.body.user._id).then((user) => {
    const { body } = generateUserResponse(user);

    return res.status(200).send(body);
  }).catch(returnCatchErrorHandler(next));
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
      runValidators: true,
    }).then((user) => {
      const { body, cookies } = generateAuthResponse(user, accessToken, refreshToken);

      res.cookie(cookies.name, cookies.value, cookies.options);
      res.status(200).send(body);
    }).catch(returnCatchErrorHandler(next, 'handleNotValidated'));
  }).catch(returnCatchErrorHandler(next));
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
        runValidators: true,
      }).then((user) => {
        const { body, cookies } = generateAuthResponse(user, accessToken, refreshToken);

        res.cookie(cookies.name, cookies.value, cookies.options);
        res.status(200).send(body);
      }).catch(returnCatchErrorHandler(next));
    }).catch(returnCatchErrorHandler(next, 'handleDuplicate'));
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
    runValidators: true,
  }).then((user) => {
    const { body, cookie } = generateLogoutResponse(user);

    res.clearCookie(cookie.name, cookie.options);

    return res.status(200).send(body);
  }).catch(returnCatchErrorHandler(next, 'handleNotValidated'));
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
    runValidators: true,
  }).then((user) => {
    const { body, cookies } = generateAuthResponse(user, accessToken, refreshToken);

    res.cookie(cookies.name, cookies.value, cookies.options);
    res.status(200).send(body);
  }).catch(returnCatchErrorHandler(next, 'handleNotValidated'));
};

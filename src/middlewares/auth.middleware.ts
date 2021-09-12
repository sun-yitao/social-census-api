import { NextFunction, Response } from 'express';
import { HttpException } from '@exceptions/HttpException';
import { RequestWithUser } from '@interfaces/auth.interface';

const admin = require('../firebase/firebase-config');

const authMiddleware = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    const Authorization = req.cookies['Authorization'] || req.header('Authorization').split('Bearer ')[1] || null;

    if (Authorization) {
      const firebaseUser = await admin.auth().verifyIdToken(Authorization);

      if (firebaseUser) {
        req.user = firebaseUser;
        next();
      } else {
        next(new HttpException(403, 'User not authorized.'));
      }
    } else {
      next(new HttpException(403, 'User not authorized.'));
    }
  } catch (error) {
    next(new HttpException(403, 'User not authorized.'));
  }
};

export default authMiddleware;

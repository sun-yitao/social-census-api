import { NextFunction, Request, Response } from 'express';

const axios = require('axios').default;
const admin = require("../firebase/firebase-config");
const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY;

class IndexController {
  public index = (req: Request, res: Response, next: NextFunction): void => {
    try {
      res.sendStatus(200);
    } catch (error) {
      next(error);
    }
  };

  public signIn = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const auth_response = await axios({
        url: `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`,
        method: 'post',
        data: {
          email: req.body.email,
          password: req.body.password,
          returnSecureToken: true
        },
        json: true,
      });    

      res.json({
        "jwt": auth_response.data.idToken
      });
    } catch (err) {
      next(err);
    }
  }
}

export default IndexController;

import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import authMiddleware from '@/middlewares/auth.middleware';
import UserController from '@/controllers/user.controller';

class UserRoute implements Routes {
  public path = '/account';
  public router = Router();
  public userController = new UserController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.delete(`${this.path}`, authMiddleware, this.userController.deleteAccount);
  }
}

export default UserRoute;

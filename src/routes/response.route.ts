import { Router } from 'express';
import ResponseController from '@controllers/response.controller';
import { Routes } from '@interfaces/routes.interface';
import authMiddleware from '@/middlewares/auth.middleware';

class ResponseRoute implements Routes {
  public path = '/questions/:questionId(\\d+)/responses';
  public router = Router();
  public responseController = new ResponseController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get('/responses', authMiddleware, this.responseController.list);
    this.router.post(`${this.path}`, authMiddleware, this.responseController.create);
  }
}

export default ResponseRoute;

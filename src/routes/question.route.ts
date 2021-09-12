import { Router } from 'express';
import QuestionController from '@controllers/question.controller';
import { Routes } from '@interfaces/routes.interface';
import authMiddleware from '@/middlewares/auth.middleware';

class QuestionRoute implements Routes {
  public path = '/questions';
  public router = Router();
  public questionController = new QuestionController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, authMiddleware, this.questionController.list);
  }
}

export default QuestionRoute;
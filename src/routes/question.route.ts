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
    this.router.get(`${this.path}/answered`, authMiddleware, this.questionController.getUserAnswered);
    this.router.get(`${this.path}/:questionId(\\d+)`, authMiddleware, this.questionController.get);
    this.router.get(`${this.path}/:questionId(\\d+)/statistics`, authMiddleware, this.questionController.getStatistics);
    this.router.get(`${this.path}/:questionId(\\d+)/userliked`, authMiddleware, this.questionController.getUserLikedComments);
  }
}

export default QuestionRoute;

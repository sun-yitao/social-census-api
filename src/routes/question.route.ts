import { Router } from 'express';
import QuestionController from '@controllers/question.controller';
import { Routes } from '@interfaces/routes.interface';

class QuestionRoute implements Routes {
  public path = '/questions';
  public router = Router();
  public questionController = new QuestionController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, this.questionController.list);
  }
}

export default QuestionRoute;

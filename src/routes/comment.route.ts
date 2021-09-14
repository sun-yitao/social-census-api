import { Router } from 'express';
import CommentController from '@controllers/comment.controller';
import { Routes } from '@interfaces/routes.interface';
import authMiddleware from '@/middlewares/auth.middleware';

class CommentRoute implements Routes {
  public path = '/questions/:questionId(\\d+)/comments';
  public router = Router();
  public commentController = new CommentController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, authMiddleware, this.commentController.list);
    this.router.post(`${this.path}`, authMiddleware, this.commentController.create);
  }
}

export default CommentRoute;

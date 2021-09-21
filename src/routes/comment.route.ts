import { Router } from 'express';
import CommentController from '@controllers/comment.controller';
import { Routes } from '@interfaces/routes.interface';
import authMiddleware from '@/middlewares/auth.middleware';
import LikeController from '@/controllers/like.controller';
import ReportController from '@/controllers/report.controller';

class CommentRoute implements Routes {
  public path = '/questions/:questionId(\\d+)/comments';
  public router = Router();
  public commentController = new CommentController();
  public likeController = new LikeController();
  public reportController = new ReportController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, authMiddleware, this.commentController.list);
    this.router.post(`${this.path}`, authMiddleware, this.commentController.create);
    this.router.delete(`${this.path}/:commentId(\\d+)`, authMiddleware, this.commentController.delete);
    this.router.post(`${this.path}/:commentId(\\d+)/likes`, authMiddleware, this.likeController.create);
    this.router.delete(`${this.path}/:commentId(\\d+)/likes`, authMiddleware, this.likeController.delete);
    this.router.post(`${this.path}/:commentId(\\d+)/reports`, authMiddleware, this.reportController.create);
    this.router.delete(`${this.path}/:commentId(\\d+)/reports`, authMiddleware, this.reportController.delete);
  }
}

export default CommentRoute;

import { Router } from 'express';
import MatchExclusionController from '@controllers/matchExclusion.controller';
import { Routes } from '@interfaces/routes.interface';
import authMiddleware from '@/middlewares/auth.middleware';

class MatchRoute implements Routes {
  public path = '/match';
  public router = Router();
  public matchExclusionController = new MatchExclusionController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    //this.router.get(`${this.path}`, authMiddleware, this.questionController.list);
    this.router.get(`${this.path}/exclusions`, authMiddleware, this.matchExclusionController.list);
    this.router.post(`${this.path}/exclusions`, authMiddleware, this.matchExclusionController.create);
    this.router.delete(`${this.path}/exclusions`, authMiddleware, this.matchExclusionController.delete);
  }
}

export default MatchRoute;

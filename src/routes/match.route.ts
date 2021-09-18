import { Router } from 'express';
import MatchExclusionController from '@controllers/matchExclusion.controller';
import { Routes } from '@interfaces/routes.interface';
import authMiddleware from '@/middlewares/auth.middleware';
import MatchController from '@/controllers/match.controller';

class MatchRoute implements Routes {
  public path = '/match';
  public router = Router();
  public matchController = new MatchController();
  public matchExclusionController = new MatchExclusionController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, authMiddleware, this.matchController.getMatchHistory);
    this.router.post(`${this.path}`, authMiddleware, this.matchController.fillMatch);
    this.router.get(`${this.path}/code`, authMiddleware, this.matchController.getMatchCode);
    this.router.get(`${this.path}/:matchId(\\d+)`, authMiddleware, this.matchController.getMatchReport);
    this.router.delete(`${this.path}/:matchId(\\d+)`, authMiddleware, this.matchController.deleteMatch);

    this.router.get(`${this.path}/exclusions`, authMiddleware, this.matchExclusionController.list);
    this.router.post(`${this.path}/exclusions`, authMiddleware, this.matchExclusionController.create);
    this.router.delete(`${this.path}/exclusions`, authMiddleware, this.matchExclusionController.delete);
  }
}

export default MatchRoute;

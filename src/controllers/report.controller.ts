import { NextFunction, Response } from 'express';
import { RequestWithUser } from '@/interfaces/auth.interface';
import ReportService from '@/services/report.service';
import { Report } from '.prisma/client';

class ReportController {
  public reportService = new ReportService();

  public create = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user.uid;
      const commentId = parseInt(req.params.commentId);

      const report: Report = await this.reportService.create({
        data: {
          uid: userId,
          commentId: commentId,
          reason: req.body.value.reason,
        },
        select: {
          uid: true,
          commentId: true,
        },
      });

      res.status(201);
      res.json({
        value: report,
      });
    } catch (error) {
      next(error);
    }
  };

  public delete = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user.uid;
      const commentId = parseInt(req.params.commentId);

      await this.reportService.unreport(userId, commentId);

      res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  };
}

export default ReportController;

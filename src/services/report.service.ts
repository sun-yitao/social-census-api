import { Report } from '.prisma/client';
import { HttpException } from '@/exceptions/HttpException';
import prismaClient from '@/prisma/client';
import Service from './service';

class ReportService extends Service {
  constructor() {
    super();
    super.resource = prismaClient.report;
  }

  public async unreport(uid: string, commentId: number): Promise<void> {
    const report: Report = await this.resource.findFirst({
      where: {
        uid: uid,
        commentId: commentId,
      },
    });
    if (report == null) {
      throw new HttpException(404, 'Report not found.');
    }

    await this.resource.deleteMany({
      where: {
        uid: uid,
        commentId: commentId,
      },
    });
  }
}

export default ReportService;

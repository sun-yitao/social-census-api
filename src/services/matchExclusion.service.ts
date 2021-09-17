import prismaClient from '@/prisma/client';
import Service from './service';
import { HttpException } from '@/exceptions/HttpException';
import { isEmpty } from '@utils/util';

class MatchExclusionService extends Service {
  constructor() {
    super();
    super.resource = prismaClient.matchExclusion;
  }

  public async deleteByQuestionId<Type>(uid: number, questionId: number): Promise<Type> {
    if (isEmpty(questionId)) throw new HttpException(400, 'Invalid question id');

    const one: Type = await this.resource.findFirst({ where: { uid: uid, questionId: questionId } });
    if (!one) throw new HttpException(404, `Id ${questionId} not found for ${uid}`);

    const deleteData = await this.resource.deleteMany({
      where: { uid: uid, questionId: questionId },
    });
    return deleteData;
  }
}

export default MatchExclusionService;

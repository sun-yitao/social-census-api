import { HttpException } from '@exceptions/HttpException';
import { isEmpty } from '@utils/util';

class Service {
  public resource;

  public async findAll<Type>(): Promise<Type[]> {
    const all: Type[] = await this.resource.findMany();
    return all;
  }

  public async findById<Type>(id: number): Promise<Type> {
    if (isEmpty(id)) throw new HttpException(400, 'Invalid id');

    const one: Type = await this.resource.findUnique({ where: { id: id } });
    if (!one) throw new HttpException(409, `Id ${id} not found`);

    return one;
  }

  public async create<Type>(data: object): Promise<Type> {
    if (isEmpty(data)) throw new HttpException(400, 'Empty data received');
    const createData: Type = await this.resource.create({ data: data });
    return createData;
  }

  public async update<Type>(id: number, data: object): Promise<Type> {
    if (isEmpty(data)) throw new HttpException(400, 'Empty data received');

    const one: Type = await this.resource.findUnique({ where: { id: id } });
    if (!one) throw new HttpException(409, `Id ${id} not found`);

    const updateData = await this.resource.update({ where: { id: id }, data: data });
    return updateData;
  }

  public async delete<Type>(id: number): Promise<Type> {
    if (isEmpty(id)) throw new HttpException(400, 'Invalid id');

    const one: Type = await this.resource.findUnique({ where: { id: id } });
    if (!one) throw new HttpException(409, `Id ${id} not found`);

    const deleteData = await this.resource.delete({ where: { id: id } });
    return deleteData;
  }
}

export default Service;

import { HttpException } from '@exceptions/HttpException';
import { isEmpty } from '@utils/util';

class Service {
  public resource;

  public async findMany<Type>(options?: object): Promise<Type[]> {
    const all: Type[] = await this.resource.findMany(options);
    return all;
  }

  public async findUnique<Type>(options?: object): Promise<Type> {
    const one: Type = await this.resource.findUnique(options);
    if (!one) throw new HttpException(404, `Resource not found`);
    return one;
  }

  public async findUniqueOptional<Type>(options?: object): Promise<Type | null> {
    const one: Type = await this.resource.findUnique(options);
    return one;
  }

  public async findFirstOptional<Type>(options?: object): Promise<Type | null> {
    const one: Type = await this.resource.findFirst(options);
    return one;
  }

  public async findById<Type>(id: number): Promise<Type> {
    if (isEmpty(id)) throw new HttpException(400, 'Invalid id');

    const one: Type = await this.resource.findUnique({ where: { id: id } });
    if (!one) throw new HttpException(404, `Id ${id} not found`);

    return one;
  }

  public async create<Type>(options: object): Promise<Type> {
    if (isEmpty(options)) throw new HttpException(400, 'Empty data received');
    const createData: Type = await this.resource.create(options);
    return createData;
  }

  public async createMany<Type>(options?: object): Promise<Type[]> {
    if (isEmpty(options)) throw new HttpException(400, 'Empty data received');
    const createData: Type[] = await this.resource.createMany(options);
    return createData;
  }

  public async update<Type>(id: number, data: object): Promise<Type> {
    if (isEmpty(data)) throw new HttpException(400, 'Empty data received');

    const one: Type = await this.resource.findUnique({ where: { id: id } });
    if (!one) throw new HttpException(404, `Id ${id} not found`);

    const updateData = await this.resource.update({ where: { id: id }, data: data });
    return updateData;
  }

  public async delete<Type>(id: number): Promise<Type> {
    if (isEmpty(id)) throw new HttpException(400, 'Invalid id');

    const one: Type = await this.resource.findUnique({ where: { id: id } });
    if (!one) throw new HttpException(404, `Id ${id} not found`);

    const deleteData = await this.resource.delete({ where: { id: id } });
    return deleteData;
  }

  public async deleteMany<Type>(options?: object): Promise<Type> {
    const deleteData = await this.resource.deleteMany(options);
    return deleteData;
  }
}

export default Service;

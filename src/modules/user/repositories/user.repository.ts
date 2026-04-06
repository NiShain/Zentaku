import type { DeepPartial, Repository } from 'typeorm';
import { BaseRepository } from '../../../core/base/BaseRepository';
import type { User } from '../../../entities/User.entity';

export interface IUserRepository {
  findById(id: number | bigint): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  create(data: DeepPartial<User>): Promise<User>;
  update(id: number | bigint, data: DeepPartial<User>): Promise<User | null>;
}

export class UserRepository extends BaseRepository<User> implements IUserRepository {
  constructor(repository: Repository<User>) {
    super(repository);
  }

  override async findById(id: number | bigint): Promise<User | null> {
    return super.findById(id);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.findOne({
      where: { email },
    });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.findOne({
      where: { username },
    });
  }

  async searchByDisplayName(searchTerm: string, take: number = 10): Promise<User[]> {
    return this.repository
      .createQueryBuilder('user')
      .where('LOWER(user.displayName) LIKE LOWER(:searchTerm)', { searchTerm: `%${searchTerm}%` })
      .take(take)
      .getMany();
  }
}

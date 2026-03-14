import type { Repository } from 'typeorm';
import { BaseRepository } from '../../../core/base/BaseRepository';
import type { User } from '../../../entities/User.entity';

export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  create(data: Partial<User>): Promise<User>;
}

export class UserRepository extends BaseRepository<User> implements IUserRepository {
  constructor(repository: Repository<User>) {
    super(repository);
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
}

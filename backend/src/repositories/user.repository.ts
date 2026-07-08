import { User, Prisma } from '@prisma/client';
import prisma from '../config/prisma';

export class UserRepository {
  async findByUsername(username: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { username },
    });
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return prisma.user.create({
      data,
    });
  }
}

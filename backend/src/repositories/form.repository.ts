import { Form, FormStatus } from '@prisma/client';
import prisma from '../config/prisma';
import { CreateFormDto, UpdateFormDto } from '../types';

export class FormRepository {
  async findAll(skip?: number, take?: number): Promise<Form[]> {
    return prisma.form.findMany({
      orderBy: { order: 'asc' },
      skip,
      take,
    });
  }

  async countAll(): Promise<number> {
    return prisma.form.count();
  }

  async findActive(): Promise<Form[]> {
    return prisma.form.findMany({
      where: { status: FormStatus.ACTIVE },
      orderBy: { order: 'asc' },
      include: {
        fields: {
          where: { deletedAt: null },
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  async findById(id: string) {
    return prisma.form.findUnique({
      where: { id },
      include: {
        fields: {
          where: { deletedAt: null },
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  async create(data: CreateFormDto): Promise<Form> {
    return prisma.form.create({
      data: {
        title: data.title,
        description: data.description,
        order: data.order ?? 0,
        status: data.status,
      },
    });
  }

  async update(id: string, data: UpdateFormDto): Promise<Form> {
    return prisma.form.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<Form> {
    return prisma.form.delete({
      where: { id },
    });
  }
}

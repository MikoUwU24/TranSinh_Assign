import { Field } from '@prisma/client';
import prisma from '../config/prisma';
import { CreateFieldDto, UpdateFieldDto } from '../types';

export class FieldRepository {
  async findById(id: string): Promise<Field | null> {
    return prisma.field.findFirst({
      where: { id, deletedAt: null },
    });
  }

  async create(formId: string, data: CreateFieldDto): Promise<Field> {
    return prisma.field.create({
      data: {
        formId,
        label: data.label,
        type: data.type,
        order: data.order ?? 0,
        required: data.required ?? false,
        options: data.options ? (data.options as any) : null,
      },
    });
  }

  async update(id: string, data: UpdateFieldDto): Promise<Field> {
    const updateData: any = {
      label: data.label,
      type: data.type,
      order: data.order,
      required: data.required,
    };
    if (data.options !== undefined) {
      updateData.options = data.options ? (data.options as any) : null;
    }
    return prisma.field.update({
      where: { id },
      data: updateData,
    });
  }

  async hasSubmissions(fieldId: string): Promise<boolean> {
    const count = await prisma.submissionAnswer.count({
      where: { fieldId },
    });
    return count > 0;
  }

  async softDelete(id: string): Promise<Field> {
    return prisma.field.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async hardDelete(id: string): Promise<Field> {
    return prisma.field.delete({
      where: { id },
    });
  }
}

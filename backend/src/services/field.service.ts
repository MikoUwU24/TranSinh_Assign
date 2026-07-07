import { FieldRepository } from '../repositories/field.repository';
import { FormRepository } from '../repositories/form.repository';
import { CreateFieldDto, UpdateFieldDto } from '../types';
import { notFound, badRequest } from '../middlewares/error-handler';
import { Field } from '@prisma/client';

export class FieldService {
  private fieldRepository = new FieldRepository();
  private formRepository = new FormRepository();

  async addField(formId: string, data: CreateFieldDto): Promise<Field> {
    const form = await this.formRepository.findById(formId);
    if (!form) {
      throw notFound(`Không tìm thấy form với ID: ${formId}`);
    }
    return this.fieldRepository.create(formId, data);
  }

  async updateField(formId: string, fieldId: string, data: UpdateFieldDto): Promise<Field> {
    const field = await this.fieldRepository.findById(fieldId);
    if (!field || field.formId !== formId) {
      throw notFound(`Không tìm thấy trường với ID: ${fieldId} trong form này`);
    }
    return this.fieldRepository.update(fieldId, data);
  }

  async deleteField(formId: string, fieldId: string): Promise<Field> {
    const field = await this.fieldRepository.findById(fieldId);
    if (!field || field.formId !== formId) {
      throw notFound(`Không tìm thấy trường với ID: ${fieldId} trong form này`);
    }

    const hasSubmissions = await this.fieldRepository.hasSubmissions(fieldId);
    if (hasSubmissions) {
      // Soft delete: keep the column data but hide it from the form builder
      return this.fieldRepository.softDelete(fieldId);
    } else {
      // Hard delete: remove completely
      return this.fieldRepository.hardDelete(fieldId);
    }
  }

  async reorderFields(formId: string, fieldOrders: { id: string; order: number }[]): Promise<void> {
    const form = await this.formRepository.findById(formId);
    if (!form) {
      throw notFound(`Không tìm thấy form với ID: ${formId}`);
    }

    // Verify all fields belong to the form
    const formFieldIds = form.fields.map((f) => f.id);
    for (const fo of fieldOrders) {
      if (!formFieldIds.includes(fo.id)) {
        throw badRequest(`Trường "${fo.id}" không thuộc form này`);
      }
    }

    // Run updates (can be in sequential promises or Promise.all)
    for (const fo of fieldOrders) {
      await this.fieldRepository.update(fo.id, { order: fo.order });
    }
  }
}

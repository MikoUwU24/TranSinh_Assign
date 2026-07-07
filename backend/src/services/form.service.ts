import { FormRepository } from '../repositories/form.repository';
import { CreateFormDto, UpdateFormDto, PaginatedResponse } from '../types';
import { notFound } from '../middlewares/error-handler';
import { Form } from '@prisma/client';

export class FormService {
  private formRepository = new FormRepository();

  async getAllForms(page = 1, limit = 10): Promise<PaginatedResponse<Form>> {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.formRepository.findAll(skip, limit),
      this.formRepository.countAll(),
    ]);

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getActiveFormsSorted(): Promise<Form[]> {
    return this.formRepository.findActive();
  }

  async getFormById(id: string) {
    const form = await this.formRepository.findById(id);
    if (!form) {
      throw notFound(`Không tìm thấy form với ID: ${id}`);
    }
    return form;
  }

  async createForm(data: CreateFormDto): Promise<Form> {
    return this.formRepository.create(data);
  }

  async updateForm(id: string, data: UpdateFormDto): Promise<Form> {
    await this.getFormById(id); // Throws NOT_FOUND if it doesn't exist
    return this.formRepository.update(id, data);
  }

  async deleteForm(id: string): Promise<Form> {
    await this.getFormById(id); // Throws NOT_FOUND if it doesn't exist
    return this.formRepository.delete(id);
  }
}

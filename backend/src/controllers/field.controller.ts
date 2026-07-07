import { Request, Response } from 'express';
import { FieldService } from '../services/field.service';
import { badRequest } from '../middlewares/error-handler';
import { FieldType } from '@prisma/client';

export class FieldController {
  private fieldService = new FieldService();

  addField = async (req: Request, res: Response): Promise<void> => {
    const formId = req.params.id as string;
    const { label, type, order, required, options } = req.body;

    if (!label || typeof label !== 'string' || label.trim() === '') {
      throw badRequest('Nhãn trường (label) là bắt buộc');
    }
    if (!type || !Object.values(FieldType).includes(type)) {
      throw badRequest(`Loại trường không hợp lệ. Phải là một trong: ${Object.values(FieldType).join(', ')}`);
    }

    if (type === FieldType.SELECT) {
      if (!options || !Array.isArray(options) || options.length === 0) {
        throw badRequest('Trường loại SELECT phải có danh sách options không rỗng');
      }
    }

    const data = await this.fieldService.addField(formId, {
      label: label.trim(),
      type,
      order: order !== undefined ? parseInt(order) : undefined,
      required: required !== undefined ? Boolean(required) : undefined,
      options: options ? options.map((opt: any) => String(opt).trim()) : undefined,
    });

    res.status(201).json({ success: true, data });
  };

  updateField = async (req: Request, res: Response): Promise<void> => {
    const formId = req.params.id as string;
    const fieldId = req.params.fid as string;
    const { label, type, order, required, options } = req.body;

    if (type !== undefined && !Object.values(FieldType).includes(type)) {
      throw badRequest(`Loại trường không hợp lệ. Phải là một trong: ${Object.values(FieldType).join(', ')}`);
    }

    if (type === FieldType.SELECT || (type === undefined && options !== undefined)) {
      if (options !== undefined && (!Array.isArray(options) || options.length === 0)) {
        throw badRequest('Trường loại SELECT phải có danh sách options không rỗng');
      }
    }

    const data = await this.fieldService.updateField(formId, fieldId, {
      label: label !== undefined ? label.trim() : undefined,
      type,
      order: order !== undefined ? parseInt(order) : undefined,
      required: required !== undefined ? Boolean(required) : undefined,
      options: options ? options.map((opt: any) => String(opt).trim()) : undefined,
    });

    res.json({ success: true, data });
  };

  deleteField = async (req: Request, res: Response): Promise<void> => {
    const formId = req.params.id as string;
    const fieldId = req.params.fid as string;
    await this.fieldService.deleteField(formId, fieldId);
    res.json({ success: true, data: { message: 'Xóa trường thành công' } });
  };

  reorderFields = async (req: Request, res: Response): Promise<void> => {
    const formId = req.params.id as string;
    const { fields } = req.body;

    if (!fields || !Array.isArray(fields)) {
      throw badRequest('Dữ liệu sắp xếp "fields" phải là một mảng [{id, order}]');
    }

    for (const item of fields) {
      if (!item.id || item.order === undefined || isNaN(parseInt(item.order))) {
        throw badRequest('Mỗi phần tử reorder phải chứa {id: string, order: number}');
      }
    }

    await this.fieldService.reorderFields(
      formId,
      fields.map((f: any) => ({ id: f.id, order: parseInt(f.order) }))
    );

    res.json({ success: true, data: { message: 'Sắp xếp các trường thành công' } });
  };
}

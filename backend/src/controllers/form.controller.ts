import { Request, Response } from 'express';
import { FormService } from '../services/form.service';
import { badRequest } from '../middlewares/error-handler';

export class FormController {
  private formService = new FormService();

  getAllForms = async (req: Request, res: Response): Promise<void> => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    
    if (page < 1 || limit < 1) {
      throw badRequest('Page và limit phải lớn hơn 0');
    }

    const data = await this.formService.getAllForms(page, limit);
    res.json({ success: true, data });
  };

  getActiveForms = async (_req: Request, res: Response): Promise<void> => {
    const data = await this.formService.getActiveFormsSorted();
    res.json({ success: true, data });
  };

  getFormById = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const data = await this.formService.getFormById(id);
    res.json({ success: true, data });
  };

  createForm = async (req: Request, res: Response): Promise<void> => {
    const { title, description, order, status } = req.body;
    if (!title || typeof title !== 'string' || title.trim() === '') {
      throw badRequest('Tiêu đề form là bắt buộc và phải là chuỗi');
    }

    const data = await this.formService.createForm({
      title: title.trim(),
      description,
      order: order !== undefined ? parseInt(order) : undefined,
      status,
    });
    res.status(201).json({ success: true, data });
  };

  updateForm = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { title, description, order, status } = req.body;

    const data = await this.formService.updateForm(id, {
      title: title !== undefined ? title.trim() : undefined,
      description,
      order: order !== undefined ? parseInt(order) : undefined,
      status,
    });
    res.json({ success: true, data });
  };

  deleteForm = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    await this.formService.deleteForm(id);
    res.json({ success: true, data: { message: 'Xóa form thành công' } });
  };
}

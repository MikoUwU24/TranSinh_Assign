import { Request, Response } from 'express';
import { SubmissionService } from '../services/submission.service';
import { badRequest } from '../middlewares/error-handler';

export class SubmissionController {
  private submissionService = new SubmissionService();

  submitForm = async (req: Request, res: Response): Promise<void> => {
    const formId = req.params.id as string;
    const { answers } = req.body;
    
    // Track who submitted from JWT
    const submittedBy = req.user ? req.user.username : null;

    if (answers !== undefined && !Array.isArray(answers)) {
      throw badRequest('Dữ liệu "answers" gửi lên phải là một mảng');
    }

    const data = await this.submissionService.submitForm(formId, submittedBy, {
      answers: answers || [],
    });

    res.status(201).json({ success: true, data });
  };

  listSubmissions = async (req: Request, res: Response): Promise<void> => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    if (page < 1 || limit < 1) {
      throw badRequest('Page và limit phải lớn hơn 0');
    }

    // Role filtering: SW users only see their own submissions, Admin sees all
    let submittedByFilter: string | undefined = undefined;
    if (req.user && req.user.role === 'sw') {
      submittedByFilter = req.user.username;
    }

    const data = await this.submissionService.getSubmissions(page, limit, submittedByFilter);
    res.json({ success: true, data });
  };
}

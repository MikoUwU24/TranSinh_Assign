import { SubmissionRepository } from '../repositories/submission.repository';
import { FormRepository } from '../repositories/form.repository';
import { SubmitFormDto, PaginatedResponse, ErrorDetail, FieldConfig } from '../types';
import { notFound, validationError } from '../middlewares/error-handler';
import { ValidatorFactory } from '../validators/validator.factory';

export class SubmissionService {
  private submissionRepository = new SubmissionRepository();
  private formRepository = new FormRepository();

  async getSubmissions(page = 1, limit = 10, submittedBy?: string) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.submissionRepository.findAll(skip, limit, submittedBy),
      this.submissionRepository.countAll(submittedBy),
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

  async submitForm(formId: string, submittedBy: string | null, data: SubmitFormDto) {
    // 1. Fetch form with active (non-deleted) fields
    const form = await this.formRepository.findById(formId);
    if (!form || form.status !== 'ACTIVE') {
      throw notFound(`Không tìm thấy form active với ID: ${formId}`);
    }

    const errors: ErrorDetail[] = [];
    const validatedAnswers: { fieldId: string; value: string | null }[] = [];

    // Map fields config
    const fieldsMap = new Map(form.fields.map((f) => [f.id, f]));

    // 2. Validate all configured fields
    for (const field of form.fields) {
      // Find matching answer from client
      const clientAnswer = data.answers?.find((a) => a.fieldId === field.id);
      const rawValue = clientAnswer !== undefined ? clientAnswer.value : null;

      // Map options from Prisma Json type
      let optionsArray: string[] | null = null;
      if (field.options) {
        try {
          optionsArray = typeof field.options === 'string' 
            ? JSON.parse(field.options) 
            : (field.options as string[]);
        } catch {
          optionsArray = null;
        }
      }

      const config: FieldConfig = {
        id: field.id,
        label: field.label,
        type: field.type,
        required: field.required,
        options: optionsArray,
      };

      const validator = ValidatorFactory.getValidator(field.type);
      const validationResult = validator.validate(rawValue, config);

      if (!validationResult.valid) {
        validationResult.errors.forEach((msg) => {
          errors.push({
            field: field.id,
            message: msg,
          });
        });
      } else {
        // Collect valid input. Normalize null or trim strings
        const valueToSave = rawValue !== null && rawValue !== undefined 
          ? String(rawValue).trim() 
          : null;
        validatedAnswers.push({
          fieldId: field.id,
          value: valueToSave,
        });
      }
    }

    // 3. Return all validation errors together if any exist
    if (errors.length > 0) {
      throw validationError(errors);
    }

    // 4. Save to database using transaction in repository
    return this.submissionRepository.create(formId, submittedBy, validatedAnswers);
  }
}

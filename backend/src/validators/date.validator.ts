import { FieldConfig, ValidationResult } from '../types';
import { FieldValidator, ok, fail } from './field-validator.interface';

export class DateValidator implements FieldValidator {
  validate(value: unknown, config: FieldConfig): ValidationResult {
    const isEmpty = value === null || value === undefined || value === '';

    // Skip when optional and empty
    if (!config.required && isEmpty) return ok();

    if (config.required && isEmpty) {
      return fail(`"${config.label}" là bắt buộc`);
    }

    const str = String(value).trim();

    // Validate ISO 8601 date format (YYYY-MM-DD or full ISO string)
    const date = new Date(str);
    if (isNaN(date.getTime())) {
      return fail(`"${config.label}" phải là ngày hợp lệ (ISO 8601)`);
    }

    // So sánh chỉ phần ngày (bỏ qua time) — ngày hôm nay được phép
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let inputDate: Date;
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
      const [year, month, day] = str.split('-').map(Number);
      inputDate = new Date(year, month - 1, day);
    } else {
      inputDate = new Date(date);
      inputDate.setHours(0, 0, 0, 0);
    }

    if (inputDate < today) {
      return fail(`"${config.label}" không được là ngày trong quá khứ`);
    }

    return ok();
  }
}

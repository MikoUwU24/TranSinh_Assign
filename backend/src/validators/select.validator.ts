import { FieldConfig, ValidationResult } from '../types';
import { FieldValidator, ok, fail } from './field-validator.interface';

export class SelectValidator implements FieldValidator {
  validate(value: unknown, config: FieldConfig): ValidationResult {
    const isEmpty = value === null || value === undefined || value === '';

    // Skip other rules when optional and empty
    if (!config.required && isEmpty) return ok();

    if (config.required && isEmpty) {
      return fail(`"${config.label}" là bắt buộc`);
    }

    // Config validation
    const options = config.options;
    if (!options || !Array.isArray(options) || options.length === 0) {
      return fail(`Lỗi cấu hình: Trường "${config.label}" không có danh sách lựa chọn`);
    }

    const strValue = String(value).trim();
    if (!options.includes(strValue)) {
      return fail(`"${config.label}" phải là một trong các giá trị: ${options.join(', ')}`);
    }

    return ok();
  }
}

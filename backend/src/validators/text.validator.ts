import { FieldConfig, ValidationResult } from '../types';
import { FieldValidator, ok, fail } from './field-validator.interface';

const MAX_TEXT_LENGTH = 200;

export class TextValidator implements FieldValidator {
  validate(value: unknown, config: FieldConfig): ValidationResult {
    const str = typeof value === 'string' ? value.trim() : '';

    // Skip other rules when optional and empty
    if (!config.required && str === '') return ok();

    const errors: string[] = [];

    if (config.required && str === '') {
      errors.push(`"${config.label}" là bắt buộc`);
    }

    if (str.length > MAX_TEXT_LENGTH) {
      errors.push(`"${config.label}" tối đa ${MAX_TEXT_LENGTH} ký tự (hiện tại: ${str.length})`);
    }

    return errors.length > 0 ? fail(...errors) : ok();
  }
}

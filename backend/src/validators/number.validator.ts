import { FieldConfig, ValidationResult } from '../types';
import { FieldValidator, ok, fail } from './field-validator.interface';

const MIN_VALUE = 0;
const MAX_VALUE = 100;

export class NumberValidator implements FieldValidator {
  validate(value: unknown, config: FieldConfig): ValidationResult {
    const isEmpty = value === null || value === undefined || value === '';

    // Skip when optional and empty
    if (!config.required && isEmpty) return ok();

    const errors: string[] = [];

    if (config.required && isEmpty) {
      errors.push(`"${config.label}" là bắt buộc`);
      return fail(...errors);
    }

    // Parse — accepts string or number from JSON body
    const num = Number(value);
    if (isNaN(num)) {
      return fail(`"${config.label}" phải là số hợp lệ`);
    }

    if (num < MIN_VALUE || num > MAX_VALUE) {
      errors.push(`"${config.label}" phải trong khoảng [${MIN_VALUE}, ${MAX_VALUE}]`);
    }

    return errors.length > 0 ? fail(...errors) : ok();
  }
}

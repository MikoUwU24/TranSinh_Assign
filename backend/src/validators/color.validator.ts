import { FieldConfig, ValidationResult } from '../types';
import { FieldValidator, ok, fail } from './field-validator.interface';

const HEX_COLOR_REGEX = /^#[0-9A-Fa-f]{6}$/;

export class ColorValidator implements FieldValidator {
  validate(value: unknown, config: FieldConfig): ValidationResult {
    const isEmpty = value === null || value === undefined || value === '';

    // Skip other rules when optional and empty
    if (!config.required && isEmpty) return ok();

    if (config.required && isEmpty) {
      return fail(`"${config.label}" là bắt buộc`);
    }

    const str = String(value).trim();
    if (!HEX_COLOR_REGEX.test(str)) {
      return fail(`"${config.label}" phải là mã màu HEX hợp lệ (dạng #RRGGBB)`);
    }

    return ok();
  }
}

import { FieldType } from '@prisma/client';
import { FieldValidator } from './field-validator.interface';
import { TextValidator } from './text.validator';
import { NumberValidator } from './number.validator';
import { DateValidator } from './date.validator';
import { ColorValidator } from './color.validator';
import { SelectValidator } from './select.validator';

const validators: Record<FieldType, FieldValidator> = {
  [FieldType.TEXT]: new TextValidator(),
  [FieldType.NUMBER]: new NumberValidator(),
  [FieldType.DATE]: new DateValidator(),
  [FieldType.COLOR]: new ColorValidator(),
  [FieldType.SELECT]: new SelectValidator(),
};

export class ValidatorFactory {
  static getValidator(type: FieldType): FieldValidator {
    const validator = validators[type];
    if (!validator) {
      throw new Error(`Unsupported field type: ${type}`);
    }
    return validator;
  }
}

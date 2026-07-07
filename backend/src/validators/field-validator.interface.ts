import { FieldConfig, ValidationResult } from '../types';

/**
 * Strategy interface mọi field validator phải implement
 */
export interface FieldValidator {
  validate(value: unknown, config: FieldConfig): ValidationResult;
}

/** Helper tạo valid result */
export const ok = (): ValidationResult => ({ valid: true, errors: [] });

/** Helper tạo invalid result */
export const fail = (...errors: string[]): ValidationResult => ({ valid: false, errors });

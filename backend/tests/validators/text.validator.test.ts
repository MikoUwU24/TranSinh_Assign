import { describe, it, expect } from 'vitest';
import { TextValidator } from '../../src/validators/text.validator';
import { FieldConfig } from '../../src/types';
import { FieldType } from '@prisma/client';

describe('TextValidator', () => {
  const validator = new TextValidator();
  
  const baseConfig: FieldConfig = {
    id: 'field-1',
    label: 'Họ và tên',
    type: FieldType.TEXT,
    required: true,
    options: null,
  };

  it('should pass with a valid string when required', () => {
    const res = validator.validate('Nguyễn Văn A', baseConfig);
    expect(res.valid).toBe(true);
    expect(res.errors).toHaveLength(0);
  });

  it('should fail when required but value is empty', () => {
    const res = validator.validate('', baseConfig);
    expect(res.valid).toBe(false);
    expect(res.errors[0]).toContain('bắt buộc');
  });

  it('should fail when required but value is whitespace', () => {
    const res = validator.validate('   ', baseConfig);
    expect(res.valid).toBe(false);
    expect(res.errors[0]).toContain('bắt buộc');
  });

  it('should pass when optional and empty', () => {
    const config = { ...baseConfig, required: false };
    const res = validator.validate('', config);
    expect(res.valid).toBe(true);
  });

  it('should fail when string exceeds 200 characters', () => {
    const longString = 'a'.repeat(201);
    const res = validator.validate(longString, baseConfig);
    expect(res.valid).toBe(false);
    expect(res.errors[0]).toContain('tối đa 200 ký tự');
  });
});

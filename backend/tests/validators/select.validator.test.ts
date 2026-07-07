import { describe, it, expect } from 'vitest';
import { SelectValidator } from '../../src/validators/select.validator';
import { FieldConfig } from '../../src/types';
import { FieldType } from '@prisma/client';

describe('SelectValidator', () => {
  const validator = new SelectValidator();

  const baseConfig: FieldConfig = {
    id: 'field-5',
    label: 'Vai trò',
    type: FieldType.SELECT,
    required: true,
    options: ['Admin', 'SW', 'Manager'],
  };

  it('should pass with a value in options', () => {
    const res = validator.validate('SW', baseConfig);
    expect(res.valid).toBe(true);
  });

  it('should fail with a value not in options', () => {
    const res = validator.validate('Guest', baseConfig);
    expect(res.valid).toBe(false);
    expect(res.errors[0]).toContain('một trong các giá trị');
  });

  it('should fail when config has no options', () => {
    const config = { ...baseConfig, options: null };
    const res = validator.validate('SW', config);
    expect(res.valid).toBe(false);
    expect(res.errors[0]).toContain('Lỗi cấu hình');
  });

  it('should fail when config has empty options list', () => {
    const config = { ...baseConfig, options: [] };
    const res = validator.validate('SW', config);
    expect(res.valid).toBe(false);
    expect(res.errors[0]).toContain('Lỗi cấu hình');
  });

  it('should fail when required and empty', () => {
    const res = validator.validate('', baseConfig);
    expect(res.valid).toBe(false);
    expect(res.errors[0]).toContain('bắt buộc');
  });

  it('should pass when optional and empty', () => {
    const config = { ...baseConfig, required: false };
    const res = validator.validate('', config);
    expect(res.valid).toBe(true);
  });
});

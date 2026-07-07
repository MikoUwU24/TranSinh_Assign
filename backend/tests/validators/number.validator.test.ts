import { describe, it, expect } from 'vitest';
import { NumberValidator } from '../../src/validators/number.validator';
import { FieldConfig } from '../../src/types';
import { FieldType } from '@prisma/client';

describe('NumberValidator', () => {
  const validator = new NumberValidator();

  const baseConfig: FieldConfig = {
    id: 'field-2',
    label: 'Điểm số',
    type: FieldType.NUMBER,
    required: true,
    options: null,
  };

  it('should pass with a valid number in range [0, 100]', () => {
    const res1 = validator.validate(50, baseConfig);
    expect(res1.valid).toBe(true);

    const res2 = validator.validate('75', baseConfig); // String that parses to number
    expect(res2.valid).toBe(true);

    const res3 = validator.validate(0, baseConfig);
    expect(res3.valid).toBe(true);

    const res4 = validator.validate(100, baseConfig);
    expect(res4.valid).toBe(true);
  });

  it('should fail when required and value is empty', () => {
    const res = validator.validate('', baseConfig);
    expect(res.valid).toBe(false);
    expect(res.errors[0]).toContain('bắt buộc');
  });

  it('should pass when optional and empty', () => {
    const config = { ...baseConfig, required: false };
    const res = validator.validate('', config);
    expect(res.valid).toBe(true);
  });

  it('should fail with non-numeric value', () => {
    const res = validator.validate('abc', baseConfig);
    expect(res.valid).toBe(false);
    expect(res.errors[0]).toContain('số hợp lệ');
  });

  it('should fail when number is out of range [0, 100]', () => {
    const resLow = validator.validate(-1, baseConfig);
    expect(resLow.valid).toBe(false);
    expect(resLow.errors[0]).toContain('trong khoảng [0, 100]');

    const resHigh = validator.validate(101, baseConfig);
    expect(resHigh.valid).toBe(false);
    expect(resHigh.errors[0]).toContain('trong khoảng [0, 100]');
  });
});

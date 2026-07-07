import { describe, it, expect } from 'vitest';
import { DateValidator } from '../../src/validators/date.validator';
import { FieldConfig } from '../../src/types';
import { FieldType } from '@prisma/client';

describe('DateValidator', () => {
  const validator = new DateValidator();

  const baseConfig: FieldConfig = {
    id: 'field-3',
    label: 'Ngày hẹn',
    type: FieldType.DATE,
    required: true,
    options: null,
  };

  it('should pass with today date', () => {
    const todayObj = new Date();
    const year = todayObj.getFullYear();
    const month = String(todayObj.getMonth() + 1).padStart(2, '0');
    const day = String(todayObj.getDate()).padStart(2, '0');
    const today = `${year}-${month}-${day}`;
    const res = validator.validate(today, baseConfig);
    expect(res.valid).toBe(true);
  });

  it('should pass with a future date', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    const res = validator.validate(tomorrowStr, baseConfig);
    expect(res.valid).toBe(true);
  });

  it('should fail with a past date', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const res = validator.validate(yesterdayStr, baseConfig);
    expect(res.valid).toBe(false);
    expect(res.errors[0]).toContain('quá khứ');
  });

  it('should fail with invalid date format', () => {
    const res = validator.validate('invalid-date', baseConfig);
    expect(res.valid).toBe(false);
    expect(res.errors[0]).toContain('ngày hợp lệ');
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

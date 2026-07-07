import { describe, it, expect } from 'vitest';
import { ColorValidator } from '../../src/validators/color.validator';
import { FieldConfig } from '../../src/types';
import { FieldType } from '@prisma/client';

describe('ColorValidator', () => {
  const validator = new ColorValidator();

  const baseConfig: FieldConfig = {
    id: 'field-4',
    label: 'Màu nền',
    type: FieldType.COLOR,
    required: true,
    options: null,
  };

  it('should pass with a valid hex color code (#RRGGBB)', () => {
    const res1 = validator.validate('#ffffff', baseConfig);
    expect(res1.valid).toBe(true);

    const res2 = validator.validate('#FF0033', baseConfig);
    expect(res2.valid).toBe(true);

    const res3 = validator.validate('#123456', baseConfig);
    expect(res3.valid).toBe(true);
  });

  it('should fail with invalid formats', () => {
    const invalidColors = [
      '#fff',       // Shorthand hex (required is 6 digits per AGENTS.md rule: ^#[0-9A-Fa-f]{6}$)
      '#gggggg',    // Invalid hex chars
      'rgb(0,0,0)', // RGB style
      'red',        // Named color
      '#FF003344',  // Hex with alpha
    ];

    for (const val of invalidColors) {
      const res = validator.validate(val, baseConfig);
      expect(res.valid).toBe(false);
      expect(res.errors[0]).toContain('mã màu HEX hợp lệ');
    }
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

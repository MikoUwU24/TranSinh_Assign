import { FormStatus, FieldType } from '@prisma/client';

// ── Common ────────────────────────────────────────────────────────────────────

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: {
    code: ErrorCode;
    message: string;
    details?: ErrorDetail[];
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export interface ErrorDetail {
  field?: string;
  message: string;
}

export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'BAD_REQUEST'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'INTERNAL_ERROR';

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: PaginationMeta;
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export type UserRole = 'admin' | 'sw';

export interface JwtPayload {
  username: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

// Extend Express Request to carry authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

// ── Form ──────────────────────────────────────────────────────────────────────

export interface CreateFormDto {
  title: string;
  description?: string;
  order?: number;
  status?: FormStatus;
}

export interface UpdateFormDto {
  title?: string;
  description?: string;
  order?: number;
  status?: FormStatus;
}

// ── Field ─────────────────────────────────────────────────────────────────────

export interface CreateFieldDto {
  label: string;
  type: FieldType;
  order?: number;
  required?: boolean;
  options?: string[];
}

export interface UpdateFieldDto {
  label?: string;
  type?: FieldType;
  order?: number;
  required?: boolean;
  options?: string[];
}

// ── Submission ────────────────────────────────────────────────────────────────

export interface SubmitFormDto {
  answers: SubmitAnswerDto[];
}

export interface SubmitAnswerDto {
  fieldId: string;
  value: string | null;
}

// ── Validator ─────────────────────────────────────────────────────────────────

export interface FieldConfig {
  id: string;
  label: string;
  type: FieldType;
  required: boolean;
  options: string[] | null;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

import { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * Bọc async route handler để tự động forward lỗi tới errorHandler
 * Controller không cần tự viết try/catch
 */
export function asyncWrapper(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
): RequestHandler {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
}

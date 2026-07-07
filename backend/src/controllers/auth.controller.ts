import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { badRequest } from '../middlewares/error-handler';

const JWT_SECRET = process.env.JWT_SECRET ?? 'supersecret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '7d';

const ADMIN_USERNAME = process.env.ADMIN_USERNAME ?? 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'Admin@123';
const SW_USERNAME = process.env.SW_USERNAME ?? 'sw_user';
const SW_PASSWORD = process.env.SW_PASSWORD ?? 'SW@123';

export class AuthController {
  static login(req: Request, res: Response): void {
    const { username, password } = req.body;

    if (!username || !password) {
      throw badRequest('Tên đăng nhập và mật khẩu là bắt buộc');
    }

    let role: 'admin' | 'sw' | null = null;

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      role = 'admin';
    } else if (username === SW_USERNAME && password === SW_PASSWORD) {
      role = 'sw';
    }

    if (!role) {
      throw badRequest('Tài khoản hoặc mật khẩu không chính xác');
    }

    const token = jwt.sign(
      { username, role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      success: true,
      data: {
        token,
        username,
        role,
      },
    });
  }

  static me(req: Request, res: Response): void {
    if (!req.user) {
      throw badRequest('Not authenticated');
    }
    res.json({
      success: true,
      data: req.user,
    });
  }
}

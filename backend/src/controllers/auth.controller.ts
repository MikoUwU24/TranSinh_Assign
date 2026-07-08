import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { badRequest } from '../middlewares/error-handler';
import { UserRepository } from '../repositories/user.repository';

const JWT_SECRET = process.env.JWT_SECRET ?? 'supersecret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '7d';

const ADMIN_USERNAME = process.env.ADMIN_USERNAME ?? 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'Admin@123';
const SW_USERNAME = process.env.SW_USERNAME ?? 'sw_user';
const SW_PASSWORD = process.env.SW_PASSWORD ?? 'SW@123';

const userRepository = new UserRepository();

export class AuthController {
  static async login(req: Request, res: Response): Promise<void> {
    const { username, password } = req.body;

    if (!username || !password) {
      throw badRequest('Tên đăng nhập và mật khẩu là bắt buộc');
    }

    let role: string | null = null;

    // 1. Kiểm tra tài khoản trong database trước
    const user = await userRepository.findByUsername(username);
    if (user && bcrypt.compareSync(password, user.password)) {
      role = user.role;
    }

    // 2. Fallback kiểm tra tài khoản cấu hình cứng ở biến môi trường
    if (!role) {
      if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        role = 'admin';
      } else if (username === SW_USERNAME && password === SW_PASSWORD) {
        role = 'sw';
      }
    }

    if (!role) {
      throw badRequest('Tài khoản hoặc mật khẩu không chính xác');
    }

    const token = jwt.sign(
      { username, role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN as any }
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

  static async register(req: Request, res: Response): Promise<void> {
    const { username, password, role } = req.body;

    if (!username || !password) {
      throw badRequest('Tên đăng nhập và mật khẩu là bắt buộc');
    }

    if (username.length < 3) {
      throw badRequest('Tên đăng nhập phải dài ít nhất 3 ký tự');
    }

    if (password.length < 6) {
      throw badRequest('Mật khẩu phải dài ít nhất 6 ký tự');
    }

    // Kiểm tra tên đăng nhập đã tồn tại trong DB chưa
    const existingUser = await userRepository.findByUsername(username);
    if (existingUser) {
      throw badRequest('Tên đăng nhập đã tồn tại');
    }

    // Mã hóa mật khẩu
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Tạo người dùng mới
    const newUser = await userRepository.create({
      username,
      password: hashedPassword,
      role: role || 'sw',
    });

    res.status(201).json({
      success: true,
      data: {
        id: newUser.id,
        username: newUser.username,
        role: newUser.role,
        createdAt: newUser.createdAt,
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

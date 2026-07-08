# Dynamic Form Builder (Hệ thống Quản lý Form Động)

Hệ thống quản lý form động toàn diện (Dynamic Form Builder) gồm Backend REST API (Node.js, Express, TypeScript, Prisma, PostgreSQL) và Frontend Dashboard (Next.js 14 App Router, TypeScript, CSS).

---

## Tài Khoản Đăng Nhập Mặc Định

Hệ thống hỗ trợ phân quyền bằng JWT Token. Các tài khoản kiểm thử mặc định được cấu hình trong file cấu hình môi trường:

| Vai trò | Tên đăng nhập | Mật khẩu | Quyền hạn |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin` | `Admin@123` | Quản lý Form (CRUD), quản lý Fields (Thêm, Sửa, Xóa, Sắp xếp), xem danh sách lượt nộp. |
| **Nhân viên SW** | `sw_user` | `SW@123` | Xem danh sách Form active, thực hiện điền Form & submit, xem lịch sử nộp cá nhân. |

---

## Hướng Dẫn Cài Đặt & Chạy Local

### Cách 1: Chạy bằng Docker Compose (Khuyên dùng)
Yêu cầu: Đã cài đặt Docker và Docker Compose.

1. Tại thư mục gốc của dự án, chạy lệnh:
   ```bash
   docker compose up -d --build
   ```
2. Lệnh trên sẽ tự động khởi tạo cơ sở dữ liệu **PostgreSQL** và build/khởi động server **Backend** tại port `3001`. Các script migration database sẽ được tự động chạy khi container khởi động.
3. Cài đặt và khởi chạy **Frontend** (Next.js):
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
4. Truy cập giao diện:
   - **Frontend Dashboard**: [http://localhost:3000](http://localhost:3000)
   - **API Docs (Swagger UI)**: [http://localhost:3001/api/docs](http://localhost:3001/api/docs)

---

### Cách 2: Chạy trực tiếp trên máy local

#### 1. Cấu hình & Chạy Database
Yêu cầu: Có sẵn một cơ sở dữ liệu PostgreSQL trống.
- Tạo file `backend/.env` (dựa trên file `backend/.env.example`) và điền URL kết nối:
  ```env
  DATABASE_URL="postgresql://username:password@localhost:5432/formbuilder"
  JWT_SECRET="supersecret-change-in-prod"
  PORT=3001
  ```

#### 2. Cài đặt & Khởi chạy Backend
```bash
cd backend
npm install
# Khởi chạy migration database của Prisma
npx prisma migrate dev --name init
# Chạy server ở chế độ development
npm run dev
```

#### 3. Cài đặt & Khởi chạy Frontend
```bash
cd ../frontend
npm install
npm run dev
```

---

## Chạy Unit Tests

Hệ thống đã viết sẵn 100% unit tests kiểm thử logic validation cho cả 5 loại trường dữ liệu (TEXT, NUMBER, DATE, COLOR, SELECT) bao gồm các trường hợp dữ liệu hợp lệ (happy path) và các điều kiện biên (edge cases).

Chạy test bằng **Vitest**:
```bash
cd backend
npm run test
```

---

## Quyết Định Thiết Kế Hệ Thống

### 1. Giải pháp bảo toàn tính toàn vẹn dữ liệu: Soft-Delete cho Fields (AGENTS.md §5.4)
Khi admin xóa một trường dữ liệu (Field) khỏi Form:
- Nếu trường này **chưa từng có lượt nộp nào**, hệ thống sẽ thực hiện **xóa cứng (hard delete)** khỏi database để tiết kiệm tài nguyên.
- Nếu trường này **đã có lượt nộp (Submissions)**, hệ thống sẽ thực hiện **xóa mềm (soft-delete)** bằng cách thiết lập thời gian vào cột `deleted_at`. 
  - *Lý do:* Nếu thực hiện xóa cứng, khóa ngoại liên kết từ bảng `submission_answers` sẽ bị phá vỡ hoặc lỗi cascade sẽ xóa sạch các câu trả lời lịch sử của nhân viên, gây mất mát dữ liệu nghiêm trọng. Việc sử dụng soft-delete giúp giữ nguyên vẹn các lượt nộp cũ trong quá khứ khi xem lại, đồng thời tự động ẩn trường này trên giao diện điền form và editor của Admin.

### 2. Thiết kế Validator Layer theo Strategy Pattern (AGENTS.md §6)
Tách biệt hoàn toàn logic validate khỏi tầng controller/service.
- Định nghĩa chung một interface `FieldValidator`:
  ```typescript
  interface FieldValidator {
    validate(value: unknown, config: FieldConfig): ValidationResult;
  }
  ```
- Mỗi loại trường (`text`, `number`, `date`, `color`, `select`) là một class độc lập thực thi interface trên.
- Sử dụng `ValidatorFactory` để lấy validator tương ứng dựa trên loại trường dữ liệu.
- `submission.service.ts` thực hiện gom tất cả các lỗi từ các trường khác nhau lại và trả về cùng một lúc dưới dạng mã lỗi `VALIDATION_ERROR` (HTTP 422) giúp cải thiện trải nghiệm người dùng cuối.

---

## Các Tính Năng / Điểm Cộng Đã Hoàn Thành

- [x] **Full-stack Monorepo**: Giao diện UI Next.js App Router hiện đại, responsive, hỗ trợ Dark / Light Theme đồng bộ.
- [x] **JWT Authorization**: Phân quyền chi tiết cho Admin và SW User.
- [x] **Tổ chức code chuẩn**: Chia lớp chặt chẽ: `Routes → Controllers → Services → Repositories → Prisma ORM`.
- [x] **Unit tests**: 26 bài test tự động bao phủ tất cả validator rules.
- [x] **Soft-delete & Database integrity**: Bảo toàn lịch sử câu trả lời.
- [x] **Swagger API Docs**: Ghi chép API đầy đủ tại `/api/docs`.
- [x] **Drag & Drop / Reorder Fields**: Giao diện Admin cho phép thay đổi thứ tự các trường (Up / Down) và lưu trực tiếp xuống database qua API reorder.
- [x] **Docker Compose**: Đóng gói sẵn sàng chạy chỉ với 1 lệnh.
- [x] **Phân trang (Pagination)**: Hỗ trợ phân trang cho danh sách form và submission.

# AGENTS.md — Luật Triển Khai Hệ Thống Quản Lý Form

> Tài liệu này là nguồn sự thật duy nhất (single source of truth) cho AI agent và mọi
> người tham gia code repo này. Mọi quyết định kỹ thuật phải tuân theo đây trừ khi có
> chỉ đạo mới ghi đè trực tiếp trong PR/commit message.

---

## 1. Bối Cảnh Dự Án

Đây là bài test tuyển dụng: xây dựng hệ thống quản lý form động (dynamic form builder)
gồm 2 vai trò:
- **Admin**: tạo/sửa/xóa form và field trong form.
- **Nhân viên SW**: xem danh sách form `active`, điền và submit form.

Tiêu chí chấm điểm ưu tiên theo trọng số: **tính đúng đắn (35%) > tổ chức code (25%) >
validation/error handling (20%) > db schema (10%) > README (10%)**. Agent phải phân bổ
effort theo đúng thứ tự ưu tiên này — không được dành quá nhiều thời gian cho điểm cộng
(Swagger, Docker, drag&drop...) khi phần lõi (CRUD form/field, validate, submit) chưa
chạy đúng và có test.

---

## 2. Tech Stack (Quyết Định — Không Tự Ý Đổi)

| Layer | Lựa chọn | Lý do |
| :--- | :--- | :--- |
| Backend | Node.js + Express | Nhanh, quen thuộc, dễ tổ chức layer rõ ràng |
| Ngôn ngữ | TypeScript | Bắt buộc — type-safety cho field/validation đa hình |
| ORM | Prisma | Migration rõ ràng, tự sinh types khớp DB |
| Database | PostgreSQL | Quan hệ Form 1-n Field 1-n Submission rõ ràng, cần transaction |
| Validation | Zod | Định nghĩa schema per field-type, dễ compose |
| Test | Vitest hoặc Jest | Unit test validation logic (bắt buộc theo mục 6) |
| API docs | Swagger (swagger-jsdoc + swagger-ui-express) | Điểm cộng, làm sau khi core xong |

Agent không được tự ý đổi sang ngôn ngữ/DB khác giữa chừng. Nếu thấy lựa chọn trên bất
khả thi trong môi trường hiện tại, phải dừng lại và báo cáo lý do trước khi đổi.

---

## 3. Cấu Trúc Thư Mục Bắt Buộc

```
src/
  config/         # kết nối DB, env, constants
  routes/         # định nghĩa route, KHÔNG chứa logic
  controllers/    # nhận request, gọi service, trả response — KHÔNG chứa business logic
  services/       # business logic (tạo form, submit form...)
  validators/     # Zod schema + validate logic theo field type — tách biệt hoàn toàn
  repositories/   # truy vấn DB qua Prisma — controller/service KHÔNG gọi Prisma trực tiếp
  middlewares/    # error handler, request logger, async wrapper
  types/          # TypeScript types/interfaces dùng chung
  utils/          # helper thuần, không phụ thuộc framework
prisma/
  schema.prisma
  migrations/
tests/
  validators/     # unit test cho từng loại field
  services/       # (nếu có thời gian)
README.md
AGENTS.md
```

**Quy tắc phân lớp (không được vi phạm):**
- `routes` → `controllers` → `services` → `repositories` → Prisma. Một lớp chỉ được
  gọi xuống lớp ngay dưới nó, không được nhảy cóc hoặc gọi ngược lên.
- `validators` độc lập, được `services` gọi trước khi ghi DB. Controller không tự
  validate tay bằng if/else.

---

## 4. Quy Ước Đặt Tên & Coding Style

- Biến/hàm: `camelCase`. Class/Type/Interface: `PascalCase`. Hằng số: `UPPER_SNAKE_CASE`.
- File: `kebab-case.ts` (vd: `form-validator.ts`, `submission.service.ts`).
- Tên hàm phải là động từ mô tả đúng hành vi: `createForm`, `validateSubmission`,
  `getActiveFormsSorted` — không dùng tên mơ hồ như `handle`, `process`, `doStuff`.
- Không dùng `any`. Nếu bắt buộc, phải comment giải thích tại sao và có `// TODO` để xử lý sau.
- Mỗi hàm public phải có JSDoc ngắn nếu logic không tự giải thích qua tên.
- Không copy-paste logic validate giữa các field type — dùng strategy pattern (xem mục 6).

---

## 5. Database Schema (Nguyên Tắc Thiết Kế)

Bảng tối thiểu: `forms`, `fields`, `submissions`, `submission_answers`.

Nguyên tắc bắt buộc:
1. `fields.options` (cho type `select`) lưu dạng JSON array of string, KHÔNG tạo bảng
   riêng trừ khi có yêu cầu mở rộng (option có thêm metadata).
2. `submission_answers` lưu giá trị dưới dạng cột `value` kiểu TEXT/JSONB — vì mỗi field
   type có kiểu dữ liệu khác nhau, không tách nhiều cột `value_text`, `value_number`...
   (tránh over-engineering, đúng tinh thần "không kỳ vọng hoàn hảo" của đề bài).
3. Bắt buộc có `created_at`, `updated_at` trên `forms`, `fields`, `submissions`.
4. Ràng buộc khóa ngoại: xóa `form` → cascade xóa `fields` liên quan. Xóa `field` sau khi
   đã có submission → KHÔNG cho xóa cứng, chỉ soft-delete (`deleted_at`) để không phá vỡ
   dữ liệu submission cũ. Agent phải tự quyết định và ghi rõ lý do trong README.
5. `forms.order` và `fields.order` là kiểu INTEGER, có index để sort nhanh khi số lượng lớn.
6. Migration phải được tạo qua Prisma CLI (`prisma migrate dev`), không sửa tay SQL trong
   thư mục `migrations/` sau khi đã generate.

---

## 6. Validation Logic — Bắt Buộc Theo Strategy Pattern

Mỗi field type có một validator riêng, implement chung 1 interface:

```ts
interface FieldValidator {
  validate(value: unknown, config: FieldConfig): ValidationResult;
}
```

Bảng quy tắc validate tối thiểu (không được nới lỏng hơn đề bài):

| Type | Rule bắt buộc |
| :--- | :--- |
| `text` | Nếu `required=true` → không rỗng; luôn giới hạn tối đa 200 ký tự |
| `number` | Phải parse được số; trong khoảng [0, 100] |
| `date` | Phải là ngày hợp lệ (ISO 8601); không được là ngày trong quá khứ (so với `now()` tại thời điểm submit) |
| `color` | Match regex `^#[0-9A-Fa-f]{6}$` |
| `select` | Giá trị phải nằm trong `field.options`; nếu không có options → lỗi cấu hình, không phải lỗi input |

Quy tắc chung:
- Validator KHÔNG được throw exception thô — luôn trả về `{ valid: boolean, errors: string[] }`.
- `services/submission.service.ts` chạy validate cho **toàn bộ field** trước khi ghi DB,
  gom hết lỗi trả về 1 lần (không dừng ở lỗi đầu tiên) — trải nghiệm tốt hơn cho nhân viên SW.
- Nếu field `required=false` và value rỗng/null → bỏ qua các rule khác, coi là hợp lệ.
- Validator phải có unit test riêng cho từng type, bao gồm cả case invalid lẫn edge case
  (vd: date đúng hôm nay có tính là quá khứ không? → agent phải quyết định rõ ràng: KHÔNG
  tính hôm nay là quá khứ, chỉ chặn ngày < hôm nay).

---

## 7. API Design Rules

- Tuân thủ đúng danh sách endpoint ở mục 3 của đề bài (`de_bai.md`) — không đổi path,
  không đổi HTTP method.
- Response thành công: luôn bọc dạng `{ success: true, data: ... }`.
- Response lỗi: format thống nhất toàn hệ thống:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Dữ liệu không hợp lệ",
    "details": [
      { "field": "email", "message": "Bắt buộc nhập" }
    ]
  }
}
```
- Mã lỗi chuẩn tối thiểu: `VALIDATION_ERROR` (422), `NOT_FOUND` (404), `BAD_REQUEST` (400),
  `INTERNAL_ERROR` (500). Không trả 200 kèm `success: false`.
- Mọi lỗi không mong đợi phải đi qua 1 middleware `errorHandler` tập trung — controller
  không tự viết `try/catch` lặp lại logic format lỗi.
- `GET /api/forms/active` phải sort theo `order ASC` ở tầng DB query, không sort ở code JS.
- Pagination (nếu làm) dùng query param `page`, `limit`, response kèm `meta: { total, page, limit }`.

---

## 8. Testing (Bắt Buộc Tối Thiểu)

- 100% các validator ở mục 6 phải có unit test (happy path + ít nhất 2 edge case mỗi type).
- Không cần test toàn bộ controller/route nếu thiếu thời gian — ưu tiên đúng theo trọng số
  chấm điểm ở mục 1.

---

## 9. Git Workflow

- Commit nhỏ, thường xuyên, message rõ ràng theo Conventional Commits:
  `feat: add field validator for select type`, `fix: date validator off-by-one`.
- KHÔNG squash toàn bộ thành 1 commit trước khi nộp — đề bài chấm điểm quá trình làm việc.
- Nhánh `main` luôn ở trạng thái chạy được; làm việc trên nhánh `feature/*` nếu cần.

---

## 10. Definition of Done (Checklist Trước Khi Coi Là Xong)

- [ ] Toàn bộ endpoint core ở mục 3.1–3.3 hoạt động đúng, trả đúng status code.
- [ ] Validate chạy ở server, KHÔNG tin dữ liệu từ client.
- [ ] Không có `any` không giải thích, không có logic nghiệp vụ nằm trong controller.
- [ ] Unit test cho validators pass.
- [ ] README.md có: hướng dẫn cài đặt, chạy migration, chạy server, và giải thích các
      quyết định thiết kế (đặc biệt là mục 5.4 — vì sao soft-delete field).
- [ ] Có ít nhất 1 file migration hoặc `schema.prisma` commit vào repo.
- [ ] (Điểm cộng, làm sau cùng nếu còn thời gian) Swagger, Docker Compose, pagination,
      reorder field.

---

## 11. Những Điều Agent KHÔNG Được Làm

- Không tự thêm field type ngoài 5 loại đã định nghĩa (text, number, date, color, select)
  trừ khi được yêu cầu rõ ràng.
- Không bỏ qua validate "để làm nhanh cho xong" — đây là tiêu chí chấm điểm 20%.
- Không thiết kế schema thừa bảng/thừa cột khi chưa có yêu cầu (đúng tinh thần
  "không over-engineering" mà đề bài nhấn mạnh ở phần ghi chú).
- Không đổi tech stack đã chốt ở mục 2 mà không báo cáo lý do trước.

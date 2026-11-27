# Vibrant Mart — E-commerce mỹ phẩm (MERN monorepo)

Cửa hàng mỹ phẩm/skincare: storefront React + REST API Express/MongoDB, thanh toán COD · PayOS · MoMo · PayPal, tính phí ship theo bản đồ, trang quản trị Admin/Staff.

## Cấu trúc

```
apps/
  api/   Express 5 + TypeScript + MongoDB driver (transactions), Vitest
  web/   React 19 + Vite 7 + Tailwind 3 + React Query + Framer Motion
design-system/web/   Hệ thiết kế "Vibrant Glow" (MASTER.md)
```

| Lớp | Công nghệ |
|---|---|
| API | Node 22, Express 5, `mongodb` driver 7, express-validator, JWT (access/refresh), formidable + sharp, Swagger tại `/api-docs` |
| Database | MongoDB **replica set** (đơn hàng, kho, voucher, thanh toán dùng transaction — không chạy trên standalone) |
| Web | React 19, React Router 7, TanStack Query, react-hook-form + zod, Leaflet, sonner |
| Tích hợp | PayOS, MoMo, PayPal (sandbox), Nominatim + OSRM (geocode/route), Cloudinary, Gmail SMTP, Supabase (Google login), Telegram, OpenAI (tùy chọn) |

## Chạy local

Yêu cầu: Node 22, pnpm 10, một MongoDB replica set (Atlas free tier hoặc `mongod --replSet rs0`).

```bash
pnpm install
cp apps/api/.env.example apps/api/.env   # điền DATABASE_URL, JWT secrets...
cp apps/web/.env.example apps/web/.env
pnpm dev                                  # api :3000, web :5173
```

Tạo tài khoản admin đầu tiên (đọc `SEED_ADMIN_*` trong `.env`):

```bash
pnpm --filter ecommerce-monorepo exec ts-node -r tsconfig-paths/register src/scripts/seedAdmin.ts
```

API chỉ mở cổng sau khi kết nối DB thành công; nếu thiếu/ sai `DATABASE_URL` sẽ dừng và in lý do.

## Kiểm tra chất lượng

```bash
pnpm test        # Vitest cho API (unit + security regression)
pnpm typecheck   # API + web
pnpm lint        # web
pnpm ci:check    # lint + typecheck + test + build
```

CI (`.github/workflows/ci.yml`) chạy các bước trên cho mỗi PR vào `main`.

## Tính năng chính

- **Tài khoản:** đăng ký + xác minh email, đăng nhập email/Google, quên/đổi mật khẩu, sổ địa chỉ, phân quyền Admin/Staff/User, khóa tài khoản.
- **Catalog:** sản phẩm (ảnh, xuất xứ, dung tích…), danh mục, thương hiệu, tìm kiếm/lọc/sắp xếp/phân trang, đánh giá.
- **Mua hàng:** giỏ hàng, mua ngay không cần tài khoản (COD), voucher, phí ship theo khoảng cách thực, đặt hàng trong transaction (trừ kho + voucher + xóa giỏ).
- **Thanh toán:** COD, PayOS (VietQR), MoMo, PayPal; xác thực chữ ký + số tiền trước khi xác nhận; hoàn tiền PayOS có khóa đối soát.
- **Quản trị:** dashboard, quản lý đơn/sản phẩm/danh mục/thương hiệu/người dùng/cài đặt shop, AI gợi ý mô tả sản phẩm.

## Tài liệu liên quan

- [SECURITY_HARDENING.md](SECURITY_HARDENING.md) — các ranh giới bảo mật và checklist trước khi bán thật.
- [NEXT_STEPS.md](NEXT_STEPS.md) — lộ trình tiếp theo.
- [deploy_documentation.md](deploy_documentation.md) — triển khai Docker/VPS.
- [design-system/web/MASTER.md](design-system/web/MASTER.md) — token & quy tắc UI.

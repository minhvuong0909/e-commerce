# 🛒 BÁO CÁO RÀ SOÁT TÍNH NĂNG & KIẾN TRÚC HỆ THỐNG E-COMMERCE
> **Dự án**: Vibrant Mart — E-Commerce Beauty & Skincare  
> **Cập nhật ngày**: 21/07/2026  
> **Công nghệ**: React (Vite/TypeScript) + Node.js (Express/MongoDB) + TailwindCSS / Framer Motion

---

## 📌 1. Danh Sách Chức Năng Đã Hoàn Thành (Completed Features)

### 👤 A. Phân Hệ Khách Hàng (Customer Storefront)

#### 1. Xác thực & Tài khoản (Authentication)
- [x] **Đăng ký tài khoản**: Đăng ký thông tin người dùng mới.
- [x] **Đăng nhập**: Đăng nhập bằng Email/Password hoặc Google OAuth Callback.
- [x] **Xác thực Email**: Gửi token xác thực email và xử lý kết quả xác thực (`VerifyResultPage`).
- [x] **Quên & Đổi mật khẩu**: Gửi email khôi phục mật khẩu, nhập token đổi mật khẩu mới.
- [x] **Quản lý Hồ sơ**: Xem & cập nhật thông tin cá nhân (`ProfilePage`).

#### 2. Trang chủ & Khám phá Sản phẩm (Homepage & Discovery)
- [x] **Hero Section**: Banner 2x2 ấn tượng với thiết kế mỹ phẩm sang trọng (Tone màu `#3d3330`, `#fdf2f0`, `#b07a72`).
- [x] **Routine Essentials Grid**: 4 ô danh mục chính (*Serum, Cleanser, SPF, Lip*) tích hợp ảnh thực tế.
- [x] **Lọc theo Danh mục (Category Chips)**: Chuẩn **SEO Enterprise Slug** trên URL (ví dụ: `?category=serum`, `?category=sua-rua-mat`).
- [x] **Tìm kiếm & Phân trang**: Tìm kiếm sản phẩm theo từ khóa + phân trang động với `PaginationBar`.
- [x] **Xử lý ảnh CDN/Static**: Tự động định dạng ảnh Unsplash và ảnh tĩnh qua utility `formatImageUrl.ts` kèm `referrerPolicy='no-referrer'`.

#### 3. Trang Chi tiết Sản phẩm (Product Detail Page)
- [x] **Bộ sưu tập ảnh (Album / Gallery)**: Tự động tổng hợp `thumbnail` và danh sách ảnh `medias` dạng mảng chuỗi hoặc object `{ url }`, cho phép xem slider thumbnail mượt mà.
- [x] **Thông số chi tiết**: Hiển thị Dung tích (ml), Trọng lượng (g), Xuất xứ, Số lượng tồn kho và Số lượng đã bán.
- [x] **Chọn số lượng & Thêm vào giỏ**: Tùy chỉnh số lượng đặt mua phù hợp với tồn kho khả dụng.

#### 4. Giỏ hàng & Thanh toán (Cart & Checkout)
- [x] **Quản lý Giỏ hàng (`CartPage`)**: Thêm, sửa số lượng, xóa sản phẩm, tính toán tự động tổng tiền.
- [x] **Trang Đặt hàng (`CheckoutPage`)**:
  - Nhập thông tin người nhận & địa chỉ giao hàng.
  - Lựa chọn đơn vị vận chuyển (`DeliveryMethod`).
  - Lựa chọn phương thức thanh toán (*COD / MoMo / Online*).
- [x] **Khớp đơn & Trừ tồn kho**: Tự động trừ `quantity` và tăng `soldNumber` tại Backend khi tạo đơn thành công.

#### 5. Quản lý Đơn hàng Cá nhân (My Orders)
- [x] **Danh sách Đơn hàng**: Xem danh sách đơn hàng đã đặt lọc theo từng tab trạng thái:
  - 🟡 **Pending** (Chờ xử lý)
  - 🟢 **Confirmed** (Đã xác nhận thanh toán/duyệt đơn)
  - 🟣 **Shipped** (Đang giao hàng)
  - 🔵 **Delivered** (Đã giao thành công)
  - 🔴 **Cancelled** (Đã hủy)
- [x] **Chi tiết Đơn hàng & Kết quả**: Trang hiển thị hóa đơn và thông tin chi tiết từng đơn hàng.

---

### 🛡️ B. Phân Hệ Quản Trị (Admin & Staff Dashboard)

#### 1. Tổng quan (Dashboard Overview)
- [x] **Báo cáo Thống kê**: Tổng doanh thu, tổng số đơn hàng, tổng số người dùng và tổng số sản phẩm.

#### 2. Quản lý Sản phẩm (Product Management)
- [x] **Danh sách & Phân trang**: Tìm kiếm, lọc và phân trang danh sách sản phẩm.
- [x] **Tạo & Chỉnh sửa**: Đăng tải sản phẩm mới kèm ảnh Thumbnail và mảng ảnh phụ (`medias`).

#### 3. Quản lý Danh mục & Thương hiệu (Catalog Management)
- [x] **Danh mục (Categories)**: Thêm, sửa, xóa danh mục, tự động tạo `slug` tiếng Việt chuẩn SEO (`slugify`).
- [x] **Thương hiệu (Brands)**: Thêm, sửa, xóa các hãng mỹ phẩm.

#### 4. Quản lý Đơn hàng (Order Operations)
- [x] **Xử lý Đơn hàng**: Xem danh sách đơn toàn hệ thống, chuyển đổi trạng thái đơn (*Pending ➔ Confirmed ➔ Shipped ➔ Delivered ➔ Cancelled*).

#### 5. Quản lý Người dùng (User Administration)
- [x] **Phân quyền & Khóa tài khoản**: Quản lý người dùng, thay đổi vai trò (*Admin / Staff / User*), khóa hoặc mở khóa tài khoản.

---

## 🔄 2. Sơ Đồ Luồng Mua Hàng & Thanh Toán (Purchase & Payment Flow)

```
[Khách hàng] ──► Chọn Sản phẩm & Số lượng ──► Bấm "Thêm vào giỏ"
                                                   │
                                                   ▼
[Trang Giỏ Hàng] ◄── Kiểm tra & Tùy chỉnh ◄── POST /cart/add
       │
       ▼
[Trang Checkout] ──► Điền Địa chỉ + Chọn Đơn vị Ship + Chọn Phương thức (COD / MoMo)
       │
       ▼
[Backend Processing] ──► Validate Tồn kho ──► Trừ Stock & Tăng Sold
       │                                   ──► Tạo Đơn Hàng (Pending)
       │                                   ──► Xóa sạch Giỏ hàng
       ▼
[Order Result / Detail] ◄── Chuyển trạng thái ◄── Confirmed (Admin duyệt / MoMo callback)
```

---

## 🛠️ 3. Các Tối Ưu Kỹ Thuật Đáng Chú Ý (Technical Fixes & Optimizations)

1. **Fix Lỗi Back Navigation & Refresh Cache**:
   - Thêm `key={categoryId || 'all'}` vào component `ProductShowcase`.
   - Bóc tách bộ lọc `queryKey` trong hook `useProducts.ts` giúp React Query làm mới Cache chuẩn xác khi chuyển đổi danh mục.
2. **Fix Lỗi Thiếu Ảnh ở Trang Chi Tiết (`ProductDetailPage`)**:
   - Bổ sung `thumbnail: 1` và giữ fallback `medias` trong pipeline `$project` của API `getProductById`.
   - Cập nhật Frontend hỗ trợ bóc tách cả dạng chuỗi URL lẫn dạng object `{ url }`.
3. **Triệt tiêu Hiện tượng Giật Full Screen khi Chuyển Trang**:
   - Loại bỏ `AnimatePresence mode='wait'` tại `UserLayout` và `AdminLayout`, giúp điều hướng giữa các trang diễn ra mượt mà, không bị giật nhấp nháy.
4. **Chuẩn hóa Enterprise SEO Slug trên URL**:
   - Chuyển đổi URL bộ lọc danh mục từ ID khô khan (`?category=670f...`) thành Slug tiếng Việt không dấu (`?category=serum`, `?category=sua-rua-mat`).

---

## 🚀 4. Gợi Ý Lộ Trình Nâng Cấp Tương Lai (Future Roadmap)

| STT | Tính năng gợi ý | Mô tả & Lợi ích | Ưu tiên |
| :---: | :--- | :--- | :---: |
| **1** | **Mã giảm giá (Voucher / Coupon)** | Nhập mã giảm giá (ví dụ `SUMMER10`, `FREESHIP`) tại Checkout để trừ tiền trực tiếp. | Cao |
| **2** | **Đánh giá & Bình luận (Product Reviews)** | Cho phép người dùng đánh giá 1-5 sao và viết nhận xét sau khi đơn hàng `Delivered`. | Cao |
| **3** | **Danh sách Yêu thích (`/user/wishlist`)** | Trang lưu danh sách các sản phẩm ưa thích để xem lại sau. | Trung bình |
| **4** | **Tích hợp Cổng MoMo / PayOS Live QR** | Quét mã QR thanh toán tự động xác nhận đơn hàng qua Webhook. | Trung bình |
| **5** | **Gửi Email Hóa đơn Tự động** | Tự động gửi Email xác nhận hóa đơn về Gmail của khách ngay khi hoàn tất đặt hàng. | Trung bình |

---
*Tài liệu này được tổng hợp tự động để theo dõi tiến độ phát triển dự án.*

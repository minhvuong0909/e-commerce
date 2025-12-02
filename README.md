# 🛒 E-commerce Backend API  
Backend REST API cho hệ thống thương mại điện tử mỹ phẩm.  
Dự án hỗ trợ phân quyền, quản lý sản phẩm, giỏ hàng, đơn hàng, phương thức giao hàng, thanh toán cơ bản và JWT Authentication.

---

## 🚀 Features

### 🧑‍💼 Authentication & Authorization
- Đăng ký / đăng nhập / đăng xuất
- JWT Access Token + Refresh Token
- Phân quyền (Admin / User)
- Xác thực email (verify token)
- Quên mật khẩu (forgot password token)
- User status (active / inactive / banned)

### 🛍️ Product & Catalog Management
- CRUD Category
- CRUD Brand
- CRUD Product
- Thumbnail + Image gallery cho sản phẩm
- Thuộc tính mỹ phẩm: origin, weight, volume, width, height, length
- Filter theo category, brand, price range…

### 🛒 Cart System
- Mỗi user có 1 giỏ hàng
- Thêm sản phẩm vào cart
- Cập nhật số lượng
- Xóa sản phẩm khỏi giỏ
- Snapshot giá khi thêm cart_items

### 📦 Order Management
- Checkout từ giỏ hàng
- Delivery method
- Shipping fee
- Order status (pending → confirmed → shipping → completed → cancelled)
- Lưu snapshot sản phẩm khi checkout

### 🚚 Delivery Methods
- Quản lý phương thức vận chuyển
- Gán cho order tại thời điểm checkout
- Có thể mở rộng tích hợp GHN/GHTK

### 💳 Payments (Optional)
- COD (mặc định)
- Có thể mở rộng MoMo / VNPay / ZaloPay
- Lưu transaction_id, payment logs

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|------------|
| Runtime | Node.js |
| Framework | Express.js / NestJS |
| Database | MySQL |
| ORM | Prisma / Sequelize / Knex |
| Auth | JWT (Access + Refresh Token) |
| Optional | Docker, Postman |

---

## 📂 Folder Structure

---

## 🧪 API Endpoints (Basic Overview)

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /auth/register | Đăng ký |
| POST | /auth/login | Đăng nhập |
| POST | /auth/refresh | Refresh token |
| POST | /auth/logout | Đăng xuất |

### Products
| Method | Endpoint |
|--------|----------|
| GET | /products |
| GET | /products/:id |
| POST | /products (admin) |
| PUT | /products/:id (admin) |
| DELETE | /products/:id (admin) |

### Cart
| Method | Endpoint |
|--------|----------|
| GET | /cart |
| POST | /cart/items |
| PATCH | /cart/items/:id |
| DELETE | /cart/items/:id |

### Orders
| Method | Endpoint |
|--------|----------|
| POST | /checkout |
| GET | /orders |
| GET | /orders/:id |




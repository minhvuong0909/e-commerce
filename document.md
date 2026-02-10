# Ecommerce Functions (Brand Module)

Dựa trên `BrandsService`, hệ thống ecommerce hiện có các chức năng quản lý **Brand (Thương hiệu)** như sau:

---

## 1) Create Brand (Tạo thương hiệu)

- **Function:** `createBrand(payload: CreateBrandReqBody)`
- **Mục đích:**
  - Admin thêm thương hiệu mới (VD: Nike, Adidas, Apple...)
  - Dùng để gắn thương hiệu vào sản phẩm

---

## 2) Update Brand (Cập nhật thương hiệu)

- **Function:** `updateBrand(brand_id: string, payload: Partial<CreateBrandReqBody>)`
- **Mục đích:**
  - Admin chỉnh sửa thông tin thương hiệu
  - Tự động cập nhật trường `updated_at`
- **Lỗi có thể trả về:**
  - `404 NOT_FOUND` nếu brand không tồn tại

---

## 3) Delete Brand (Xóa thương hiệu)

- **Function:** `deleteBrand(brand_id: string)`
- **Mục đích:**
  - Admin xóa thương hiệu khỏi hệ thống
- **Rule ecommerce quan trọng:**
  - Nếu brand đang có sản phẩm liên kết (quan hệ 1 - N) thì **không cho xóa**
- **Lỗi có thể trả về:**
  - `409 CONFLICT` nếu brand có sản phẩm
  - `404 NOT_FOUND` nếu brand không tồn tại

---

## 4) Get Brand By Id (Lấy thương hiệu theo ID)

- **Function:** `getBrandById(brand_id: string)`
- **Mục đích:**
  - Lấy chi tiết thương hiệu
  - Dùng cho trang admin hoặc hiển thị brand trong sản phẩm
- **Lỗi có thể trả về:**
  - `404 NOT_FOUND` nếu brand không tồn tại

---

# Business Rules / Validation (Logic ecommerce trong service)

## 1) Brand không tồn tại → trả lỗi 404

Áp dụng cho:

- Update Brand
- Delete Brand
- Get Brand By Id

---

## 2) Brand có sản phẩm → không được xóa (409 Conflict)

- Hệ thống kiểm tra trước khi xóa brand.
- Nếu có sản phẩm liên kết thì chặn xóa để tránh mất dữ liệu liên quan.

# Chức năng chính (UI) – Module Cart (Ecommerce)

Dựa theo `CartsService` này, bạn cần làm UI cho **Giỏ hàng** gồm các chức năng chính sau:

---

## 1) Tạo giỏ hàng (Auto Create Cart)

- **Hành vi UI:**
  - Khi user lần đầu thêm sản phẩm → hệ thống tự tạo cart ACTIVE nếu chưa có
- **API logic tương ứng:**
  - `createCart(user_id)`

> UI không cần nút “Tạo giỏ hàng”, vì nó tự tạo khi add item.

---

## 2) Thêm sản phẩm vào giỏ (Add To Cart)

- **Hành vi UI:**
  - Nút “Add to cart” ở:
    - Product Detail
    - Product List
- **API tương ứng:**
  - `createCartItem({ user_id, payload })`

### Rule UI cần xử lý:

- Nếu user chưa verify email → báo lỗi **401**
- Nếu sản phẩm không tồn tại → **404**
- Nếu số lượng vượt tồn kho → báo lỗi **“Không đủ hàng trong kho”**

---

## 3) Xem giỏ hàng (Cart Page / Cart Items)

- **Hành vi UI:**
  - Trang `/cart`
  - Hiển thị list sản phẩm trong cart
  - Hiển thị tổng tiền
- **API tương ứng:**
  - `getCartItemsByUserId({ user_id })`

### UI hiển thị:

- Danh sách cart items
- Mỗi item có:
  - ảnh
  - tên
  - giá
  - số lượng
  - tổng tiền dòng (quantity \* price)
- Tổng tiền giỏ hàng (`total_price`)

---

## 4) Cập nhật số lượng sản phẩm trong giỏ (Update Cart Item Quantity)

- **Hành vi UI:**
  - Nút `+` / `-`
  - Input quantity
- **API tương ứng:**
  - `updateCartItem({ cart_item_id, quantity, user_id })`

### Rule UI cần xử lý:

- Nếu quantity > tồn kho → báo lỗi “Không đủ hàng”
- Nếu cart/cart_item không tồn tại → báo lỗi 404

---

## 5) Xóa sản phẩm khỏi giỏ (Remove Cart Item)

- **Hành vi UI:**
  - Nút “Remove / Delete”
- **API tương ứng:**
  - `deleteCartItem({ cart_item_id, user_id })`

---

# Chức năng chính (UI) – Module Category (Ecommerce)

Dựa trên `CategoryService`, UI cho **Danh mục sản phẩm (Category)** nên có các chức năng chính sau:

---

## 1) Danh sách danh mục (Category List)

- Hiển thị tất cả category
- Hiển thị:
  - Tên danh mục
  - Slug
  - Mô tả
  - Ngày tạo / cập nhật
- Hành động:
  - View
  - Edit
  - Delete

> ⚠️ Hiện service **chưa có** `getAllCategories()` nhưng UI bắt buộc phải có trang này.

---

## 2) Tạo danh mục mới (Create Category)

- Form nhập:
  - Tên danh mục
  - Mô tả
- Slug:
  - Tự động generate từ tên (không cho sửa)
- API tương ứng:
  - `createCategory(category)`

### Rule UI:

- Không cho trùng tên danh mục
- Nếu trùng → báo lỗi **“Category name already existed”**

---

## 3) Xem chi tiết danh mục (Category Detail)

- Hiển thị:
  - Tên
  - Slug
  - Mô tả
- API tương ứng:
  - `getCategoryById(category_id)`

---

## 4) Chỉnh sửa danh mục (Update Category)

- Form edit:
  - Tên danh mục
  - Mô tả
- Slug:
  - Auto update khi đổi tên
- API tương ứng:
  - `updateCategory(category_id, payload)`

### Rule UI:

- Nếu đổi tên → check trùng slug
- Nếu trùng → báo lỗi **409 CONFLICT**

---

## 5) Xóa danh mục (Delete Category)

- Nút Delete
- API tương ứng:
  - `deleteCategory(category_id)`

# Chức năng chính (UI) – Module Media / Upload (Ecommerce)

Dựa theo `MediaServices`, UI cho **Upload hình ảnh & video** trong hệ thống ecommerce nên có các chức năng chính sau:

---

## 1) Upload hình ảnh (Upload Image)

- **Hành vi UI:**
  - Upload 1 hoặc nhiều ảnh
  - Dùng cho:
    - Ảnh sản phẩm
    - Ảnh brand
    - Ảnh category
    - Ảnh avatar (nếu có)
- **API tương ứng:**
  - `hanleUploadImage(req)`

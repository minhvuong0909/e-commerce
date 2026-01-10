export enum UserVerifyStatus {
  Unverified, // chưa xác thực email
  Verified, // đã xác thực email
  Banned // bị khóa
}

export enum USER_ROLE {
  Admin, //0
  Staff, //1
  User //2
}

export enum TokenType {
  AccessToken, // 0
  RefreshToken, // 1
  ForgotPasswordToken, // 2
  EmailVerificationToken // 3
}

// status role
export enum RoleStatus {
  ACTIVE, // hoạt động
  INACTIVE // không hoạt động
}

// status product
export enum PRODUCT_STATUS {
  Active, // còn hàng
  Stock // hết hàng
}

export enum MediaType {
  Image,
  Video
}

export enum OrderStatus {
  Pending, // đang chờ xử lý
  Confirmed, // đã xác nhận
  Shipped, // đã giao hàng
  Delivered, // đã nhận hàng
  Cancelled // đã hủy
}

export enum CartStatus {
  ACTIVE, // đang hoạt động
  CHECKED_OUT, //  thanh toán chyển về order
  ABANDONED // bị bỏ rơi
}

# Vibrant Mart — kế hoạch sau clean code

## Đã clean trong đợt này

- Gom policy verified Admin dùng chung cho product/category/brand; giữ nguyên quyền đã vá.
- Gom tùy chọn rate-limit dùng chung, không thay cửa sổ hoặc hạn mức từng endpoint.
- Bỏ kiểm tra PayOS trùng, type cast không cần thiết, import/biến/comment debug thừa trong các file được chỉnh.
- Dashboard dùng React Query thay cho nhiều state và effect tự quản; giữ layout, giới hạn dữ liệu và công thức cũ để tránh trộn refactor với thay nghiệp vụ.
- Backend chỉ mở HTTP sau khi DB và khởi tạo delivery methods sẵn sàng; đóng Mongo client khi startup thất bại. Không tạo thêm admin/user/demo data.
- Thêm 3 test đảm bảo không mở cổng khi DB/initializer thất bại. Giữ nguyên test bảo mật đã có.
- Không xóa dữ liệu người dùng, `cosmetics_products.json`, secrets hoặc các thay đổi đang làm dở; không push/deploy.

## Thứ tự tiếp theo

| Ưu tiên | Công việc | Điều kiện hoàn thành |
| --- | --- | --- |
| P0 — gỡ chặn chạy thật | Cập nhật `DATABASE_URL` riêng tư bằng cluster MongoDB hợp lệ; xác nhận DNS, network access và replica set/transaction permissions. | Backend khởi động không crash; API products/category/brand trả JSON; transaction commit và rollback được thử trên staging. |
| P0 — an toàn triển khai | Thu hồi khóa từng lộ tại nhà cung cấp; cập nhật env; audit Admin/Staff và giao dịch cũ; sao lưu trước sửa dữ liệu. | Không còn dùng khóa đã lộ; mọi tài khoản đặc quyền được chủ dự án xác nhận; có danh sách payment/refund cần đối soát. |
| P1 — kiểm thử tích hợp | User/Admin/Staff, giỏ hàng, guest COD, checkout online qua sandbox, callback hợp lệ/sai chữ ký/sai tiền, retry, hủy và hoàn tiền. Thử đồng thời lượt hàng/voucher cuối. | Không kho âm, không dùng quá voucher, không tạo bản ghi dang dở; callback lặp không cập nhật tiền/kho lặp; User bị 403 khi gọi API Admin. Không dùng tiền thật. |
| P1 — chuẩn hóa dữ liệu/API | Thêm request schema và response DTO; giảm `any`; thống nhất pagination, lỗi 4xx/5xx và cấu hình env. Tách order notification/refund khỏi service lớn theo từng bước có test. | Contract frontend/backend khớp; dữ liệu sai bị từ chối trước tác vụ ngoài; test contract và lint/typecheck qua. |
| P1 — sửa số liệu Dashboard | Aggregate báo cáo tại backend theo khoảng ngày, trạng thái đơn/thanh toán; không cộng ship hai lần; bỏ tăng trưởng cố định; không tính tổng từ 5 dòng. | Kết quả khớp dữ liệu mẫu kiểm thử và các tổng độc lập; loading/empty/error/retry rõ ràng. |
| P2 — storefront và AI | Chuẩn hóa token/component, catalog có filter URL, kiểm tra responsive/a11y. Chuẩn hóa thuộc tính da/thành phần rồi mới thêm bộ lọc/quiz. Ràng buộc AI vào hàng còn kho/chính sách thật. | Không tạo review/ưu đãi/cam kết giả; kiểm tra 320/390/768/1440px và keyboard; có test guardrails, không gợi ý SKU ngoài tập cho phép. |
| P2 — vận hành production | Health/readiness probes, graceful shutdown, structured logs không chứa secret/PII, shared rate-limit storage khi chạy nhiều replicas, CI gate, backup/restore và quy trình rollout/rollback. | Build/test/lint tự động qua; thử restore và rollback staging; cảnh báo khi DB/payment không hoạt động. |

## Cách chia nhỏ để tránh làm hỏng project

1. Chốt mỗi thay đổi thành một nhóm nhỏ: thêm test → sửa code → chạy lint/typecheck/test/build → review diff.
2. Không đổi UI, công thức báo cáo, database schema và payment workflow trong cùng một refactor lớn.
3. Không chạy seed hoặc migration production ngầm khi test; việc sửa dữ liệu/quyền/key phải có mục tiêu và xác nhận rõ ràng.
4. Chưa xóa file chỉ dựa vào tên hoặc vẻ ngoài không dùng; kiểm tra import, build, script deploy và tài liệu trước.

## Giới hạn hiện tại

MongoDB đang chặn kiểm thử runtime do hostname cấu hình trả `ENOTFOUND` ở lần chạy gần nhất. Clean code không thay thế việc sửa kết nối và không chứng minh hệ thống đã sẵn sàng nhận đơn thật. Đợt này tập trung các điểm đã xác minh; chưa tuyên bố toàn bộ source đã được refactor hoàn tất.

# Hướng dẫn DevOps & Quy trình Deploy dự án E-Commerce

Tài liệu này cung cấp hướng dẫn kết nối VPS, quy trình deploy và cách cấu hình cho người khác cùng làm việc.

---

## BẢNG 1: Quy trình Deploy & Kết nối VPS (Dành cho Cá nhân / Chủ sở hữu)

Dành cho bạn để quản trị hệ thống và cấu hình CI/CD tự động.

### 1. Thông tin kết nối VPS


### 2. Bảng quy trình Deploy thủ công & Tự động

| Phương thức | Các bước thực hiện | Lệnh / Cấu hình chi tiết |
| :--- | :--- | :--- |
| **Kết nối VPS qua SSH** | Dùng Terminal (Windows PowerShell hoặc biểu tượng CLI) để kết nối trực tiếp vào VPS. | `ssh root@160.22.106.238`<br>*(Nhập mật khẩu khi được hỏi)* |
| **Deploy thủ công trên VPS** | SSH vào VPS, kéo mã nguồn mới nhất từ GitHub và khởi động lại các container. | ```bash<br>cd /root/e-commerce<br>git pull origin main<br>docker compose up -d --build --remove-orphans<br>``` |
| **Deploy tự động (CI/CD)** | Mỗi lần bạn `git push` code lên nhánh `main`, GitHub Actions sẽ tự động SSH vào VPS để deploy mà không cần làm gì thêm. | Đã cấu hình tệp tin `.github/workflows/deploy.yml` tự động build & deploy zero-downtime. |
| **Cấu hình GitHub Secrets** | Để GitHub Actions có quyền kết nối VPS của bạn, cần điền các biến này vào **GitHub Repo -> Settings -> Secrets and variables -> Actions**: | *   `VPS_HOST`: `160.22.106.238`<br>*   `VPS_USER`: `root`<br>*   `VPS_SSH_KEY`: *(Nội dung private key SSH)*<br>*   `VITE_BASE_URL_API`: `https://api.vuongdev.top`<br>*   `VITE_SUPABASE_URL`: `https://lyskkkoagnrxbxxkjdao.supabase.co`<br>*   `VITE_SUPABASE_ANON_KEY`: *(Key Supabase)* |
| **Quản lý & Giám sát Logs** | Xem log hệ thống và dọn dẹp dung lượng ổ đĩa định kỳ. | *   Xem logs: `docker compose logs -f api`<br>*   Xem trạng thái: `docker ps`<br>*   Dọn dẹp rác: `docker system prune -f --volumes` |

---

## BẢNG 2: Cấu hình kết nối & Cộng tác (Dành cho Lập trình viên khác / Đội ngũ)

Dành cho các lập trình viên khác trong đội của bạn để họ có thể kết nối, phát triển frontend/backend và deploy chung.

### 1. Bảng phân quyền & Cấu hình cộng tác

| Hạng mục cần cấu hình | Cách thực hiện | Chi tiết kỹ thuật / Bảo mật |
| :--- | :--- | :--- |
| **Cấp quyền truy cập GitHub** | Thêm tài khoản GitHub của lập trình viên khác vào repository làm Cộng tác viên. | Vào **GitHub Repo -> Settings -> Collaborators -> Add people** và điền tên hoặc email của họ. |
| **Cấp quyền kết nối VPS (An toàn)** | **KHÔNG chia sẻ mật khẩu root**. Thay vào đó, hãy lấy SSH Public Key của họ (`id_rsa.pub`) và thêm vào VPS. | 1. Yêu cầu lập trình viên gửi Public Key.<br>2. SSH vào VPS bằng quyền root và mở file cấu hình:<br>`nano /root/.ssh/authorized_keys`<br>3. Dán Public Key của họ xuống dòng cuối cùng và lưu lại. |
| **Cấu hình Local để Dev Frontend** | Lập trình viên khác clone code về máy cá nhân và cấu hình `.env` để sử dụng API production của bạn thay vì chạy API local. | Tạo tệp `apps/web/.env` ở máy của họ:<br>```env<br>VITE_BASE_URL_API = 'https://api.vuongdev.top'<br>VITE_SUPABASE_URL = 'https://lyskkkoagnrxbxxkjdao.supabase.co'<br>VITE_SUPABASE_ANON_KEY = '...'<br>``` |
| **Cấu hình Local để Dev Backend** | Nếu họ muốn phát triển backend cục bộ, họ cần cài đặt các biến môi trường kết nối trực tiếp đến database MongoDB Atlas. | Tạo tệp `apps/api/.env` ở máy của họ:<br>```env<br>DB_USERNAME = 'minhvuong0909'<br>DB_PASSWORD = 'vuongzip365'<br>DB_NAME = 'Ecommerce_Store'<br>PORT = 3000<br>HOST = 'http://localhost:3000'<br>``` |
| **Quy trình đóng góp code (Git Flow)** | Lập trình viên khác không được push trực tiếp lên `main` để tránh deploy lỗi. | 1. Tạo nhánh mới từ main: `git checkout -b feature/ten-tinh-nang`<br>2. Code và commit.<br>3. Push nhánh lên GitHub và tạo **Pull Request (PR)**.<br>4. Bạn (Owner) review và merge PR vào `main`. CI/CD sẽ tự động deploy lên VPS. |

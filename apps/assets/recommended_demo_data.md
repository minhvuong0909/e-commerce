# Dữ Liệu Demo Cửa Hàng Mỹ Phẩm Cao Cấp (20 Sản Phẩm)

Tài liệu này cung cấp bộ dữ liệu demo **20 sản phẩm mỹ phẩm** được chọn lọc kỹ lưỡng, phù hợp hoàn toàn với cấu trúc cơ sở dữ liệu MongoDB/Mongoose của dự án e-commerce của bạn. Bộ dữ liệu này được thiết kế để tạo ấn tượng tốt nhất với giảng viên chấm bài bằng thông tin chi tiết, hình ảnh đẹp từ Unsplash và giá tiền thực tế bằng Việt Nam Đồng (VND).

---

## 1. Tóm tắt sơ đồ quan hệ dữ liệu (Schema mapping)
Mối quan hệ giữa các bảng (Collections) trong MongoDB được đồng bộ qua các `ObjectId`:
*   **Brands (5 thương hiệu)**: `La Roche-Posay`, `Anessa`, `Estee Lauder`, `Cocoon`, `Innisfree`.
*   **Categories (6 danh mục)**: `Sữa rửa mặt & Tẩy trang`, `Nước hoa hồng & Toner`, `Serum & Tinh chất`, `Kem dưỡng ẩm`, `Kem chống nắng`, `Son môi & Trang điểm`.
*   **Delivery Speed (2 hình thức vận chuyển)**: `Giao hàng tiêu chuẩn` (STANDARD) và `Giao hàng hỏa tốc` (EXPRESS).

---

## 2. Danh Sách Thương Hiệu (Brands)

Dưới đây là thông tin chi tiết của 5 thương hiệu nổi tiếng dùng làm dữ liệu demo.

| Tên Thương Hiệu | Hotline | Địa Chỉ | Mô Tả |
| :--- | :--- | :--- | :--- |
| **La Roche-Posay** | 1800-6663 | 120 Hai Bà Trưng, Quận 1, TP. HCM | Thương hiệu dược mỹ phẩm hàng đầu của Pháp, được hơn 90.000 bác sĩ da liễu khuyên dùng cho da nhạy cảm. |
| **Anessa** | 1800-5888 | Lầu 27, Bitexco Financial Tower, Quận 1, TP. HCM | Thương hiệu kem chống nắng số 1 Nhật Bản trong 21 năm liên tiếp thuộc tập đoàn danh tiếng Shiseido. |
| **Estee Lauder** | 1800-1122 | Lầu 8, Diamond Plaza, Quận 1, TP. HCM | Thương hiệu mỹ phẩm cao cấp (Hi-End) xa xỉ từ Mỹ, đi đầu về các sản phẩm chống lão hóa và trang điểm. |
| **Cocoon** | 1800-6869 | 38 Hoàng Diệu, Quận Phú Nhuận, TP. HCM | Mỹ phẩm thuần chay Việt Nam 100%, chiết xuất từ thiên nhiên lành tính như bí đao, nghệ, dừa Bến Tre. |
| **Innisfree** | 1800-5588 | 257 Hai Bà Trưng, Quận 3, TP. HCM | Thương hiệu mỹ phẩm thiên nhiên nổi tiếng từ hòn đảo ngọc Jeju tươi đẹp của Hàn Quốc. |

---

## 3. Danh Sách Danh Mục (Categories)

Các danh mục được ánh xạ chính xác với bộ lọc trên giao diện và được tạo `slug` tự động.

| Tên Danh Mục | Slug gợi ý | Mô tả danh mục |
| :--- | :--- | :--- |
| **Sữa rửa mặt & Tẩy trang** | `sua-rua-mat-tay-trang` | Làm sạch bụi bẩn, dầu thừa và lớp trang điểm sâu trong lỗ chân lông. |
| **Nước hoa hồng & Toner** | `nuoc-hoa-hong-toner` | Cân bằng độ pH, se khít lỗ chân lông và chuẩn bị cho các bước dưỡng da tiếp theo. |
| **Serum & Tinh chất** | `serum-tinh-chat` | Tinh chất cô đặc đặc trị thâm mụn, chống lão hóa và dưỡng sáng chuyên sâu. |
| **Kem dưỡng ẩm** | `kem-duong-am` | Cung cấp và duy trì độ ẩm cho làn da mịn màng, phục hồi hàng rào bảo vệ da. |
| **Kem chống nắng** | `kem-chong-nang` | Bảo vệ làn da tối ưu trước tác động nguy hại của tia UVA, UVB và môi trường. |
| **Son môi & Trang điểm** | `son-moi-trang-diem` | Son dưỡng môi, son thỏi và các sản phẩm makeup dịu nhẹ đem lại vẻ đẹp tự nhiên. |

---

## 4. Danh Sách 20 Sản Phẩm Chi Tiết

Tất cả sản phẩm đều có hình ảnh chất lượng từ Unsplash, thông số vật lý (dung tích, trọng lượng, kích thước) và nội dung tiếng Việt chuẩn chỉnh, chuyên nghiệp.

### I. Danh mục: Sữa rửa mặt & Tẩy trang (Cleansing)

#### 1. Sữa rửa mặt tạo bọt La Roche-Posay Effaclar Gel
*   **Thương hiệu**: La Roche-Posay
*   **Giá bán**: `385000` VND
*   **Số lượng tồn**: `120`
*   **Xuất xứ (Origin)**: Pháp
*   **Dung tích (Volume)**: `400` ml | **Khối lượng (Weight)**: `420` g
*   **Kích thước**: Rộng `6` cm × Cao `18` cm
*   **Đánh giá (Rating)**: `4.8` | **Đã bán**: `145`
*   **Mô tả**: Sữa rửa mặt tạo bọt nhẹ dịu dành riêng cho làn da dầu mụn nhạy cảm. Giúp làm sạch sâu bã nhờn dư thừa và bụi bẩn mà vẫn duy trì độ pH ổn định 5.5, mang lại làn da thông thoáng, không bị khô căng sau khi sử dụng.
*   **Hình ảnh**: `https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=600&auto=format&fit=crop`

#### 2. Nước tẩy trang thuần chay Cocoon Bí Đao
*   **Thương hiệu**: Cocoon
*   **Giá bán**: `275000` VND
*   **Số lượng tồn**: `150`
*   **Xuất xứ (Origin)**: Việt Nam
*   **Dung tích (Volume)**: `500` ml | **Khối lượng (Weight)**: `520` g
*   **Kích thước**: Rộng `7` cm × Cao `20` cm
*   **Đánh giá (Rating)**: `4.7` | **Đã bán**: `210`
*   **Mô tả**: Nước tẩy trang thuần chay từ bí đao thiên nhiên kết hợp cùng rau má và tràm trà hữu cơ. Giúp cuốn trôi hoàn toàn lớp trang điểm kháng nước, bã nhờn bám sâu mà không chứa cồn, không cay mắt và hỗ trợ điều trị mụn ẩn hiệu quả.
*   **Hình ảnh**: `https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=600&auto=format&fit=crop`

#### 3. Sữa rửa mặt Trà Xanh Dưỡng Ẩm Innisfree Hydrating Foam
*   **Thương hiệu**: Innisfree
*   **Giá bán**: `220000` VND
*   **Số lượng tồn**: `90`
*   **Xuất xứ (Origin)**: Hàn Quốc
*   **Dung tích (Volume)**: `150` ml | **Khối lượng (Weight)**: `180` g
*   **Kích thước**: Rộng `5` cm × Cao `15` cm
*   **Đánh giá (Rating)**: `4.6` | **Đã bán**: `85`
*   **Mô tả**: Sữa rửa mặt dưỡng ẩm chuyên sâu từ lá trà xanh Jeju tươi giàu Axit Amin. Lớp bọt kem mịn xốp len lỏi sâu để cuốn sạch bụi mịn mà vẫn dưỡng ẩm tự nhiên, không gây cảm giác khó chịu sau khi rửa.
*   **Hình ảnh**: `https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=600&auto=format&fit=crop`

---

### II. Danh mục: Nước hoa hồng & Toner (Toner)

#### 4. Nước hoa hồng kiềm dầu se khít lỗ chân lông La Roche-Posay
*   **Thương hiệu**: La Roche-Posay
*   **Giá bán**: `365000` VND
*   **Số lượng tồn**: `80`
*   **Xuất xứ (Origin)**: Pháp
*   **Dung tích (Volume)**: `200` ml | **Khối lượng (Weight)**: `220` g
*   **Kích thước**: Rộng `5` cm × Cao `16` cm
*   **Đánh giá (Rating)**: `4.5` | **Đã bán**: `92`
*   **Mô tả**: Toner đặc trị se khít lỗ chân lông lớn cho da dầu và da mụn với hoạt chất LHA đột phá. Giúp làm sạch bã nhờn tích tụ sâu ở vùng chữ T, đem lại làn da sáng mịn, khô thoáng chuẩn y khoa.
*   **Hình ảnh**: `https://images.unsplash.com/photo-1612817288484-6f916006741a?q=80&w=600&auto=format&fit=crop`

#### 5. Nước hoa hồng Cocoon Cánh Hoa Hồng Cao Bằng
*   **Thương hiệu**: Cocoon
*   **Giá bán**: `195000` VND
*   **Số lượng tồn**: `200`
*   **Xuất xứ (Origin)**: Việt Nam
*   **Dung tích (Volume)**: `140` ml | **Khối lượng (Weight)**: `160` g
*   **Kích thước**: Rộng `4.5` cm × Cao `14` cm
*   **Đánh giá (Rating)**: `4.9` | **Đã bán**: `320`
*   **Mô tả**: Chứa nước cất hoa hồng hữu cơ cao cấp kết hợp với axit hyaluronic và các yếu tố dưỡng ẩm tự nhiên (NMF). Sản phẩm chứa các cánh hoa hồng thật lơ lửng, giúp cấp ẩm tức thì, trả lại làn da căng mọng, hồng hào, giảm xỉn màu.
*   **Hình ảnh**: `https://images.unsplash.com/photo-1608248597481-496100c80836?q=80&w=600&auto=format&fit=crop`

#### 6. Nước hoa hồng Innisfree Green Tea Seed Hyaluronic Skin
*   **Thương hiệu**: Innisfree
*   **Giá bán**: `420000` VND
*   **Số lượng tồn**: `100`
*   **Xuất xứ (Origin)**: Hàn Quốc
*   **Dung tích (Volume)**: `170` ml | **Khối lượng (Weight)**: `195` g
*   **Kích thước**: Rộng `5` cm × Cao `16` cm
*   **Đánh giá (Rating)**: `4.7` | **Đã bán**: `110`
*   **Mô tả**: Sự kết hợp hoàn hảo giữa chiết xuất hạt trà xanh Jeju và Hyaluronic Acid thế hệ mới. Nước cân bằng thẩm thấu cực nhanh, dưỡng ẩm chuyên sâu từ bên trong tế bào da, hạn chế bong tróc da mùa lạnh.
*   **Hình ảnh**: `https://images.unsplash.com/photo-1612817288484-6f916006741a?q=80&w=600&auto=format&fit=crop`

---

### III. Danh mục: Serum & Tinh chất (Serum)

#### 7. Serum kiềm dầu giảm mụn chuyên sâu La Roche-Posay Effaclar
*   **Thương hiệu**: La Roche-Posay
*   **Giá bán**: `920000` VND
*   **Số lượng tồn**: `75`
*   **Xuất xứ (Origin)**: Pháp
*   **Dung tích (Volume)**: `30` ml | **Khối lượng (Weight)**: `85` g
*   **Kích thước**: Rộng `4` cm × Cao `10` cm
*   **Đánh giá (Rating)**: `4.8` | **Đã bán**: `185`
*   **Mô tả**: Tinh chất tối ưu chứa phức hợp 3 loại Acid chuyên sâu (LHA, Salicylic Acid, Glycolic Acid) cùng Niacinamide làm dịu da. Hỗ trợ tẩy tế bào chết nhẹ nhàng, giảm thâm mụn rõ rệt chỉ sau 28 ngày dùng đều đặn.
*   **Hình ảnh**: `https://images.unsplash.com/photo-1617897903246-719242758050?q=80&w=600&auto=format&fit=crop`

#### 8. Tinh chất phục hồi ban đêm thần thánh Estee Lauder Advanced Night Repair
*   **Thương hiệu**: Estee Lauder
*   **Giá bán**: `3450000` VND
*   **Số lượng tồn**: `40`
*   **Xuất xứ (Origin)**: Mỹ
*   **Dung tích (Volume)**: `50` ml | **Khối lượng (Weight)**: `120` g
*   **Kích thước**: Rộng `4.5` cm × Cao `12` cm
*   **Đánh giá (Rating)**: `5.0` | **Đã bán**: `150`
*   **Mô tả**: Tinh chất chống lão hóa đỉnh cao thế giới sử dụng công nghệ ChronoluxCB™ giúp tối ưu hóa quá trình phục hồi tự nhiên của da vào ban đêm. Giảm thiểu các nếp nhăn, tăng sinh collagen, làm da căng bóng mướt mịn rạng ngời chỉ sau 1 đêm.
*   **Hình ảnh**: `https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=600&auto=format&fit=crop`

#### 9. Tinh chất dưỡng sáng mờ thâm Cocoon Nghệ Hưng Yên x2 Vitamin C
*   **Thương hiệu**: Cocoon
*   **Giá bán**: `265000` VND
*   **Số lượng tồn**: `140`
*   **Xuất xứ (Origin)**: Việt Nam
*   **Dung tích (Volume)**: `30` ml | **Khối lượng (Weight)**: `80` g
*   **Kích thước**: Rộng `4` cm × Cao `10` cm
*   **Đánh giá (Rating)**: `4.7` | **Đã bán**: `240`
*   **Mô tả**: Chiết xuất dầu nghệ vùng đất Hưng Yên trứ danh kết hợp nhân đôi nồng độ dẫn xuất Vitamin C bền vững EAA. Xóa mờ hoàn toàn các vết thâm sau mụn, làm đều màu làn da xỉn màu và mang lại độ bóng khỏe tự nhiên.
*   **Hình ảnh**: `https://images.unsplash.com/photo-1608248597481-496100c80836?q=80&w=600&auto=format&fit=crop`

#### 10. Serum dưỡng ẩm tối ưu Innisfree Green Tea Seed Hyaluronic
*   **Thương hiệu**: Innisfree
*   **Giá bán**: `620000` VND
*   **Số lượng tồn**: `95`
*   **Xuất xứ (Origin)**: Hàn Quốc
*   **Dung tích (Volume)**: `80` ml | **Khối lượng (Weight)**: `150` g
*   **Kích thước**: Rộng `4.5` cm × Cao `13` cm
*   **Đánh giá (Rating)**: `4.8` | **Đã bán**: `190`
*   **Mô tả**: Tinh chất hạt trà xanh lên men nổi tiếng của Innisfree nay được bổ sung thêm 5 lớp Hyaluronic Acid tăng độ ngậm nước cho tế bào biểu bì, duy trì làn da mượt mà, khỏe mạnh bền vững.
*   **Hình ảnh**: `https://images.unsplash.com/photo-1617897903246-719242758050?q=80&w=600&auto=format&fit=crop`

---

### IV. Danh mục: Kem dưỡng ẩm (Moisturizer)

#### 11. Kem phục hồi làm dịu da La Roche-Posay Cicaplast Baume B5+
*   **Thương hiệu**: La Roche-Posay
*   **Giá bán**: `415000` VND
*   **Số lượng tồn**: `130`
*   **Xuất xứ (Origin)**: Pháp
*   **Dung tích (Volume)**: `40` ml | **Khối lượng (Weight)**: `60` g
*   **Kích thước**: Rộng `3.5` cm × Cao `13` cm
*   **Đánh giá (Rating)**: `4.9` | **Đã bán**: `420`
*   **Mô tả**: Phiên bản cải tiến B5+ với sự xuất hiện của hệ men vi sinh Tribioma độc quyền giúp tối ưu hóa hệ vi sinh vật trên da. Làm dịu ngay kích ứng da, trầy xước, thâm sau mụn và tái tạo biểu bì cực nhanh.
*   **Hình ảnh**: `https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?q=80&w=600&auto=format&fit=crop`

#### 12. Kem dưỡng trẻ hóa săn chắc da Estee Lauder Supreme+ Power Creme
*   **Thương hiệu**: Estee Lauder
*   **Giá bán**: `2790000` VND
*   **Số lượng tồn**: `30`
*   **Xuất xứ (Origin)**: Mỹ
*   **Dung tích (Volume)**: `50` ml | **Khối lượng (Weight)**: `180` g
*   **Kích thước**: Rộng `7` cm × Cao `6.5` cm
*   **Đánh giá (Rating)**: `4.9` | **Đã bán**: `75`
*   **Mô tả**: Dòng kem dưỡng cao cấp đa chức năng có chiết xuất độc quyền Moringa (Cây chùm ngây) và hoa dâm bụt buổi sáng Hibiscus Morning Bloom. Tăng độ đàn hồi gấp 2 lần, dưỡng ẩm suốt 72 giờ, nâng cơ da săn chắc và chống chảy xệ hiệu quả.
*   **Hình ảnh**: `https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=600&auto=format&fit=crop`

#### 13. Thạch bí đao kiểm soát dầu mụn Cocoon
*   **Thương hiệu**: Cocoon
*   **Giá bán**: `185000` VND
*   **Số lượng tồn**: `160`
*   **Xuất xứ (Origin)**: Việt Nam
*   **Dung tích (Volume)**: `30` ml | **Khối lượng (Weight)**: `100` g
*   **Kích thước**: Rộng `5.5` cm × Cao `5` cm
*   **Đánh giá (Rating)**: `4.7` | **Đã bán**: `165`
*   **Mô tả**: Dạng thạch mỏng nhẹ chiết xuất từ bí đao, 5% Niacinamide dưỡng ẩm cao cấp và chất tẩy tế bào chết thế hệ mới LHA. Thấm nhanh tức thì, không gây bít tắc chân lông, kiểm soát dầu thừa hữu hiệu và làm giảm sưng mụn viêm.
*   **Hình ảnh**: `https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?q=80&w=600&auto=format&fit=crop`

---

### V. Danh mục: Kem chống nắng (Sunscreen)

#### 14. Kem chống nắng bảo vệ quang phổ rộng La Roche-Posay Anthelios UVMune Fluid
*   **Thương hiệu**: La Roche-Posay
*   **Giá bán**: `495000` VND
*   **Số lượng tồn**: `110`
*   **Xuất xứ (Origin)**: Pháp
*   **Dung tích (Volume)**: `50` ml | **Khối lượng (Weight)**: `75` g
*   **Kích thước**: Rộng `4` cm × Cao `11` cm
*   **Đánh giá (Rating)**: `4.8` | **Đã bán**: `290`
*   **Mô tả**: Dòng kem dạng sữa lỏng siêu kháng nước được trang bị màng lọc UV thế hệ mới Mexoryl 400 độc quyền chống hiệu quả tia UVA bước sóng dài nhất 380-400nm. Bảo vệ tế bào da tuyệt đối trước sạm nám và nguy cơ lão hóa.
*   **Hình ảnh**: `https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?q=80&w=600&auto=format&fit=crop`

#### 15. Sữa chống nắng siêu kháng nước Anessa Gold Milk SPF50+
*   **Thương hiệu**: Anessa
*   **Giá bán**: `685000` VND
*   **Số lượng tồn**: `100`
*   **Xuất xứ (Origin)**: Nhật Bản
*   **Dung tích (Volume)**: `60` ml | **Khối lượng (Weight)**: `90` g
*   **Kích thước**: Rộng `4.5` cm × Cao `12` cm
*   **Đánh giá (Rating)**: `4.9` | **Đã bán**: `380`
*   **Mô tả**: Sữa chống nắng hàng đầu Nhật Bản với công nghệ Auto Booster giúp lớp màng bảo vệ tia cực tím trở nên vững chắc hơn khi tiếp xúc với độ ẩm cao, mồ hôi, nước biển và nhiệt độ mặt trời khắc nghiệt. Phù hợp cho hoạt động ngoài trời.
*   **Hình ảnh**: `https://images.unsplash.com/photo-1615396899839-c99c121888b0?q=80&w=600&auto=format&fit=crop`

#### 16. Kem chống nắng bí đao bảo vệ tối đa Cocoon
*   **Thương hiệu**: Cocoon
*   **Giá bán**: `325000` VND
*   **Số lượng tồn**: `125`
*   **Xuất xứ (Origin)**: Việt Nam
*   **Dung tích (Volume)**: `50` ml | **Khối lượng (Weight)**: `70` g
*   **Kích thước**: Rộng `4` cm × Cao `11` cm
*   **Đánh giá (Rating)**: `4.6` | **Đã bán**: `140`
*   **Mô tả**: Kem chống nắng vật lý lai hóa học quang phổ rộng tối ưu chứa 5 màng lọc tiên tiến thế hệ mới cùng chiết xuất bí đao. Không cay mắt, nâng tông nhẹ tự nhiên và hoàn toàn thân thiện với rạn san hô dưới biển.
*   **Hình ảnh**: `https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?q=80&w=600&auto=format&fit=crop`

---

### VI. Danh mục: Son môi & Trang điểm (Lip & Makeup)

#### 17. Son dưỡng chống nắng bảo vệ môi Anessa SPF35 PA+++
*   **Thương hiệu**: Anessa
*   **Giá bán**: `310000` VND
*   **Số lượng tồn**: `85`
*   **Xuất xứ (Origin)**: Nhật Bản
*   **Dung tích (Volume)**: `5` ml | **Khối lượng (Weight)**: `10` g
*   **Kích thước**: Rộng `1.5` cm × Cao `8` cm
*   **Đánh giá (Rating)**: `4.7` | **Đã bán**: `55`
*   **Mô tả**: Son dưỡng ẩm kiêm chống nắng độc đáo giúp chống lại ánh sáng mặt trời làm thâm xỉn môi, đồng thời nuôi dưỡng môi nứt nẻ trở nên hồng hào, ẩm mịn dài lâu.
*   **Hình ảnh**: `https://images.unsplash.com/photo-1586495777744-4413f21062fa?q=80&w=600&auto=format&fit=crop`

#### 18. Son thỏi lì mịn cao cấp Estee Lauder Pure Color Matte
*   **Thương hiệu**: Estee Lauder
*   **Giá bán**: `1120000` VND
*   **Số lượng tồn**: `40`
*   **Xuất xứ (Origin)**: Mỹ
*   **Dung tích (Volume)**: `4` ml | **Khối lượng (Weight)**: `25` g
*   **Kích thước**: Rộng `2` cm × Cao `7.5` cm
*   **Đánh giá (Rating)**: `5.0` | **Đã bán**: `65`
*   **Mô tả**: Son môi xa xỉ Estee Lauder sở hữu chất son kem lì mềm mịn, độ lên màu rực rỡ chuẩn từng milimet chỉ sau một lần lướt. Giữ màu lâu trôi đến 10 giờ nhưng luôn cung cấp dưỡng chất làm mềm, mướt căng đôi môi. Tông màu đỏ cổ điển quý phái.
*   **Hình ảnh**: `https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=600&auto=format&fit=crop`

#### 19. Son dưỡng ẩm Cocoon Dầu Dừa Bến Tre
*   **Thương hiệu**: Cocoon
*   **Giá bán**: `45000` VND
*   **Số lượng tồn**: `300`
*   **Xuất xứ (Origin)**: Việt Nam
*   **Dung tích (Volume)**: `5` ml | **Khối lượng (Weight)**: `10` g
*   **Kích thước**: Rộng `1.5` cm × Cao `7` cm
*   **Đánh giá (Rating)**: `4.8` | **Đã bán**: `540`
*   **Mô tả**: Son dưỡng thuần chay chiết xuất từ dầu dừa nguyên chất ép lạnh của Bến Tre cùng bơ hạt mỡ và vitamin E. Trị khô và bong tróc da môi cực kỳ hiệu quả, dịu ngọt tự nhiên, lành tính ăn được.
*   **Hình ảnh**: `https://images.unsplash.com/photo-1586495777744-4413f21062fa?q=80&w=600&auto=format&fit=crop`

#### 20. Son dưỡng có màu tự nhiên bóng mướt Innisfree Dewy Tint
*   **Thương hiệu**: Innisfree
*   **Giá bán**: `340000` VND
*   **Số lượng tồn**: `110`
*   **Xuất xứ (Origin)**: Hàn Quốc
*   **Dung tích (Volume)**: `4` ml | **Khối lượng (Weight)**: `12` g
*   **Kích thước**: Rộng `1.6` cm × Cao `8` cm
*   **Đánh giá (Rating)**: `4.7` | **Đã bán**: `145`
*   **Mô tả**: Son dưỡng tint bóng nhẹ cung cấp độ ẩm sâu từ dầu trà xanh Jeju. Tạo một lớp màng dưỡng căng mướt và phủ sắc màu hồng đào tự nhiên dịu nhẹ cho gương mặt tươi tắn rạng rỡ tức thì.
*   **Hình ảnh**: `https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=600&auto=format&fit=crop`

---

## 5. Dữ Liệu Dưới Dạng JSON Để Import Trực Tiếp Vào MongoDB

Để giúp bạn thuận tiện nhất, đây là mã JSON đầy đủ chuẩn format để bạn import trực tiếp vào MongoDB Compass hoặc dùng MongoDB script để insert.

### A. Collection: `brands`
```json
[
  {
    "_id": { "$oid": "64f89d3c5f2b8a7c9d000010" },
    "name": "La Roche-Posay",
    "hotline": "1800-6663",
    "desc": "Thương hiệu dược mỹ phẩm hàng đầu của Pháp, được hơn 90.000 bác sĩ da liễu khuyên dùng cho da nhạy cảm.",
    "address": "120 Hai Bà Trưng, Quận 1, TP. HCM",
    "created_at": { "$date": "2026-07-18T00:00:00Z" },
    "updated_at": { "$date": "2026-07-18T00:00:00Z" }
  },
  {
    "_id": { "$oid": "64f89d3c5f2b8a7c9d000020" },
    "name": "Anessa",
    "hotline": "1800-5888",
    "desc": "Thương hiệu kem chống nắng số 1 Nhật Bản trong 21 năm liên tiếp thuộc tập đoàn danh tiếng Shiseido.",
    "address": "Lầu 27, Bitexco Financial Tower, Quận 1, TP. HCM",
    "created_at": { "$date": "2026-07-18T00:00:00Z" },
    "updated_at": { "$date": "2026-07-18T00:00:00Z" }
  },
  {
    "_id": { "$oid": "64f89d3c5f2b8a7c9d000030" },
    "name": "Estee Lauder",
    "hotline": "1800-1122",
    "desc": "Thương hiệu mỹ phẩm cao cấp (Hi-End) xa xỉ từ Mỹ, đi đầu về các sản phẩm chống lão hóa và trang điểm.",
    "address": "Lầu 8, Diamond Plaza, Quận 1, TP. HCM",
    "created_at": { "$date": "2026-07-18T00:00:00Z" },
    "updated_at": { "$date": "2026-07-18T00:00:00Z" }
  },
  {
    "_id": { "$oid": "64f89d3c5f2b8a7c9d000040" },
    "name": "Cocoon",
    "hotline": "1800-6869",
    "desc": "Mỹ phẩm thuần chay Việt Nam 100%, chiết xuất từ thiên nhiên lành tính như bí đao, nghệ, dừa Bến Tre.",
    "address": "38 Hoàng Diệu, Quận Phú Nhuận, TP. HCM",
    "created_at": { "$date": "2026-07-18T00:00:00Z" },
    "updated_at": { "$date": "2026-07-18T00:00:00Z" }
  },
  {
    "_id": { "$oid": "64f89d3c5f2b8a7c9d000050" },
    "name": "Innisfree",
    "hotline": "1800-5588",
    "desc": "Thương hiệu mỹ phẩm thiên nhiên nổi tiếng từ hòn đảo ngọc Jeju tươi đẹp của Hàn Quốc.",
    "address": "257 Hai Bà Trưng, Quận 3, TP. HCM",
    "created_at": { "$date": "2026-07-18T00:00:00Z" },
    "updated_at": { "$date": "2026-07-18T00:00:00Z" }
  }
]
```

### B. Collection: `categories`
```json
[
  {
    "_id": { "$oid": "64f89d3c5f2b8a7c9d000100" },
    "name": "Sữa rửa mặt & Tẩy trang",
    "desc": "Làm sạch bụi bẩn, dầu thừa và lớp trang điểm sâu trong lỗ chân lông.",
    "slug": "sua-rua-mat-tay-trang",
    "created_at": { "$date": "2026-07-18T00:00:00Z" },
    "updated_at": { "$date": "2026-07-18T00:00:00Z" }
  },
  {
    "_id": { "$oid": "64f89d3c5f2b8a7c9d000200" },
    "name": "Nước hoa hồng & Toner",
    "desc": "Cân bằng độ pH, se khít lỗ chân lông và chuẩn bị cho các bước dưỡng da tiếp theo.",
    "slug": "nuoc-hoa-hong-toner",
    "created_at": { "$date": "2026-07-18T00:00:00Z" },
    "updated_at": { "$date": "2026-07-18T00:00:00Z" }
  },
  {
    "_id": { "$oid": "64f89d3c5f2b8a7c9d000300" },
    "name": "Serum & Tinh chất",
    "desc": "Tinh chất cô đặc đặc trị thâm mụn, chống lão hóa và dưỡng sáng chuyên sâu.",
    "slug": "serum-tinh-chat",
    "created_at": { "$date": "2026-07-18T00:00:00Z" },
    "updated_at": { "$date": "2026-07-18T00:00:00Z" }
  },
  {
    "_id": { "$oid": "64f89d3c5f2b8a7c9d000400" },
    "name": "Kem dưỡng ẩm",
    "desc": "Cung cấp và duy trì độ ẩm cho làn da mịn màng, phục hồi hàng rào bảo vệ da.",
    "slug": "kem-duong-am",
    "created_at": { "$date": "2026-07-18T00:00:00Z" },
    "updated_at": { "$date": "2026-07-18T00:00:00Z" }
  },
  {
    "_id": { "$oid": "64f89d3c5f2b8a7c9d000500" },
    "name": "Kem chống nắng",
    "desc": "Bảo vệ làn da tối ưu trước tác động nguy hại của tia UVA, UVB và môi trường.",
    "slug": "kem-chong-nang",
    "created_at": { "$date": "2026-07-18T00:00:00Z" },
    "updated_at": { "$date": "2026-07-18T00:00:00Z" }
  },
  {
    "_id": { "$oid": "64f89d3c5f2b8a7c9d000600" },
    "name": "Son môi & Trang điểm",
    "desc": "Son dưỡng môi, son thỏi và các sản phẩm makeup dịu nhẹ đem lại vẻ đẹp tự nhiên.",
    "slug": "son-moi-trang-diem",
    "created_at": { "$date": "2026-07-18T00:00:00Z" },
    "updated_at": { "$date": "2026-07-18T00:00:00Z" }
  }
]
```

### C. Collection: `delivery_methods`
```json
[
  {
    "_id": { "$oid": "64f89d3c5f2b8a7c9d000001" },
    "name": "Giao hàng tiêu chuẩn",
    "description": "Giao trong 3-5 ngày, phí ship theo khoảng cách từ cửa hàng",
    "type": 0,
    "status": 2,
    "created_at": { "$date": "2026-07-18T00:00:00Z" },
    "updated_at": { "$date": "2026-07-18T00:00:00Z" }
  },
  {
    "_id": { "$oid": "64f89d3c5f2b8a7c9d000002" },
    "name": "Giao hàng hỏa tốc",
    "description": "Giao trong 1-2 ngày, phụ phí hỏa tốc + phí ship theo khoảng cách",
    "type": 1,
    "status": 2,
    "created_at": { "$date": "2026-07-18T00:00:00Z" },
    "updated_at": { "$date": "2026-07-18T00:00:00Z" }
  }
]
```

### D. Collection: `products`
```json
[
  {
    "_id": { "$oid": "64f89d3c5f2b8a7c9d001001" },
    "name": "Sữa rửa mặt tạo bọt La Roche-Posay Effaclar Gel",
    "quantity": 120,
    "price": 385000,
    "description": "Sữa rửa mặt tạo bọt nhẹ dịu dành riêng cho làn da dầu mụn nhạy cảm. Giúp làm sạch sâu bã nhờn dư thừa và bụi bẩn mà vẫn duy trì độ pH ổn định 5.5, mang lại làn da thông thoáng, không bị khô căng sau khi sử dụng.",
    "rating_number": 4.8,
    "brand_id": { "$oid": "64f89d3c5f2b8a7c9d000010" },
    "origin": "Pháp",
    "volume": 400,
    "weight": 420,
    "width": 6,
    "height": 18,
    "soldNumber": 145,
    "thumbnail": "https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=600&auto=format&fit=crop",
    "medias": [
      {
        "url": "https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=600&auto=format&fit=crop",
        "type": 0
      }
    ],
    "status": 0,
    "category_id": { "$oid": "64f89d3c5f2b8a7c9d000100" },
    "ship_category_id": { "$oid": "64f89d3c5f2b8a7c9d000001" },
    "created_at": { "$date": "2026-07-18T00:00:00Z" },
    "updated_at": { "$date": "2026-07-18T00:00:00Z" }
  },
  {
    "_id": { "$oid": "64f89d3c5f2b8a7c9d001002" },
    "name": "Nước tẩy trang thuần chay Cocoon Bí Đao",
    "quantity": 150,
    "price": 275000,
    "description": "Nước tẩy trang thuần chay từ bí đao thiên nhiên kết hợp cùng rau má và tràm trà hữu cơ. Giúp cuốn trôi hoàn toàn lớp trang điểm kháng nước, bã nhờn bám sâu mà không chứa cồn, không cay mắt và hỗ trợ điều trị mụn ẩn hiệu quả.",
    "rating_number": 4.7,
    "brand_id": { "$oid": "64f89d3c5f2b8a7c9d000040" },
    "origin": "Việt Nam",
    "volume": 500,
    "weight": 520,
    "width": 7,
    "height": 20,
    "soldNumber": 210,
    "thumbnail": "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=600&auto=format&fit=crop",
    "medias": [
      {
        "url": "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=600&auto=format&fit=crop",
        "type": 0
      }
    ],
    "status": 0,
    "category_id": { "$oid": "64f89d3c5f2b8a7c9d000100" },
    "ship_category_id": { "$oid": "64f89d3c5f2b8a7c9d000001" },
    "created_at": { "$date": "2026-07-18T00:00:00Z" },
    "updated_at": { "$date": "2026-07-18T00:00:00Z" }
  },
  {
    "_id": { "$oid": "64f89d3c5f2b8a7c9d001003" },
    "name": "Sữa rửa mặt Trà Xanh Dưỡng Ẩm Innisfree Hydrating Foam",
    "quantity": 90,
    "price": 220000,
    "description": "Sữa rửa mặt dưỡng ẩm chuyên sâu từ lá trà xanh Jeju tươi giàu Axit Amin. Lớp bọt kem mịn xốp len lỏi sâu để cuốn sạch bụi mịn mà vẫn dưỡng ẩm tự nhiên, không gây cảm giác khó chịu sau khi rửa.",
    "rating_number": 4.6,
    "brand_id": { "$oid": "64f89d3c5f2b8a7c9d000050" },
    "origin": "Hàn Quốc",
    "volume": 150,
    "weight": 180,
    "width": 5,
    "height": 15,
    "soldNumber": 85,
    "thumbnail": "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=600&auto=format&fit=crop",
    "medias": [
      {
        "url": "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=600&auto=format&fit=crop",
        "type": 0
      }
    ],
    "status": 0,
    "category_id": { "$oid": "64f89d3c5f2b8a7c9d000100" },
    "ship_category_id": { "$oid": "64f89d3c5f2b8a7c9d000002" },
    "created_at": { "$date": "2026-07-18T00:00:00Z" },
    "updated_at": { "$date": "2026-07-18T00:00:00Z" }
  },
  {
    "_id": { "$oid": "64f89d3c5f2b8a7c9d001004" },
    "name": "Nước hoa hồng kiềm dầu se khít lỗ chân lông La Roche-Posay",
    "quantity": 80,
    "price": 365000,
    "description": "Toner đặc trị se khít lỗ chân lông lớn cho da dầu và da mụn với hoạt chất LHA đột phá. Giúp làm sạch bã nhờn tích tụ sâu ở vùng chữ T, đem lại làn da sáng mịn, khô thoáng chuẩn y khoa.",
    "rating_number": 4.5,
    "brand_id": { "$oid": "64f89d3c5f2b8a7c9d000010" },
    "origin": "Pháp",
    "volume": 200,
    "weight": 220,
    "width": 5,
    "height": 16,
    "soldNumber": 92,
    "thumbnail": "https://images.unsplash.com/photo-1612817288484-6f916006741a?q=80&w=600&auto=format&fit=crop",
    "medias": [
      {
        "url": "https://images.unsplash.com/photo-1612817288484-6f916006741a?q=80&w=600&auto=format&fit=crop",
        "type": 0
      }
    ],
    "status": 0,
    "category_id": { "$oid": "64f89d3c5f2b8a7c9d000200" },
    "ship_category_id": { "$oid": "64f89d3c5f2b8a7c9d000001" },
    "created_at": { "$date": "2026-07-18T00:00:00Z" },
    "updated_at": { "$date": "2026-07-18T00:00:00Z" }
  },
  {
    "_id": { "$oid": "64f89d3c5f2b8a7c9d001005" },
    "name": "Nước hoa hồng Cocoon Cánh Hoa Hồng Cao Bằng",
    "quantity": 200,
    "price": 195000,
    "description": "Chứa nước cất hoa hồng hữu cơ cao cấp kết hợp với axit hyaluronic và các yếu tố dưỡng ẩm tự nhiên (NMF). Sản phẩm chứa các cánh hoa hồng thật lơ lửng, giúp cấp ẩm tức thì, trả lại làn da căng mọng, hồng hào, giảm xỉn màu.",
    "rating_number": 4.9,
    "brand_id": { "$oid": "64f89d3c5f2b8a7c9d000040" },
    "origin": "Việt Nam",
    "volume": 140,
    "weight": 160,
    "width": 4.5,
    "height": 14,
    "soldNumber": 320,
    "thumbnail": "https://images.unsplash.com/photo-1608248597481-496100c80836?q=80&w=600&auto=format&fit=crop",
    "medias": [
      {
        "url": "https://images.unsplash.com/photo-1608248597481-496100c80836?q=80&w=600&auto=format&fit=crop",
        "type": 0
      }
    ],
    "status": 0,
    "category_id": { "$oid": "64f89d3c5f2b8a7c9d000200" },
    "ship_category_id": { "$oid": "64f89d3c5f2b8a7c9d000001" },
    "created_at": { "$date": "2026-07-18T00:00:00Z" },
    "updated_at": { "$date": "2026-07-18T00:00:00Z" }
  },
  {
    "_id": { "$oid": "64f89d3c5f2b8a7c9d001006" },
    "name": "Nước hoa hồng Innisfree Green Tea Seed Hyaluronic Skin",
    "quantity": 100,
    "price": 420000,
    "description": "Sự kết hợp hoàn hảo giữa chiết xuất hạt trà xanh Jeju và Hyaluronic Acid thế hệ mới. Nước cân bằng thẩm thấu cực nhanh, dưỡng ẩm chuyên sâu từ bên trong tế bào da, hạn chế bong tróc da mùa lạnh.",
    "rating_number": 4.7,
    "brand_id": { "$oid": "64f89d3c5f2b8a7c9d000050" },
    "origin": "Hàn Quốc",
    "volume": 170,
    "weight": 195,
    "width": 5,
    "height": 16,
    "soldNumber": 110,
    "thumbnail": "https://images.unsplash.com/photo-1612817288484-6f916006741a?q=80&w=600&auto=format&fit=crop",
    "medias": [
      {
        "url": "https://images.unsplash.com/photo-1612817288484-6f916006741a?q=80&w=600&auto=format&fit=crop",
        "type": 0
      }
    ],
    "status": 0,
    "category_id": { "$oid": "64f89d3c5f2b8a7c9d000200" },
    "ship_category_id": { "$oid": "64f89d3c5f2b8a7c9d000002" },
    "created_at": { "$date": "2026-07-18T00:00:00Z" },
    "updated_at": { "$date": "2026-07-18T00:00:00Z" }
  },
  {
    "_id": { "$oid": "64f89d3c5f2b8a7c9d001007" },
    "name": "Serum kiềm dầu giảm mụn chuyên sâu La Roche-Posay Effaclar",
    "quantity": 75,
    "price": 920000,
    "description": "Tinh chất tối ưu chứa phức hợp 3 loại Acid chuyên sâu (LHA, Salicylic Acid, Glycolic Acid) cùng Niacinamide làm dịu da. Hỗ trợ tẩy tế bào chết nhẹ nhàng, giảm thâm mụn rõ rệt chỉ sau 28 ngày dùng đều đặn.",
    "rating_number": 4.8,
    "brand_id": { "$oid": "64f89d3c5f2b8a7c9d000010" },
    "origin": "Pháp",
    "volume": 30,
    "weight": 85,
    "width": 4,
    "height": 10,
    "soldNumber": 185,
    "thumbnail": "https://images.unsplash.com/photo-1617897903246-719242758050?q=80&w=600&auto=format&fit=crop",
    "medias": [
      {
        "url": "https://images.unsplash.com/photo-1617897903246-719242758050?q=80&w=600&auto=format&fit=crop",
        "type": 0
      }
    ],
    "status": 0,
    "category_id": { "$oid": "64f89d3c5f2b8a7c9d000300" },
    "ship_category_id": { "$oid": "64f89d3c5f2b8a7c9d000001" },
    "created_at": { "$date": "2026-07-18T00:00:00Z" },
    "updated_at": { "$date": "2026-07-18T00:00:00Z" }
  },
  {
    "_id": { "$oid": "64f89d3c5f2b8a7c9d001008" },
    "name": "Tinh chất phục hồi ban đêm thần thánh Estee Lauder Advanced Night Repair",
    "quantity": 40,
    "price": 3450000,
    "description": "Tinh chất chống lão hóa đỉnh cao thế giới sử dụng công nghệ ChronoluxCB™ giúp tối ưu hóa quá trình phục hồi tự nhiên của da vào ban đêm. Giảm thiểu các nếp nhăn, tăng sinh collagen, làm da căng bóng mướt mịn rạng ngời chỉ sau 1 đêm.",
    "rating_number": 5.0,
    "brand_id": { "$oid": "64f89d3c5f2b8a7c9d000030" },
    "origin": "Mỹ",
    "volume": 50,
    "weight": 120,
    "width": 4.5,
    "height": 12,
    "soldNumber": 150,
    "thumbnail": "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=600&auto=format&fit=crop",
    "medias": [
      {
        "url": "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=600&auto=format&fit=crop",
        "type": 0
      }
    ],
    "status": 0,
    "category_id": { "$oid": "64f89d3c5f2b8a7c9d000300" },
    "ship_category_id": { "$oid": "64f89d3c5f2b8a7c9d000002" },
    "created_at": { "$date": "2026-07-18T00:00:00Z" },
    "updated_at": { "$date": "2026-07-18T00:00:00Z" }
  },
  {
    "_id": { "$oid": "64f89d3c5f2b8a7c9d001009" },
    "name": "Tinh chất dưỡng sáng mờ thâm Cocoon Nghệ Hưng Yên x2 Vitamin C",
    "quantity": 140,
    "price": 265000,
    "description": "Chiết xuất dầu nghệ vùng đất Hưng Yên trứ danh kết hợp nhân đôi nồng độ dẫn xuất Vitamin C bền vững EAA. Xóa mờ hoàn toàn các vết thâm sau mụn, làm đều màu làn da xỉn màu và mang lại độ bóng khỏe tự nhiên.",
    "rating_number": 4.7,
    "brand_id": { "$oid": "64f89d3c5f2b8a7c9d000040" },
    "origin": "Việt Nam",
    "volume": 30,
    "weight": 80,
    "width": 4,
    "height": 10,
    "soldNumber": 240,
    "thumbnail": "https://images.unsplash.com/photo-1608248597481-496100c80836?q=80&w=600&auto=format&fit=crop",
    "medias": [
      {
        "url": "https://images.unsplash.com/photo-1608248597481-496100c80836?q=80&w=600&auto=format&fit=crop",
        "type": 0
      }
    ],
    "status": 0,
    "category_id": { "$oid": "64f89d3c5f2b8a7c9d000300" },
    "ship_category_id": { "$oid": "64f89d3c5f2b8a7c9d000001" },
    "created_at": { "$date": "2026-07-18T00:00:00Z" },
    "updated_at": { "$date": "2026-07-18T00:00:00Z" }
  },
  {
    "_id": { "$oid": "64f89d3c5f2b8a7c9d001010" },
    "name": "Serum dưỡng ẩm tối ưu Innisfree Green Tea Seed Hyaluronic",
    "quantity": 95,
    "price": 620000,
    "description": "Tinh chất hạt trà xanh lên men nổi tiếng của Innisfree nay được bổ sung thêm 5 lớp Hyaluronic Acid tăng độ ngậm nước cho tế bào biểu bì, duy trì làn da mượt mà, khỏe mạnh bền vững.",
    "rating_number": 4.8,
    "brand_id": { "$oid": "64f89d3c5f2b8a7c9d000050" },
    "origin": "Hàn Quốc",
    "volume": 80,
    "weight": 150,
    "width": 4.5,
    "height": 13,
    "soldNumber": 190,
    "thumbnail": "https://images.unsplash.com/photo-1617897903246-719242758050?q=80&w=600&auto=format&fit=crop",
    "medias": [
      {
        "url": "https://images.unsplash.com/photo-1617897903246-719242758050?q=80&w=600&auto=format&fit=crop",
        "type": 0
      }
    ],
    "status": 0,
    "category_id": { "$oid": "64f89d3c5f2b8a7c9d000300" },
    "ship_category_id": { "$oid": "64f89d3c5f2b8a7c9d000002" },
    "created_at": { "$date": "2026-07-18T00:00:00Z" },
    "updated_at": { "$date": "2026-07-18T00:00:00Z" }
  },
  {
    "_id": { "$oid": "64f89d3c5f2b8a7c9d001011" },
    "name": "Kem phục hồi làm dịu da La Roche-Posay Cicaplast Baume B5+",
    "quantity": 130,
    "price": 415000,
    "description": "Phiên bản cải tiến B5+ với sự xuất hiện của hệ men vi sinh Tribioma độc quyền giúp tối ưu hóa hệ vi sinh vật trên da. Làm dịu ngay kích ứng da, trầy xước, thâm sau mụn và tái tạo biểu bì cực nhanh.",
    "rating_number": 4.9,
    "brand_id": { "$oid": "64f89d3c5f2b8a7c9d000010" },
    "origin": "Pháp",
    "volume": 40,
    "weight": 60,
    "width": 3.5,
    "height": 13,
    "soldNumber": 420,
    "thumbnail": "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?q=80&w=600&auto=format&fit=crop",
    "medias": [
      {
        "url": "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?q=80&w=600&auto=format&fit=crop",
        "type": 0
      }
    ],
    "status": 0,
    "category_id": { "$oid": "64f89d3c5f2b8a7c9d000400" },
    "ship_category_id": { "$oid": "64f89d3c5f2b8a7c9d000001" },
    "created_at": { "$date": "2026-07-18T00:00:00Z" },
    "updated_at": { "$date": "2026-07-18T00:00:00Z" }
  },
  {
    "_id": { "$oid": "64f89d3c5f2b8a7c9d001012" },
    "name": "Kem dưỡng trẻ hóa săn chắc da Estee Lauder Supreme+ Power Creme",
    "quantity": 30,
    "price": 2790000,
    "description": "Dòng kem dưỡng cao cấp đa chức năng có chiết xuất độc quyền Moringa (Cây chùm ngây) và hoa dâm bụt buổi sáng Hibiscus Morning Bloom. Tăng độ đàn hồi gấp 2 lần, dưỡng ẩm suốt 72 giờ, nâng cơ da săn chắc và chống chảy xệ hiệu quả.",
    "rating_number": 4.9,
    "brand_id": { "$oid": "64f89d3c5f2b8a7c9d000030" },
    "origin": "Mỹ",
    "volume": 50,
    "weight": 180,
    "width": 7,
    "height": 6.5,
    "soldNumber": 75,
    "thumbnail": "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=600&auto=format&fit=crop",
    "medias": [
      {
        "url": "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=600&auto=format&fit=crop",
        "type": 0
      }
    ],
    "status": 0,
    "category_id": { "$oid": "64f89d3c5f2b8a7c9d000400" },
    "ship_category_id": { "$oid": "64f89d3c5f2b8a7c9d000002" },
    "created_at": { "$date": "2026-07-18T00:00:00Z" },
    "updated_at": { "$date": "2026-07-18T00:00:00Z" }
  },
  {
    "_id": { "$oid": "64f89d3c5f2b8a7c9d001013" },
    "name": "Thạch bí đao kiểm soát dầu mụn Cocoon",
    "quantity": 160,
    "price": 185000,
    "description": "Dạng thạch mỏng nhẹ chiết xuất từ bí đao, 5% Niacinamide dưỡng ẩm cao cấp và chất tẩy tế bào chết thế hệ mới LHA. Thấm nhanh tức thì, không gây bít tắc chân lông, kiểm soát dầu thừa hữu hiệu và làm giảm sưng mụn viêm.",
    "rating_number": 4.7,
    "brand_id": { "$oid": "64f89d3c5f2b8a7c9d000040" },
    "origin": "Việt Nam",
    "volume": 30,
    "weight": 100,
    "width": 5.5,
    "height": 5,
    "soldNumber": 165,
    "thumbnail": "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?q=80&w=600&auto=format&fit=crop",
    "medias": [
      {
        "url": "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?q=80&w=600&auto=format&fit=crop",
        "type": 0
      }
    ],
    "status": 0,
    "category_id": { "$oid": "64f89d3c5f2b8a7c9d000400" },
    "ship_category_id": { "$oid": "64f89d3c5f2b8a7c9d000001" },
    "created_at": { "$date": "2026-07-18T00:00:00Z" },
    "updated_at": { "$date": "2026-07-18T00:00:00Z" }
  },
  {
    "_id": { "$oid": "64f89d3c5f2b8a7c9d001014" },
    "name": "Kem chống nắng bảo vệ quang phổ rộng La Roche-Posay Anthelios UVMune Fluid",
    "quantity": 110,
    "price": 495000,
    "description": "Dòng kem dạng sữa lỏng siêu kháng nước được trang bị màng lọc UV thế hệ mới Mexoryl 400 độc quyền chống hiệu quả tia UVA bước sóng dài nhất 380-400nm. Bảo vệ tế bào da tuyệt đối trước sạm nám và nguy cơ lão hóa.",
    "rating_number": 4.8,
    "brand_id": { "$oid": "64f89d3c5f2b8a7c9d000010" },
    "origin": "Pháp",
    "volume": 50,
    "weight": 75,
    "width": 4,
    "height": 11,
    "soldNumber": 290,
    "thumbnail": "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?q=80&w=600&auto=format&fit=crop",
    "medias": [
      {
        "url": "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?q=80&w=600&auto=format&fit=crop",
        "type": 0
      }
    ],
    "status": 0,
    "category_id": { "$oid": "64f89d3c5f2b8a7c9d000500" },
    "ship_category_id": { "$oid": "64f89d3c5f2b8a7c9d000001" },
    "created_at": { "$date": "2026-07-18T00:00:00Z" },
    "updated_at": { "$date": "2026-07-18T00:00:00Z" }
  },
  {
    "_id": { "$oid": "64f89d3c5f2b8a7c9d001015" },
    "name": "Sữa chống nắng siêu kháng nước Anessa Gold Milk SPF50+",
    "quantity": 100,
    "price": 685000,
    "description": "Sữa chống nắng hàng đầu Nhật Bản với công nghệ Auto Booster giúp lớp màng bảo vệ tia cực tím trở nên vững chắc hơn khi tiếp xúc với độ ẩm cao, mồ hôi, nước biển và nhiệt độ mặt trời khắc nghiệt. Phù hợp cho hoạt động ngoài trời.",
    "rating_number": 4.9,
    "brand_id": { "$oid": "64f89d3c5f2b8a7c9d000020" },
    "origin": "Nhật Bản",
    "volume": 60,
    "weight": 90,
    "width": 4.5,
    "height": 12,
    "soldNumber": 380,
    "thumbnail": "https://images.unsplash.com/photo-1615396899839-c99c121888b0?q=80&w=600&auto=format&fit=crop",
    "medias": [
      {
        "url": "https://images.unsplash.com/photo-1615396899839-c99c121888b0?q=80&w=600&auto=format&fit=crop",
        "type": 0
      }
    ],
    "status": 0,
    "category_id": { "$oid": "64f89d3c5f2b8a7c9d000500" },
    "ship_category_id": { "$oid": "64f89d3c5f2b8a7c9d000002" },
    "created_at": { "$date": "2026-07-18T00:00:00Z" },
    "updated_at": { "$date": "2026-07-18T00:00:00Z" }
  },
  {
    "_id": { "$oid": "64f89d3c5f2b8a7c9d001016" },
    "name": "Kem chống nắng bí đao bảo vệ tối đa Cocoon",
    "quantity": 125,
    "price": 325000,
    "description": "Kem chống nắng vật lý lai hóa học quang phổ rộng tối ưu chứa 5 màng lọc tiên tiến thế hệ mới cùng chiết xuất bí đao. Không cay mắt, nâng tông nhẹ tự nhiên và hoàn toàn thân thiện với rạn san hô dưới biển.",
    "rating_number": 4.6,
    "brand_id": { "$oid": "64f89d3c5f2b8a7c9d000040" },
    "origin": "Việt Nam",
    "volume": 50,
    "weight": 70,
    "width": 4,
    "height": 11,
    "soldNumber": 140,
    "thumbnail": "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?q=80&w=600&auto=format&fit=crop",
    "medias": [
      {
        "url": "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?q=80&w=600&auto=format&fit=crop",
        "type": 0
      }
    ],
    "status": 0,
    "category_id": { "$oid": "64f89d3c5f2b8a7c9d000500" },
    "ship_category_id": { "$oid": "64f89d3c5f2b8a7c9d000001" },
    "created_at": { "$date": "2026-07-18T00:00:00Z" },
    "updated_at": { "$date": "2026-07-18T00:00:00Z" }
  },
  {
    "_id": { "$oid": "64f89d3c5f2b8a7c9d001017" },
    "name": "Son dưỡng chống nắng bảo vệ môi Anessa SPF35 PA+++",
    "quantity": 85,
    "price": 310000,
    "description": "Son dưỡng ẩm kiêm chống nắng độc đáo giúp chống lại ánh sáng mặt trời làm thâm xỉn môi, đồng thời nuôi dưỡng môi nứt nẻ trở nên hồng hào, ẩm mịn dài lâu.",
    "rating_number": 4.7,
    "brand_id": { "$oid": "64f89d3c5f2b8a7c9d000020" },
    "origin": "Nhật Bản",
    "volume": 5,
    "weight": 10,
    "width": 1.5,
    "height": 8,
    "soldNumber": 55,
    "thumbnail": "https://images.unsplash.com/photo-1586495777744-4413f21062fa?q=80&w=600&auto=format&fit=crop",
    "medias": [
      {
        "url": "https://images.unsplash.com/photo-1586495777744-4413f21062fa?q=80&w=600&auto=format&fit=crop",
        "type": 0
      }
    ],
    "status": 0,
    "category_id": { "$oid": "64f89d3c5f2b8a7c9d000600" },
    "ship_category_id": { "$oid": "64f89d3c5f2b8a7c9d000002" },
    "created_at": { "$date": "2026-07-18T00:00:00Z" },
    "updated_at": { "$date": "2026-07-18T00:00:00Z" }
  },
  {
    "_id": { "$oid": "64f89d3c5f2b8a7c9d001018" },
    "name": "Son thỏi lì mịn cao cấp Estee Lauder Pure Color Matte",
    "quantity": 40,
    "price": 1120000,
    "description": "Son môi xa xỉ Estee Lauder sở hữu chất son kem lì mềm mịn, độ lên màu rực rỡ chuẩn từng milimet chỉ sau một lần lướt. Giữ màu lâu trôi đến 10 giờ nhưng luôn cung cấp dưỡng chất làm mềm, mướt căng đôi môi. Tông màu đỏ cổ điển quý phái.",
    "rating_number": 5.0,
    "brand_id": { "$oid": "64f89d3c5f2b8a7c9d000030" },
    "origin": "Mỹ",
    "volume": 4,
    "weight": 25,
    "width": 2,
    "height": 7.5,
    "soldNumber": 65,
    "thumbnail": "https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=600&auto=format&fit=crop",
    "medias": [
      {
        "url": "https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=600&auto=format&fit=crop",
        "type": 0
      }
    ],
    "status": 0,
    "category_id": { "$oid": "64f89d3c5f2b8a7c9d000600" },
    "ship_category_id": { "$oid": "64f89d3c5f2b8a7c9d000002" },
    "created_at": { "$date": "2026-07-18T00:00:00Z" },
    "updated_at": { "$date": "2026-07-18T00:00:00Z" }
  },
  {
    "_id": { "$oid": "64f89d3c5f2b8a7c9d001019" },
    "name": "Son dưỡng ẩm Cocoon Dầu Dừa Bến Tre",
    "quantity": 300,
    "price": 45000,
    "description": "Son dưỡng thuần chay chiết xuất từ dầu dừa nguyên chất ép lạnh của Bến Tre cùng bơ hạt mỡ và vitamin E. Trị khô và bong tróc da môi cực kỳ hiệu quả, dịu ngọt tự nhiên, lành tính ăn được.",
    "rating_number": 4.8,
    "brand_id": { "$oid": "64f89d3c5f2b8a7c9d000040" },
    "origin": "Việt Nam",
    "volume": 5,
    "weight": 10,
    "width": 1.5,
    "height": 7,
    "soldNumber": 540,
    "thumbnail": "https://images.unsplash.com/photo-1586495777744-4413f21062fa?q=80&w=600&auto=format&fit=crop",
    "medias": [
      {
        "url": "https://images.unsplash.com/photo-1586495777744-4413f21062fa?q=80&w=600&auto=format&fit=crop",
        "type": 0
      }
    ],
    "status": 0,
    "category_id": { "$oid": "64f89d3c5f2b8a7c9d000600" },
    "ship_category_id": { "$oid": "64f89d3c5f2b8a7c9d000001" },
    "created_at": { "$date": "2026-07-18T00:00:00Z" },
    "updated_at": { "$date": "2026-07-18T00:00:00Z" }
  },
  {
    "_id": { "$oid": "64f89d3c5f2b8a7c9d001020" },
    "name": "Son dưỡng có màu tự nhiên bóng mướt Innisfree Dewy Tint",
    "quantity": 110,
    "price": 340000,
    "description": "Son dưỡng tint bóng nhẹ cung cấp độ ẩm sâu từ dầu trà xanh Jeju. Tạo một lớp màng dưỡng căng mướt và phủ sắc màu hồng đào tự nhiên dịu nhẹ cho gương mặt tươi tắn rạng rỡ tức thì.",
    "rating_number": 4.7,
    "brand_id": { "$oid": "64f89d3c5f2b8a7c9d000050" },
    "origin": "Hàn Quốc",
    "volume": 4,
    "weight": 12,
    "width": 1.6,
    "height": 8,
    "soldNumber": 145,
    "thumbnail": "https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=600&auto=format&fit=crop",
    "medias": [
      {
        "url": "https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=600&auto=format&fit=crop",
        "type": 0
      }
    ],
    "status": 0,
    "category_id": { "$oid": "64f89d3c5f2b8a7c9d000600" },
    "ship_category_id": { "$oid": "64f89d3c5f2b8a7c9d000002" },
    "created_at": { "$date": "2026-07-18T00:00:00Z" },
    "updated_at": { "$date": "2026-07-18T00:00:00Z" }
  }
]
```

---

## 6. Hướng Dẫn Cách Nhập (Import) Dữ Liệu Nhanh Vào MongoDB

Để dữ liệu hiển thị hoàn hảo trên website của bạn, hãy thực hiện import 4 file JSON trên vào cơ sở dữ liệu MongoDB theo hướng dẫn dưới đây.

### Cách 1: Sử dụng MongoDB Compass (Giao diện trực quan)
1. **Mở MongoDB Compass** và kết nối tới database của bạn (ví dụ: `mongodb://localhost:27017` hoặc Atlas URI).
2. Chọn Database của dự án e-commerce của bạn (`Ecommerce_Store`).
3. Nhấp vào collection tương ứng (ví dụ: `brands`, `categories`, `delivery_methods`, hoặc `products`). Nếu chưa có collection, hãy chọn **Create Collection** và đặt tên cho đúng.
4. Chọn tab **Documents**, sau đó nhấn nút **Add Data** -> **Import JSON or CSV file**.
5. Copy nội dung JSON tương ứng ở mục 5 lưu thành file `.json` hoặc chọn file trực tiếp để import. MongoDB Compass hỗ trợ nhận diện các kiểu dữ liệu đặc biệt như `$oid` (ObjectId) và `$date` (ISODate) để chuyển thành kiểu dữ liệu MongoDB gốc tự động.

### Cách 2: Sử dụng dòng lệnh `mongoimport` (Nhanh chóng)
Nếu máy bạn đã cài đặt MongoDB Database Tools, bạn có thể chạy các lệnh sau trong Terminal (thay thế tên database và đường dẫn file phù hợp):

```bash
# Import Brands
mongoimport --db Ecommerce_Store --collection brands --file brands.json --jsonArray

# Import Categories
mongoimport --db Ecommerce_Store --collection categories --file categories.json --jsonArray

# Import Delivery Methods
mongoimport --db Ecommerce_Store --collection delivery_methods --file delivery_methods.json --jsonArray

# Import Products
mongoimport --db Ecommerce_Store --collection products --file products.json --jsonArray
```

/**
 * Nội dung các trang chính sách. Viết theo đúng hành vi hiện tại của hệ thống
 * (hủy đơn, phí ship, thanh toán, dữ liệu thu thập) — khi đổi logic backend thì cập nhật ở đây.
 */
export type PolicySection = { id: string; title: string; body: (string | string[])[] }
export type Policy = { slug: PolicySlug; title: string; short: string; intro: string; sections: PolicySection[] }

export const POLICY_SLUGS = ['doi-tra', 'van-chuyen', 'bao-mat', 'dieu-khoan'] as const
export type PolicySlug = (typeof POLICY_SLUGS)[number]

export const POLICY_UPDATED_AT = '27/11/2026'

export const POLICIES: Record<PolicySlug, Policy> = {
  'doi-tra': {
    slug: 'doi-tra',
    title: 'Chính sách đổi trả & hoàn tiền',
    short: 'Đổi trả',
    intro: 'Mỹ phẩm là sản phẩm dùng trực tiếp trên da, vì vậy chúng tôi đổi trả dựa trên tình trạng niêm phong và lỗi phát sinh từ phía cửa hàng.',
    sections: [
      {
        id: 'truong-hop',
        title: 'Trường hợp được đổi trả',
        body: [
          [
            'Giao sai sản phẩm, sai dung tích hoặc thiếu hàng so với đơn.',
            'Sản phẩm bị vỡ, móp, rò rỉ trong quá trình vận chuyển.',
            'Sản phẩm hết hạn sử dụng hoặc có dấu hiệu biến chất khi nhận.',
            'Sản phẩm lỗi từ nhà sản xuất (vòi bơm hỏng, nắp không đóng được…).'
          ]
        ]
      },
      {
        id: 'dieu-kien',
        title: 'Điều kiện & thời hạn',
        body: [
          'Vui lòng báo cho chúng tôi trong vòng 7 ngày kể từ khi nhận hàng, kèm ảnh hoặc video lúc mở hộp và mã đơn hàng.',
          [
            'Sản phẩm còn nguyên tem, seal, chưa qua sử dụng (trừ trường hợp lỗi sản xuất hoặc biến chất).',
            'Còn đầy đủ hộp, quà tặng kèm (nếu có).'
          ],
          'Chúng tôi không nhận đổi trả với sản phẩm đã mở seal vì lý do không hợp da hoặc không thích mùi. Nếu bạn gặp kích ứng, hãy liên hệ — chúng tôi sẽ xem xét từng trường hợp và tư vấn sản phẩm phù hợp hơn.'
        ]
      },
      {
        id: 'huy-don',
        title: 'Hủy đơn trước khi giao',
        body: [
          'Bạn có thể tự hủy đơn trong mục Đơn hàng của tôi khi đơn còn ở trạng thái Chờ xác nhận và chưa thanh toán online. Hàng sẽ được hoàn lại kho ngay.',
          'Với đơn đã xác nhận, đang giao hoặc đã thanh toán online, vui lòng liên hệ cửa hàng để được hỗ trợ hủy và hoàn tiền.'
        ]
      },
      {
        id: 'hoan-tien',
        title: 'Hoàn tiền',
        body: [
          [
            'Đơn thanh toán qua PayOS: hoàn về tài khoản đã thanh toán sau khi cửa hàng duyệt yêu cầu.',
            'Đơn thanh toán qua MoMo: hoàn về ví MoMo đã dùng.',
            'Đơn COD: hoàn bằng chuyển khoản tới tài khoản ngân hàng bạn cung cấp.'
          ],
          'Thời gian tiền về thường từ 3–7 ngày làm việc tùy ngân hàng/ví. Lỗi do cửa hàng thì chúng tôi chịu toàn bộ phí vận chuyển đổi trả.'
        ]
      }
    ]
  },
  'van-chuyen': {
    slug: 'van-chuyen',
    title: 'Vận chuyển & thanh toán',
    short: 'Vận chuyển',
    intro: 'Phí giao hàng được tính tự động theo khoảng cách từ kho tới địa chỉ nhận và hiển thị rõ trước khi bạn đặt hàng.',
    sections: [
      {
        id: 'khu-vuc',
        title: 'Khu vực giao hàng',
        body: [
          'Hiện chúng tôi giao trong bán kính 25 km tính từ kho tại TP. Hồ Chí Minh. Địa chỉ ngoài phạm vi này sẽ được báo ngay ở bước thanh toán.'
        ]
      },
      {
        id: 'phi-giao',
        title: 'Biểu phí',
        body: [
          ['Dưới 5 km: 15.000đ', '5 – dưới 10 km: 25.000đ', '10 – dưới 20 km: 40.000đ', '20 – 25 km: 60.000đ'],
          'Giao nhanh: cộng thêm 20.000đ so với phí tiêu chuẩn. Phí cuối cùng luôn hiển thị trước khi bạn bấm Đặt hàng.'
        ]
      },
      {
        id: 'thanh-toan',
        title: 'Phương thức thanh toán',
        body: [
          [
            'COD — thanh toán tiền mặt khi nhận hàng.',
            'PayOS — chuyển khoản/QR ngân hàng.',
            'MoMo — ví điện tử MoMo.'
          ],
          'Thanh toán online được xử lý trên trang của PayOS/MoMo. Vibrant Mart không lưu số thẻ hay thông tin đăng nhập ngân hàng của bạn.'
        ]
      },
      {
        id: 'theo-doi',
        title: 'Theo dõi đơn',
        body: [
          'Đơn đặt bằng tài khoản xem trong mục Đơn hàng của tôi. Đơn đặt không cần tài khoản có thể tra cứu bằng mã đơn và số điện thoại đặt hàng tại trang Tra cứu đơn.'
        ]
      }
    ]
  },
  'bao-mat': {
    slug: 'bao-mat',
    title: 'Chính sách bảo mật',
    short: 'Bảo mật',
    intro: 'Chúng tôi chỉ thu thập thông tin cần thiết để xử lý đơn hàng và vận hành tài khoản của bạn.',
    sections: [
      {
        id: 'thu-thap',
        title: 'Thông tin chúng tôi thu thập',
        body: [
          [
            'Tài khoản: họ tên, email, mật khẩu (được mã hóa), ảnh đại diện. Nếu đăng nhập bằng Google, chúng tôi nhận tên, email và ảnh đại diện từ Google.',
            'Đặt hàng: tên người nhận, số điện thoại, địa chỉ giao hàng, ghi chú, sản phẩm đã mua.',
            'Hoạt động mua sắm: giỏ hàng, danh sách yêu thích, đánh giá sản phẩm, voucher đã dùng.'
          ]
        ]
      },
      {
        id: 'su-dung',
        title: 'Mục đích sử dụng',
        body: [
          [
            'Xác nhận, giao hàng và hỗ trợ sau bán.',
            'Gửi email xác thực tài khoản, đặt lại mật khẩu và thông báo về đơn hàng.',
            'Thông báo nội bộ cho nhân viên khi có đơn mới để xử lý kịp thời.'
          ],
          'Chúng tôi không bán hay cho thuê thông tin cá nhân của bạn.'
        ]
      },
      {
        id: 'ben-thu-ba',
        title: 'Dịch vụ bên thứ ba',
        body: [
          'Một số thông tin được chia sẻ tối thiểu với các dịch vụ giúp vận hành cửa hàng:',
          [
            'PayOS, MoMo — xử lý thanh toán online.',
            'OpenStreetMap (Nominatim/OSRM) — chuyển địa chỉ giao hàng thành tọa độ để tính khoảng cách và phí ship.',
            'OpenAI — nội dung bạn nhắn với trợ lý tư vấn được gửi để tạo câu trả lời. Đừng nhập thông tin nhạy cảm vào khung chat.',
            'Google — khi bạn chọn đăng nhập bằng Google.'
          ]
        ]
      },
      {
        id: 'luu-tru',
        title: 'Lưu trữ trên trình duyệt',
        body: [
          'Chúng tôi không dùng cookie quảng cáo hay theo dõi. Trình duyệt của bạn lưu phiên đăng nhập, danh sách yêu thích (khi chưa đăng nhập) và lịch sử chat trong phiên hiện tại. Đăng xuất hoặc xóa dữ liệu trình duyệt sẽ xóa các thông tin này.'
        ]
      },
      {
        id: 'quyen',
        title: 'Quyền của bạn',
        body: [
          'Bạn có thể xem và sửa thông tin cá nhân, địa chỉ trong trang Hồ sơ. Để yêu cầu xóa tài khoản và dữ liệu liên quan, hãy liên hệ cửa hàng — dữ liệu đơn hàng có thể được giữ lại trong thời gian pháp luật yêu cầu cho mục đích kế toán.',
          'Khi tra cứu đơn không cần tài khoản, tên và số điện thoại người nhận luôn được che bớt để bảo vệ bạn.'
        ]
      }
    ]
  },
  'dieu-khoan': {
    slug: 'dieu-khoan',
    title: 'Điều khoản sử dụng',
    short: 'Điều khoản',
    intro: 'Khi truy cập và đặt hàng tại Vibrant Mart, bạn đồng ý với các điều khoản dưới đây.',
    sections: [
      {
        id: 'tai-khoan',
        title: 'Tài khoản',
        body: [
          'Bạn chịu trách nhiệm bảo mật mật khẩu và mọi hoạt động trong tài khoản của mình. Tài khoản có hành vi gian lận, đặt đơn ảo hoặc lạm dụng voucher có thể bị khóa.'
        ]
      },
      {
        id: 'don-hang',
        title: 'Đơn hàng & giá',
        body: [
          [
            'Giá và tồn kho được kiểm tra lại tại thời điểm đặt hàng; tổng tiền cuối cùng là số hiển thị ở bước thanh toán.',
            'Đơn hàng chỉ được xác nhận khi cửa hàng chuyển trạng thái sang Đã xác nhận. Chúng tôi có thể từ chối đơn có thông tin không chính xác hoặc vượt khu vực giao hàng.',
            'Mỗi voucher có điều kiện riêng (giá trị tối thiểu, thời hạn, số lượt dùng) và không quy đổi thành tiền mặt.'
          ]
        ]
      },
      {
        id: 'san-pham',
        title: 'Thông tin sản phẩm',
        body: [
          'Chúng tôi cố gắng mô tả chính xác thành phần, công dụng và hình ảnh. Màu sắc thực tế có thể chênh lệch nhẹ do màn hình. Hãy thử sản phẩm ở vùng da nhỏ trước khi dùng nếu da bạn nhạy cảm.',
          'Gợi ý từ trợ lý AI chỉ mang tính tham khảo, không thay thế tư vấn của bác sĩ da liễu.'
        ]
      },
      {
        id: 'danh-gia',
        title: 'Đánh giá & nội dung',
        body: [
          'Đánh giá cần trung thực và liên quan đến sản phẩm. Chúng tôi có thể ẩn nội dung xúc phạm, quảng cáo hoặc chứa thông tin cá nhân của người khác.'
        ]
      },
      {
        id: 'thay-doi',
        title: 'Thay đổi điều khoản',
        body: [
          'Điều khoản và chính sách có thể được cập nhật; ngày cập nhật gần nhất được ghi ở đầu mỗi trang. Đơn đã đặt áp dụng chính sách tại thời điểm đặt.'
        ]
      }
    ]
  }
}

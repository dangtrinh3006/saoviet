# Sao Việt — Product Backlog

Phiên bản 0.1 · 05/11/2026 · Nhóm sản phẩm (PO + BA + PM). Hiện trạng đọc từ mã nhánh `main` cùng ngày.

## 1. Personas

| # | Persona | Mục tiêu | Nỗi đau chính |
|---|---|---|---|
| P1 | **Khách lẻ** (25–35 tuổi, đặt qua điện thoại) | Chọn đêm trời tối, đặt nhanh, biết rõ giá | Không chắc đơn đã được nhận; quên mật khẩu là mất lịch sử đơn |
| P2 | **Nhóm / gia đình** (3–8 người, có trẻ em) | Lịch trình rõ, an toàn, chia phí | Cần thấy từng ngày làm gì; cần liên hệ người thật trước khi chốt |
| P3 | **Nhiếp ảnh thiên văn** | Đêm không trăng, Bortle thấp, ít mây | Cần dữ liệu bầu trời đáng tin, slot ít người, chia sẻ ảnh đã chụp |
| P4 | **Quản trị viên / điều hành tour** | Xử lý đơn, kiểm duyệt, hỗ trợ khách | Không gửi được thông báo; khách mất mật khẩu phải xử lý tay |

## 2. Năng lực hiện có (đọc mã 05/11/2026)

- Song ngữ vi/en bằng `next-intl` (`messages/vi.json`, `en.json`); đổi ngôn ngữ và giao diện sáng/tối.
- Danh mục 7 tour biên tập tĩnh trong `src/content/tours.ts` (giá VND, `maxGuests`, lịch trình dạng danh sách ngày).
- Đặt tour (`createOrder`, `src/server/actions.ts`): chọn 1 trong 42 đêm tới kèm độ chiếu sáng của trăng; giá tính phía server và chụp vào đơn; khách vãng lai đặt được.
- Mã đơn `SV-XXXXXX`; trạng thái `pending/confirmed/completed/cancelled`; khách tự huỷ đơn `pending` (`cancelMyOrder`).
- Đăng ký/đăng nhập email + mật khẩu (Better Auth, tối thiểu 8 ký tự, `src/lib/auth.ts`); **chưa có quên mật khẩu, chưa xác minh email**.
- Plugin `admin` của Better Auth đã bật (cột `role`, `banned`), quyền admin đọc từ DB; giao diện admin chỉ **hiển thị** vai trò/khoá.
- Trang Admin 3 tab: Đơn hàng (đổi trạng thái), Kiểm duyệt (ẩn/hiện review, comment, thread), Người dùng.
- Đánh giá tour 1–5 sao, mỗi người một đánh giá mỗi tour, chỉ văn bản.
- Blog (nội dung tĩnh, thanh tiến độ đọc) + bình luận; Diễn đàn tạo chủ đề + bình luận.
- Bản đồ bầu trời (MapLibre), panorama 360°, quả cầu Việt Nam 3D, trường sao Three.js.
- `/api/sky`: AQI + độ mây đêm nay từ Open-Meteo, cache 30 phút.
- Footer có khối công bố pháp lý bằng **dữ liệu mô phỏng có nhãn**; chưa có trang Chính sách/Điều khoản/Liên hệ.
- **Chưa có**: gửi email, thanh toán, voucher, wishlist, sitemap/robots.
- Kiểm thử: 2 tệp unit (Vitest), 6 spec e2e Playwright, có `axe-core` a11y và responsive.

## 3. Backlog ưu tiên (MoSCoW)

### Must — Sprint hiện tại

**SV-01 · Quên mật khẩu qua email** · M
Là khách lẻ, tôi muốn đặt lại mật khẩu qua liên kết gửi email để không mất tài khoản và lịch sử đơn.
- Given trang đăng nhập, When bấm "Quên mật khẩu" và nhập email, Then luôn hiện cùng một thông báo (không lộ email có tồn tại hay không).
- Given email tồn tại, When yêu cầu, Then một email chứa liên kết dùng một lần, hết hạn sau 1 giờ, được ghi vào outbox và gửi đi.
- Given liên kết hợp lệ, When đặt mật khẩu mới ≥ 8 ký tự, Then đăng nhập được bằng mật khẩu mới và các phiên cũ bị thu hồi.
- Given liên kết đã dùng/hết hạn, When mở, Then báo lỗi song ngữ và mời yêu cầu lại.

**SV-02 · Admin đặt lại mật khẩu cho người dùng** · S
Là quản trị viên, tôi muốn đặt lại mật khẩu cho một tài khoản để hỗ trợ khách khi email không tới.
- Given tab Người dùng, When admin chọn "Đặt lại mật khẩu" và xác nhận, Then hệ thống đặt mật khẩu tạm (hiện một lần) hoặc gửi liên kết đặt lại.
- Given đặt lại xong, Then mọi phiên của người đó bị thu hồi và hành động được ghi nhật ký (ai, khi nào).
- Given người gọi không phải admin (vai trò đọc từ DB), Then server từ chối.

**SV-03 · Hộp thư đi (outbox) cho admin** · M
Là quản trị viên, tôi muốn xem mọi email hệ thống đã/đang gửi để biết khách đã nhận thông báo chưa.
- Given có email được tạo, Then lưu bản ghi: người nhận, mẫu, ngôn ngữ, trạng thái `queued/sent/failed`, lỗi, thời điểm.
- Given tab Outbox, When lọc theo trạng thái/người nhận, Then danh sách phân trang đúng bộ lọc.
- Given email `failed`, When bấm "Gửi lại", Then tạo lượt gửi mới; bấm hai lần không gửi trùng.
- Given chưa cấu hình nhà cung cấp email, Then email nằm `queued` và giao diện nói rõ lý do.

**SV-04 · Timeline lịch trình 3D trên trang tour** · L
Là khách đi nhóm/gia đình, tôi muốn xem lịch trình theo trục thời gian trực quan để hình dung từng ngày.
- Given trang tour, Then mỗi mục `itinerary` là một mốc trên timeline, tiêu đề/nội dung theo ngôn ngữ đang chọn.
- Given cuộn hoặc phím mũi tên, Then mốc hiện tại được làm nổi; điều hướng được hoàn toàn bằng bàn phím.
- Given `prefers-reduced-motion` hoặc không có WebGL, Then hiện danh sách tĩnh cùng nội dung.
- Given màn hình 360 px, Then không cuộn ngang, nội dung đọc đầy đủ.

**SV-05 · Trang Chính sách bảo mật, Điều khoản, Liên hệ** · M
Là khách lẻ, tôi muốn đọc chính sách dữ liệu, điều khoản huỷ/hoàn và kênh liên hệ để yên tâm đặt tour.
- Given `/privacy`, `/terms`, `/contact` ở cả vi/en, Then trang tồn tại, có tiêu đề và ngày hiệu lực.
- Given trang Chính sách, Then nêu mục đích xử lý, loại dữ liệu, thời hạn lưu, quyền chủ thể theo NĐ 13/2023.
- Given form Liên hệ hợp lệ, When gửi, Then lưu yêu cầu, tạo email vào outbox, hiện xác nhận; dữ liệu đã nhập không mất khi lỗi mạng.

**SV-06 · Footer chuyên nghiệp** · S
Là khách lẻ, tôi muốn footer có đủ liên kết pháp lý, liên hệ và mạng xã hội để tìm thông tin nhanh.
- Given mọi trang, Then footer có nhóm Khám phá, Hỗ trợ (Liên hệ, Điều khoản, Bảo mật), Công ty, mạng xã hội.
- Given khối công bố pháp lý, Then vẫn giữ nhãn dữ liệu mô phỏng.
- Given mobile, Then các nhóm xếp dọc; axe không báo vi phạm.

### Must — sprint sau

**SV-07 · Email xác nhận đơn** · S
Là khách, tôi muốn nhận email kèm mã đơn ngay khi đặt để có bằng chứng đặt chỗ.
- Given `createOrder` thành công, Then một email theo ngôn ngữ khách vào outbox (phụ thuộc SV-03).
- Given gửi thất bại, Then đơn vẫn được tạo; lỗi hiện ở outbox.

**SV-08 · Thông báo thay đổi trạng thái đơn** · S
Là khách, tôi muốn được báo khi đơn được xác nhận/huỷ để chủ động lịch trình.
- Given admin đổi trạng thái, Then email tương ứng vào outbox.
- Given đổi về đúng trạng thái hiện tại, Then không gửi lại.

**SV-09 · Lịch khởi hành theo slot** · L
Là nhiếp ảnh thiên văn, tôi muốn chỉ chọn ngày còn chỗ để không bị huỷ vì đầy đoàn.
- Given mỗi tour có slot (ngày, sức chứa), Then lịch chỉ cho chọn ngày còn chỗ và hiện số chỗ còn.
- Given hai đơn đặt đồng thời chỗ cuối, Then chỉ một đơn thành công.

**SV-10 · Thanh toán trực tuyến** · L
Là khách, tôi muốn đặt cọc online để giữ chỗ chắc chắn.
- Given đơn `pending`, When thanh toán qua cổng (VNPay/MoMo), Then webhook đã xác thực chữ ký chuyển đơn sang `confirmed`.
- Given webhook gửi trùng, Then xử lý idempotent, không đổi trạng thái hai lần.

### Should

**SV-11 · Wishlist** · S
Là khách lẻ, tôi muốn lưu tour yêu thích để so sánh sau.
- Given đã đăng nhập, When bấm tim, Then tour vào danh sách ở trang Tài khoản; bấm lại thì bỏ.
- Given chưa đăng nhập, When bấm tim, Then được chuyển tới đăng nhập và quay lại đúng tour.

**SV-12 · Đánh giá có ảnh** · M
Là nhiếp ảnh thiên văn, tôi muốn đính ảnh vào đánh giá để chứng minh chất lượng bầu trời.
- Given tối đa 4 ảnh ≤ 5 MB, Then ảnh được bỏ EXIF GPS và kiểm duyệt được như review.
- Given người chưa có đơn `completed` của tour, Then không được đính ảnh.

**SV-13 · Voucher / mã giảm giá** · M
Là khách, tôi muốn nhập mã giảm giá để được ưu đãi.
- Given mã hợp lệ còn hạn, Then tổng tiền tính lại phía server và chụp vào đơn.
- Given mã sai/hết lượt, Then báo lỗi song ngữ rõ ràng, giá không đổi.

**SV-14 · Xác minh email khi đăng ký** · S
Là quản trị viên, tôi muốn email người dùng được xác minh để thông báo tới đúng người.
- Given đăng ký mới, Then gửi liên kết xác minh qua outbox.
- Given chưa xác minh, Then vẫn đặt được nhưng trang Tài khoản hiện nhắc.

**SV-15 · SEO blog** · M
Là điều hành tour, tôi muốn blog được công cụ tìm kiếm lập chỉ mục để có khách tự nhiên.
- Given build, Then có `sitemap.xml`, `robots.txt`, `hreflang` vi/en.
- Given trang bài viết/tour, Then có Open Graph và JSON-LD `Article`/`TouristTrip` hợp lệ.

### Could

**SV-16 · Đa tiền tệ hiển thị** · M
Là khách quốc tế, tôi muốn xem giá quy đổi USD/EUR để ước lượng chi phí.
- Given chọn tiền tệ, Then giá hiển thị quy đổi kèm ghi chú "thanh toán bằng VND".
- Given đặt đơn, Then đơn vẫn chụp giá VND.

**SV-17 · Xuất danh sách khách CSV** · S
Là điều hành tour, tôi muốn xuất khách theo ngày khởi hành để chuẩn bị xe, phòng.
- Given lọc ngày, When xuất, Then CSV UTF-8 đúng bộ lọc; chỉ admin truy cập được.

**SV-18 · Xuất/xoá dữ liệu cá nhân** · M
Là khách, tôi muốn tải hoặc xoá dữ liệu của mình để thực hiện quyền chủ thể theo NĐ 13/2023.
- Given trang Tài khoản, When gửi yêu cầu, Then tạo yêu cầu có hạn xử lý, admin thấy trong danh sách.
- Given đơn đã phát sinh giao dịch, Then được ẩn danh thay vì xoá cứng.

### Won't (giai đoạn này)
Ứng dụng di động gốc; đăng nhập mạng xã hội; chương trình đại lý/affiliate.

## 4. Definition of Done

1. **Test**: unit (Vitest) cho logic server mới; ít nhất 1 spec e2e Playwright cho luồng chính; test cũ vẫn xanh (so danh sách tên test, không so con số).
2. **Cổng tĩnh**: `tsc --noEmit`, `eslint`, `next build` sạch.
3. **A11y**: axe-core không vi phạm serious/critical; dùng được bằng bàn phím; tôn trọng `prefers-reduced-motion`.
4. **i18n**: mọi chuỗi hiển thị có ở cả `vi.json` và `en.json`; không chuỗi cứng trong component; email theo ngôn ngữ người nhận.
5. **Responsive**: kiểm ở 360, 768, 1280 px; không cuộn ngang; cả theme sáng/tối.
6. **Bảo mật**: quyền admin kiểm phía server từ DB; input qua zod; không secret trong repo.
7. **Chạy thật**: đã chạy với Postgres thật và nhà cung cấp email thật (hoặc sandbox của nó), bấm thử trên trình duyệt, có ảnh chụp. Chỉ test xanh thì chưa Done.
8. PO nghiệm thu theo acceptance criteria.

## 5. Rủi ro và phụ thuộc

| # | Rủi ro / phụ thuộc | Ảnh hưởng | Ứng phó |
|---|---|---|---|
| R1 | Nhà cung cấp email (Resend, SES…) cần API key + xác minh domain (SPF/DKIM) | Chặn SV-01, 03, 05, 07, 08, 14 | Outbox giữ `queued` khi chưa có key; key chỉ trong biến môi trường; xin key đầu sprint |
| R2 | Vercel Hobby chỉ cho dùng phi thương mại | Không được nhận tiền thật trên gói này | Giữ chế độ demo; trước SV-10 chuyển gói Pro hoặc hạ tầng khác |
| R3 | NĐ 13/2023/NĐ-CP bảo vệ dữ liệu cá nhân | Tên, email, SĐT, ghi chú đơn cần căn cứ xử lý, thông báo, quyền chủ thể | SV-05 + SV-18; tối thiểu hoá dữ liệu; chốt thời hạn lưu |
| R4 | Footer pháp lý là dữ liệu mô phỏng | Dễ bị hiểu là doanh nghiệp thật | Giữ nhãn mô phỏng đến khi có pháp nhân |
| R5 | Timeline 3D nặng trên máy yếu | LCP, pin, a11y | Tải lười, fallback 2D (AC của SV-04) |
| R6 | Open-Meteo miễn phí giới hạn theo IP | Dữ liệu bầu trời trống | Cache 30 phút đã có; hiện trạng thái "không có dữ liệu" |
| R7 | Thanh toán cần hợp đồng cổng + pháp nhân | SV-10 không làm sớm được | Xếp sau R2 |

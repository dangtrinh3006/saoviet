import type { L10n } from "./types";

/** "{contact}" inside any text is rendered as a link to the contact page. */
export type LegalBlock =
  | { kind: "p"; text: L10n }
  | { kind: "ul"; items: L10n[] }
  | { kind: "table"; head: L10n[]; rows: L10n[][] }
  | { kind: "note"; text: L10n };

export interface LegalSection {
  id: string;
  title: L10n;
  blocks: LegalBlock[];
}

export interface LegalDoc {
  version: string;
  /** ISO date the document takes effect. */
  effective: string;
  sections: LegalSection[];
}

export interface Faq {
  q: L10n;
  a: L10n;
}

export const privacyPolicy: LegalDoc = {
  version: "1.0",
  effective: "2026-11-05",
  sections: [
    {
      id: "scope",
      title: { vi: "Phạm vi áp dụng", en: "Scope" },
      blocks: [
        {
          kind: "p",
          text: {
            vi: "Chính sách này giải thích cách Sao Việt — một dự án cộng đồng phi lợi nhuận về du lịch thiên văn — thu thập, sử dụng, lưu trữ và bảo vệ dữ liệu cá nhân của bạn khi bạn truy cập website, tạo tài khoản, gửi yêu cầu đặt tour hoặc tham gia cộng đồng. Chính sách được xây dựng theo Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân và các văn bản sửa đổi, bổ sung hoặc thay thế có liên quan.",
            en: "This policy explains how Sao Việt — a non-profit community project for astro-tourism — collects, uses, stores and protects your personal data when you visit the website, create an account, send a tour booking request or take part in the community. It follows Vietnam's Decree 13/2023/ND-CP on personal data protection and any related amending, supplementing or replacing regulations.",
          },
        },
        {
          kind: "p",
          text: {
            vi: "Trong phạm vi chính sách này, Sao Việt là Bên Kiểm soát và xử lý dữ liệu cá nhân; bạn là chủ thể dữ liệu. Chúng tôi chỉ thu thập dữ liệu cá nhân cơ bản và không chủ động thu thập dữ liệu cá nhân nhạy cảm.",
            en: "For the purposes of this policy, Sao Việt acts as the Personal Data Controller and Processor; you are the data subject. We collect only basic personal data and do not intentionally collect sensitive personal data.",
          },
        },
      ],
    },
    {
      id: "data",
      title: { vi: "Dữ liệu chúng tôi thu thập", en: "Data we collect" },
      blocks: [
        {
          kind: "table",
          head: [
            { vi: "Nhóm dữ liệu", en: "Category" },
            { vi: "Chi tiết", en: "Details" },
            { vi: "Nguồn", en: "Source" },
          ],
          rows: [
            [
              { vi: "Tài khoản", en: "Account" },
              {
                vi: "Họ tên, email, mật khẩu (chỉ lưu dạng băm một chiều, chúng tôi không thể đọc được mật khẩu gốc), vai trò tài khoản, thời điểm tạo.",
                en: "Name, email, password (stored only as a one-way hash — we cannot read your original password), account role, creation time.",
              },
              { vi: "Bạn cung cấp khi đăng ký", en: "You, at sign-up" },
            ],
            [
              { vi: "Yêu cầu đặt tour", en: "Booking requests" },
              {
                vi: "Tên người liên hệ, email, số điện thoại, ngày khởi hành, số khách, ghi chú bạn tự nhập (ví dụ chế độ ăn, nhu cầu hỗ trợ).",
                en: "Contact name, email, phone number, departure date, number of guests, and any notes you type (for example dietary needs or assistance requests).",
              },
              { vi: "Bạn cung cấp khi đặt tour", en: "You, when booking" },
            ],
            [
              { vi: "Nội dung cộng đồng", en: "Community content" },
              {
                vi: "Đánh giá tour và số sao, bình luận, chủ đề và bài viết trên diễn đàn, kèm tên hiển thị và thời điểm đăng.",
                en: "Tour reviews and star ratings, comments, forum threads and posts, together with your display name and posting time.",
              },
              { vi: "Bạn đăng tải", en: "You, when posting" },
            ],
            [
              { vi: "Kỹ thuật", en: "Technical" },
              {
                vi: "Cookie phiên đăng nhập; địa chỉ IP và chuỗi nhận dạng trình duyệt (user agent) gắn với mỗi phiên đăng nhập; nhật ký truy cập máy chủ do nhà cung cấp hạ tầng ghi nhận.",
                en: "Sign-in session cookies; the IP address and browser user agent attached to each sign-in session; server access logs recorded by our hosting provider.",
              },
              { vi: "Tự động khi bạn sử dụng website", en: "Automatically, as you use the site" },
            ],
            [
              { vi: "Liên hệ", en: "Contact messages" },
              {
                vi: "Họ tên, email, chủ đề và nội dung bạn gửi qua biểu mẫu Liên hệ.",
                en: "Name, email, topic and message you send through the contact form.",
              },
              { vi: "Bạn cung cấp", en: "You" },
            ],
          ],
        },
        {
          kind: "note",
          text: {
            vi: "Vui lòng không đăng thông tin nhạy cảm (sức khỏe, tôn giáo, số giấy tờ tùy thân…) lên diễn đàn hoặc phần ghi chú. Nếu cần trao đổi về tình trạng sức khỏe liên quan đến chuyến đi, hãy liên hệ riêng với chúng tôi {contact}.",
            en: "Please do not post sensitive information (health, religion, ID numbers…) on the forum or in booking notes. If you need to discuss a health matter related to a trip, reach us privately {contact}.",
          },
        },
      ],
    },
    {
      id: "purposes",
      title: { vi: "Mục đích xử lý", en: "Why we process data" },
      blocks: [
        {
          kind: "ul",
          items: [
            {
              vi: "Tạo và duy trì tài khoản, xác thực đăng nhập, bảo vệ tài khoản khỏi truy cập trái phép.",
              en: "Creating and maintaining your account, authenticating sign-ins and protecting the account from unauthorised access.",
            },
            {
              vi: "Tiếp nhận, xác nhận và điều phối yêu cầu đặt tour; liên hệ với bạn về lịch trình, thời tiết và thay đổi chuyến đi.",
              en: "Receiving, confirming and coordinating booking requests; contacting you about schedules, weather and trip changes.",
            },
            {
              vi: "Hiển thị nội dung cộng đồng bạn đăng và kiểm duyệt nội dung theo Điều khoản sử dụng.",
              en: "Displaying the community content you publish and moderating it under our Terms.",
            },
            {
              vi: "Trả lời câu hỏi và yêu cầu bạn gửi qua trang Liên hệ.",
              en: "Answering questions and requests you send through the contact page.",
            },
            {
              vi: "Vận hành, bảo mật và khắc phục sự cố hệ thống; phát hiện hành vi lạm dụng hoặc gian lận.",
              en: "Operating, securing and troubleshooting the service; detecting abuse or fraud.",
            },
          ],
        },
        {
          kind: "p",
          text: {
            vi: "Chúng tôi không bán dữ liệu cá nhân, không dùng dữ liệu của bạn cho quảng cáo nhắm mục tiêu và không gửi thư tiếp thị khi chưa có sự đồng ý riêng của bạn.",
            en: "We do not sell personal data, do not use your data for targeted advertising, and do not send marketing email without your separate consent.",
          },
        },
      ],
    },
    {
      id: "consent",
      title: { vi: "Cơ sở pháp lý và sự đồng ý", en: "Legal basis and consent" },
      blocks: [
        {
          kind: "p",
          text: {
            vi: "Chúng tôi xử lý dữ liệu cá nhân trên cơ sở sự đồng ý của bạn. Sự đồng ý được thể hiện rõ ràng khi bạn chủ động đăng ký tài khoản, gửi yêu cầu đặt tour, đăng nội dung hoặc gửi biểu mẫu liên hệ sau khi được thông báo về chính sách này. Im lặng hoặc không phản hồi không được coi là đồng ý.",
            en: "We process personal data on the basis of your consent. Consent is given expressly when you actively create an account, send a booking request, publish content or submit the contact form after being informed of this policy. Silence or inaction is never treated as consent.",
          },
        },
        {
          kind: "p",
          text: {
            vi: "Trong một số trường hợp, pháp luật cho phép xử lý dữ liệu không cần sự đồng ý — ví dụ khi cần bảo vệ tính mạng, sức khỏe của bạn hoặc người khác trong tình huống khẩn cấp trên hành trình, hoặc khi cơ quan nhà nước có thẩm quyền yêu cầu theo quy định. Chúng tôi chỉ áp dụng các trường hợp này trong phạm vi tối thiểu cần thiết.",
            en: "In limited cases the law allows processing without consent — for example to protect your life or health, or someone else's, in an emergency during a trip, or when a competent authority requests it as provided by law. We rely on these grounds only to the minimum extent necessary.",
          },
        },
        {
          kind: "p",
          text: {
            vi: "Người dưới 18 tuổi chỉ tham gia tour khi có cha mẹ hoặc người giám hộ đặt chỗ và đi cùng; yêu cầu đặt tour cho trẻ em phải do người giám hộ gửi và đồng ý thay.",
            en: "Participants under 18 may join a tour only when a parent or guardian books and travels with them; booking requests for children must be sent, and consented to, by the guardian.",
          },
        },
      ],
    },
    {
      id: "retention",
      title: { vi: "Thời gian lưu trữ", en: "How long we keep data" },
      blocks: [
        {
          kind: "table",
          head: [
            { vi: "Dữ liệu", en: "Data" },
            { vi: "Thời hạn", en: "Retention" },
          ],
          rows: [
            [
              { vi: "Tài khoản", en: "Account" },
              { vi: "Trong suốt thời gian tài khoản còn hoạt động; xoá trong vòng 30 ngày sau khi bạn yêu cầu xoá tài khoản.", en: "For as long as the account is active; deleted within 30 days of your deletion request." },
            ],
            [
              { vi: "Yêu cầu đặt tour", en: "Booking requests" },
              { vi: "24 tháng kể từ ngày khởi hành để giải quyết khiếu nại và hoàn tiền, sau đó xoá hoặc ẩn danh hoá — trừ khi pháp luật yêu cầu lưu lâu hơn.", en: "24 months from the departure date, to handle complaints and refunds, then deleted or anonymised — unless the law requires longer retention." },
            ],
            [
              { vi: "Nội dung cộng đồng", en: "Community content" },
              { vi: "Cho đến khi bạn xoá, quản trị viên gỡ bỏ, hoặc tài khoản bị xoá. Khi xoá tài khoản, bạn có thể chọn xoá nội dung hoặc giữ lại dưới dạng ẩn danh.", en: "Until you delete it, a moderator removes it, or the account is deleted. On account deletion you may choose to delete your content or keep it anonymised." },
            ],
            [
              { vi: "Phiên đăng nhập (IP, user agent)", en: "Sessions (IP, user agent)" },
              { vi: "Đến khi phiên hết hạn hoặc bạn đăng xuất; bản ghi phiên đã hết hạn được dọn định kỳ.", en: "Until the session expires or you sign out; expired session records are purged periodically." },
            ],
            [
              { vi: "Tin nhắn liên hệ", en: "Contact messages" },
              { vi: "12 tháng kể từ khi yêu cầu được giải quyết.", en: "12 months after the request is resolved." },
            ],
          ],
        },
      ],
    },
    {
      id: "sharing",
      title: { vi: "Chia sẻ dữ liệu và bên xử lý", en: "Sharing and processors" },
      blocks: [
        {
          kind: "p",
          text: {
            vi: "Chúng tôi chỉ chia sẻ dữ liệu với các bên cung cấp hạ tầng cần thiết để vận hành website, theo hợp đồng và điều khoản bảo mật của họ:",
            en: "We share data only with the infrastructure providers needed to run the website, under their contractual and security terms:",
          },
        },
        {
          kind: "table",
          head: [
            { vi: "Bên nhận", en: "Recipient" },
            { vi: "Vai trò", en: "Role" },
            { vi: "Dữ liệu cá nhân", en: "Personal data" },
          ],
          rows: [
            [
              { vi: "Vercel", en: "Vercel" },
              { vi: "Lưu trữ và phân phối website", en: "Website hosting and delivery" },
              { vi: "Dữ liệu đi qua máy chủ khi bạn sử dụng website; nhật ký truy cập kỹ thuật (IP, user agent).", en: "Data passing through servers as you use the site; technical access logs (IP, user agent)." },
            ],
            [
              { vi: "Neon", en: "Neon" },
              { vi: "Cơ sở dữ liệu PostgreSQL", en: "PostgreSQL database" },
              { vi: "Toàn bộ dữ liệu tài khoản, đặt tour, cộng đồng và phiên đăng nhập.", en: "All account, booking, community and session data." },
            ],
            [
              { vi: "Nhà cung cấp dịch vụ email", en: "Email provider" },
              { vi: "Gửi email xác nhận và phản hồi — chỉ khi tính năng email được bật", en: "Sending confirmations and replies — only once email is enabled" },
              { vi: "Tên, email và nội dung thư gửi tới bạn.", en: "Your name, email and the content of messages sent to you." },
            ],
            [
              { vi: "Open-Meteo", en: "Open-Meteo" },
              { vi: "Dự báo mây và chất lượng không khí", en: "Cloud-cover and air-quality forecasts" },
              { vi: "Không có. Máy chủ của chúng tôi chỉ gửi toạ độ các điểm ngắm sao cố định, không gửi dữ liệu nào về bạn.", en: "None. Our server sends only the coordinates of fixed stargazing sites, never anything about you." },
            ],
          ],
        },
        {
          kind: "p",
          text: {
            vi: "Máy chủ của Vercel và Neon có thể đặt ngoài lãnh thổ Việt Nam. Bằng việc sử dụng dịch vụ, bạn đồng ý cho dữ liệu được chuyển và lưu trữ tại đó; chúng tôi thực hiện việc chuyển dữ liệu ra nước ngoài theo quy định pháp luật hiện hành. Ngoài các bên trên, chúng tôi chỉ cung cấp dữ liệu cho hướng dẫn viên, cơ sở lưu trú địa phương trong phạm vi cần thiết để thực hiện tour bạn đã đặt (tên, số khách, số điện thoại liên hệ), hoặc cho cơ quan nhà nước có thẩm quyền khi pháp luật yêu cầu.",
            en: "Vercel and Neon servers may be located outside Vietnam. By using the service you consent to your data being transferred to and stored there; we carry out such cross-border transfers in line with applicable law. Beyond these providers, we share data only with guides and local accommodation as far as needed to run the tour you booked (name, group size, contact phone), or with competent authorities where the law requires.",
          },
        },
      ],
    },
    {
      id: "rights",
      title: { vi: "Quyền của bạn", en: "Your rights" },
      blocks: [
        {
          kind: "p",
          text: {
            vi: "Là chủ thể dữ liệu, bạn có các quyền sau đối với dữ liệu cá nhân của mình:",
            en: "As a data subject you have the following rights over your personal data:",
          },
        },
        {
          kind: "ul",
          items: [
            { vi: "Được biết về hoạt động xử lý dữ liệu — chính là nội dung của chính sách này.", en: "To be informed about processing — which is what this policy does." },
            { vi: "Truy cập: xem và nhận bản sao dữ liệu chúng tôi đang lưu về bạn.", en: "Access: see and receive a copy of the data we hold about you." },
            { vi: "Chỉnh sửa: yêu cầu sửa dữ liệu không chính xác hoặc chưa đầy đủ.", en: "Rectification: have inaccurate or incomplete data corrected." },
            { vi: "Xoá: yêu cầu xoá tài khoản và dữ liệu liên quan, trừ phần pháp luật buộc phải lưu.", en: "Erasure: have your account and related data deleted, except what the law requires us to keep." },
            { vi: "Rút lại sự đồng ý, hạn chế hoặc phản đối việc xử lý. Việc rút lại không ảnh hưởng đến tính hợp pháp của việc xử lý đã thực hiện trước đó.", en: "Withdraw consent, restrict or object to processing. Withdrawal does not affect the lawfulness of processing carried out before it." },
            { vi: "Khiếu nại, tố cáo, khởi kiện và yêu cầu bồi thường thiệt hại theo quy định của pháp luật, bao gồm khiếu nại tới cơ quan chuyên trách bảo vệ dữ liệu cá nhân thuộc Bộ Công an.", en: "Complain, report, bring legal action and claim damages as provided by law, including complaining to the personal data protection authority under the Ministry of Public Security." },
          ],
        },
        {
          kind: "p",
          text: {
            vi: "Để thực hiện các quyền trên, hãy gửi yêu cầu {contact} và chọn chủ đề “Dữ liệu cá nhân”. Chúng tôi có thể đề nghị bạn xác minh danh tính (ví dụ gửi từ chính email đã đăng ký) trước khi xử lý. Chúng tôi phản hồi trong vòng 72 giờ kể từ khi nhận được yêu cầu hợp lệ; trường hợp phức tạp hơn sẽ được thông báo thời hạn cụ thể.",
            en: "To exercise these rights, send a request {contact} and choose the “Personal data” topic. We may ask you to verify your identity (for example by writing from the registered email) before acting. We respond within 72 hours of receiving a valid request; for more complex cases we will tell you the expected timeline.",
          },
        },
      ],
    },
    {
      id: "security",
      title: { vi: "Biện pháp bảo mật", en: "Security measures" },
      blocks: [
        {
          kind: "ul",
          items: [
            { vi: "Mọi kết nối tới website đều được mã hoá bằng HTTPS (TLS).", en: "All connections to the website are encrypted with HTTPS (TLS)." },
            { vi: "Mật khẩu được băm một chiều bằng thuật toán chuyên dụng trước khi lưu; không ai — kể cả quản trị viên — xem được mật khẩu gốc.", en: "Passwords are one-way hashed with a dedicated algorithm before storage; no one, including administrators, can see the original." },
            { vi: "Cookie phiên được đặt ở chế độ HttpOnly để mã độc trên trang không đọc được.", en: "Session cookies are HttpOnly so page scripts cannot read them." },
            { vi: "Quyền quản trị được kiểm tra lại từ cơ sở dữ liệu ở mỗi thao tác nhạy cảm; chỉ số ít thành viên vận hành có quyền truy cập dữ liệu đặt tour.", en: "Admin rights are re-checked against the database for every sensitive action; only a small number of operators can access booking data." },
            { vi: "Thông tin giá tour luôn lấy từ máy chủ, không tin dữ liệu gửi lên từ trình duyệt.", en: "Tour prices are always taken from the server, never trusted from the browser." },
            { vi: "Khi phát hiện sự cố lộ lọt dữ liệu, chúng tôi thông báo cho cơ quan có thẩm quyền trong vòng 72 giờ và thông báo cho người bị ảnh hưởng theo quy định.", en: "If a data breach is detected, we notify the competent authority within 72 hours and inform affected people as required by law." },
          ],
        },
        {
          kind: "p",
          text: {
            vi: "Không hệ thống nào an toàn tuyệt đối. Hãy dùng mật khẩu riêng cho Sao Việt và đăng xuất khi dùng máy tính chung.",
            en: "No system is perfectly secure. Use a unique password for Sao Việt and sign out on shared computers.",
          },
        },
      ],
    },
    {
      id: "cookies",
      title: { vi: "Cookie và lưu trữ trên trình duyệt", en: "Cookies and browser storage" },
      blocks: [
        {
          kind: "table",
          head: [
            { vi: "Loại", en: "Type" },
            { vi: "Mục đích", en: "Purpose" },
            { vi: "Thời hạn", en: "Lifetime" },
          ],
          rows: [
            [
              { vi: "Cookie phiên đăng nhập", en: "Session cookie" },
              { vi: "Giữ trạng thái đăng nhập; bắt buộc để dùng tài khoản.", en: "Keeps you signed in; required to use an account." },
              { vi: "Đến khi đăng xuất hoặc phiên hết hạn", en: "Until sign-out or session expiry" },
            ],
            [
              { vi: "Cookie bộ nhớ đệm phiên", en: "Session cache cookie" },
              { vi: "Giảm số lần truy vấn cơ sở dữ liệu khi kiểm tra đăng nhập.", en: "Reduces database lookups when checking sign-in." },
              { vi: "5 phút", en: "5 minutes" },
            ],
            [
              { vi: "Cookie ngôn ngữ", en: "Language cookie" },
              { vi: "Nhớ ngôn ngữ bạn đã chọn (Tiếng Việt / English).", en: "Remembers your language (Tiếng Việt / English)." },
              { vi: "Theo phiên trình duyệt hoặc tối đa 1 năm", en: "Browser session or up to 1 year" },
            ],
            [
              { vi: "Lưu trữ cục bộ (localStorage)", en: "Local storage" },
              { vi: "Nhớ giao diện sáng, tối hoặc đèn đỏ.", en: "Remembers the light, dark or red-light theme." },
              { vi: "Đến khi bạn xoá dữ liệu trình duyệt", en: "Until you clear browser data" },
            ],
          ],
        },
        {
          kind: "p",
          text: {
            vi: "Sao Việt không dùng cookie quảng cáo hay công cụ theo dõi của bên thứ ba. Bạn có thể chặn hoặc xoá cookie trong cài đặt trình duyệt; khi đó bạn vẫn xem được website nhưng không thể đăng nhập.",
            en: "Sao Việt uses no advertising cookies or third-party trackers. You can block or delete cookies in your browser settings; you can still browse the site, but you will not be able to sign in.",
          },
        },
      ],
    },
    {
      id: "changes",
      title: { vi: "Thay đổi chính sách và liên hệ", en: "Changes and contact" },
      blocks: [
        {
          kind: "p",
          text: {
            vi: "Khi chính sách thay đổi đáng kể, chúng tôi cập nhật ngày hiệu lực ở đầu trang và thông báo trên website trước khi áp dụng. Nếu thay đổi mở rộng mục đích xử lý, chúng tôi sẽ xin lại sự đồng ý của bạn.",
            en: "When this policy changes materially, we update the effective date at the top of the page and announce it on the website before it applies. If a change widens the purposes of processing, we will ask for your consent again.",
          },
        },
        {
          kind: "p",
          text: {
            vi: "Mọi câu hỏi và yêu cầu về dữ liệu cá nhân, vui lòng gửi {contact}.",
            en: "For any question or request about personal data, please write to us {contact}.",
          },
        },
      ],
    },
  ],
};

export const bookingTerms: LegalDoc = {
  version: "1.0",
  effective: "2026-11-05",
  sections: [
    {
      id: "about",
      title: { vi: "Về Sao Việt và phạm vi điều khoản", en: "About Sao Việt and these terms" },
      blocks: [
        {
          kind: "p",
          text: {
            vi: "Điều khoản này áp dụng cho mọi yêu cầu đặt tour, việc tham gia chuyến đi và việc sử dụng các tính năng cộng đồng (đánh giá, bình luận, diễn đàn) trên website Sao Việt. Khi gửi yêu cầu đặt tour hoặc đăng nội dung, bạn xác nhận đã đọc và đồng ý với các điều khoản dưới đây cùng Chính sách bảo vệ dữ liệu cá nhân.",
            en: "These terms apply to every booking request, to taking part in a trip, and to using the community features (reviews, comments, forum) on the Sao Việt website. By sending a booking request or publishing content, you confirm that you have read and agree to the terms below and to our Privacy Policy.",
          },
        },
        {
          kind: "p",
          text: {
            vi: "Giá tour được tính để bù chi phí thực tế (xe, lưu trú, bữa ăn, thiết bị, thù lao hướng dẫn viên và người dân địa phương) cùng một phần nhỏ cho bảo trì thiết bị và hoạt động giáo dục thiên văn miễn phí; Sao Việt không phân chia lợi nhuận.",
            en: "Tour prices are set to cover real costs (transport, lodging, meals, equipment, fees for guides and local hosts) plus a small share for equipment upkeep and free astronomy outreach; Sao Việt distributes no profit.",
          },
        },
      ],
    },
    {
      id: "booking",
      title: { vi: "Quy trình đặt tour", en: "How booking works" },
      blocks: [
        {
          kind: "ul",
          items: [
            { vi: "Bước 1 — Gửi yêu cầu: chọn ngày khởi hành, số khách và điền thông tin liên hệ trên trang tour. Bạn không cần tài khoản; hệ thống cấp một mã đặt chỗ dạng SV-XXXXXX.", en: "Step 1 — Request: choose a departure date and group size and fill in contact details on the tour page. No account is needed; you receive a booking code in the form SV-XXXXXX." },
            { vi: "Bước 2 — Xác nhận: trong vòng 24 giờ, chúng tôi liên hệ qua email hoặc điện thoại để xác nhận còn chỗ, điều kiện thời tiết dự kiến và hướng dẫn thanh toán đặt cọc.", en: "Step 2 — Confirmation: within 24 hours we contact you by email or phone to confirm availability, the expected sky conditions, and how to pay the deposit." },
            { vi: "Bước 3 — Đặt cọc: chỗ của bạn chỉ được giữ khi chúng tôi nhận được tiền cọc trong vòng 48 giờ kể từ khi xác nhận.", en: "Step 3 — Deposit: your place is held only once we receive the deposit within 48 hours of confirmation." },
            { vi: "Bước 4 — Thanh toán phần còn lại chậm nhất 7 ngày trước ngày khởi hành và nhận thông tin chi tiết về điểm hẹn, danh sách đồ cần mang.", en: "Step 4 — Pay the balance no later than 7 days before departure and receive the meeting point details and packing list." },
          ],
        },
        {
          kind: "note",
          text: {
            vi: "Yêu cầu đặt tour chưa phải là hợp đồng. Thoả thuận chỉ được xác lập khi Sao Việt xác nhận và bạn hoàn tất đặt cọc.",
            en: "A booking request is not yet a contract. The agreement is formed only when Sao Việt confirms and you complete the deposit.",
          },
        },
      ],
    },
    {
      id: "pricing",
      title: { vi: "Giá và thanh toán", en: "Prices and payment" },
      blocks: [
        {
          kind: "p",
          text: {
            vi: "Giá niêm yết bằng đồng Việt Nam (VND), tính theo mỗi khách, và là giá hệ thống ghi nhận tại thời điểm bạn gửi yêu cầu. Tiền đặt cọc là 30% tổng giá trị đơn.",
            en: "Prices are listed in Vietnamese đồng (VND) per guest, and the price recorded is the one shown when you send your request. The deposit is 30% of the order total.",
          },
        },
        {
          kind: "table",
          head: [
            { vi: "Đã bao gồm", en: "Included" },
            { vi: "Chưa bao gồm", en: "Not included" },
          ],
          rows: [
            [
              { vi: "Các hạng mục ghi trong mục “Bao gồm” của từng tour (xe, lưu trú, bữa ăn theo chương trình)", en: "Items listed under “Includes” on each tour (transport, lodging, programme meals)" },
              { vi: "Di chuyển cá nhân tới điểm hẹn", en: "Your own travel to the meeting point" },
            ],
            [
              { vi: "Kính thiên văn, đèn đỏ, thiết bị quan sát dùng chung", en: "Telescopes, red lights and shared observing gear" },
              { vi: "Bảo hiểm du lịch cá nhân (khuyến nghị mua)", en: "Personal travel insurance (recommended)" },
            ],
            [
              { vi: "Hướng dẫn viên thiên văn và người dẫn đường địa phương", en: "Astronomy guide and local guides" },
              { vi: "Đồ uống ngoài chương trình, chi tiêu cá nhân, tiền bồi dưỡng tự nguyện", en: "Extra drinks, personal spending, voluntary tips" },
            ],
            [
              { vi: "Phí vào cổng, vé tham quan khi được ghi trong lịch trình", en: "Entrance fees where stated in the itinerary" },
              { vi: "Phòng đơn và các dịch vụ nâng cấp theo yêu cầu", en: "Single rooms and other upgrades on request" },
            ],
          ],
        },
      ],
    },
    {
      id: "cancellation",
      title: { vi: "Huỷ tour và hoàn tiền", en: "Cancellation and refunds" },
      blocks: [
        {
          kind: "p",
          text: {
            vi: "Khi bạn huỷ, mức hoàn tiền tính trên tổng số tiền đã thanh toán và theo số ngày trước ngày khởi hành tại thời điểm chúng tôi nhận được yêu cầu huỷ:",
            en: "If you cancel, the refund is calculated on the total amount paid, according to how many days before departure we receive your cancellation:",
          },
        },
        {
          kind: "table",
          head: [
            { vi: "Thời điểm huỷ", en: "When you cancel" },
            { vi: "Mức hoàn", en: "Refund" },
          ],
          rows: [
            [
              { vi: "Từ 15 ngày trở lên trước ngày khởi hành", en: "15 days or more before departure" },
              { vi: "100%, trừ phí chuyển khoản và chi phí đã phát sinh không thể hoàn lại (nếu có)", en: "100%, less bank transfer fees and any non-recoverable costs already incurred" },
            ],
            [
              { vi: "Từ 7 đến 14 ngày", en: "7 to 14 days" },
              { vi: "50%", en: "50%" },
            ],
            [
              { vi: "Dưới 7 ngày hoặc không có mặt", en: "Less than 7 days, or no-show" },
              { vi: "Không hoàn tiền", en: "No refund" },
            ],
          ],
        },
        {
          kind: "ul",
          items: [
            { vi: "Bạn có thể chuyển chỗ cho người khác miễn phí nếu báo trước ít nhất 3 ngày và người đó đáp ứng yêu cầu sức khỏe của tour.", en: "You may transfer your place to someone else free of charge with at least 3 days' notice, provided they meet the tour's fitness requirements." },
            { vi: "Tiền hoàn được chuyển về tài khoản thanh toán ban đầu trong vòng 10 ngày làm việc.", en: "Refunds are paid to the original payment account within 10 working days." },
            { vi: "Nếu Sao Việt huỷ tour vì lý do của mình (thiếu hướng dẫn viên, không đủ khách tối thiểu), bạn được hoàn 100% hoặc chuyển sang ngày khác tuỳ chọn.", en: "If Sao Việt cancels for its own reasons (no guide available, minimum group not reached), you receive a 100% refund or a new date of your choice." },
          ],
        },
      ],
    },
    {
      id: "weather",
      title: { vi: "Thời tiết, mây che và đêm trăng tròn", en: "Weather, cloud cover and full-moon nights" },
      blocks: [
        {
          kind: "p",
          text: {
            vi: "Ngắm sao phụ thuộc vào bầu trời — điều không ai hứa trước được. Chúng tôi theo dõi dự báo lượng mây cho từng điểm và áp dụng chính sách sau:",
            en: "Stargazing depends on the sky, which no one can promise in advance. We track cloud-cover forecasts for each site and apply the following policy:",
          },
        },
        {
          kind: "ul",
          items: [
            { vi: "48 giờ trước ngày khởi hành, nếu dự báo lượng mây trung bình trong khung giờ quan sát (20:00–04:00) từ 70% trở lên cho tất cả các đêm của tour, chúng tôi chủ động đề xuất dời lịch. Bạn được dời ngày miễn phí một lần trong vòng 6 tháng, hoặc nhận hoàn 100% nếu không chọn được ngày phù hợp.", en: "48 hours before departure, if forecast average cloud cover during observing hours (20:00–04:00) is 70% or more for every night of the tour, we will propose rescheduling. You may reschedule once, free of charge, within 6 months, or receive a 100% refund if no suitable date works." },
            { vi: "Nếu bạn vẫn chọn đi, hoặc trời đổi mây ngoài dự báo khi đã khởi hành, tour diễn ra với chương trình thay thế (thuyết trình bầu trời, mô phỏng trên phần mềm planetarium, chụp cảnh biển mây hoặc bình minh). Trường hợp này không được hoàn tiền vì chi phí xe, lưu trú đã phát sinh.", en: "If you still choose to go, or clouds roll in unexpectedly once the trip has started, the tour runs with an alternative programme (sky talk, planetarium-software session, cloud-sea or sunrise photography). No refund applies in this case, as transport and lodging costs are already incurred." },
            { vi: "Khi có cảnh báo bão, lũ, sạt lở hoặc cơ quan địa phương hạn chế đi lại, chúng tôi huỷ hoặc dời tour vì an toàn; bạn được chọn dời ngày miễn phí hoặc hoàn 100% phần chi phí chưa phát sinh.", en: "When there are storm, flood or landslide warnings, or local authorities restrict travel, we cancel or postpone for safety; you may reschedule free of charge or receive a 100% refund of costs not yet incurred." },
          ],
        },
        {
          kind: "note",
          text: {
            vi: "Đêm trăng tròn: trong khoảng 3 ngày trước và sau trăng tròn, ánh trăng làm mờ Ngân Hà và các thiên thể mờ. Lịch khởi hành rơi vào giai đoạn này được ghi chú rõ và chuyển trọng tâm sang quan sát Mặt Trăng, hành tinh và sao đôi. Vì đã được thông báo trước, ánh trăng không phải là lý do hoàn tiền hoặc dời lịch miễn phí. Muốn chụp Ngân Hà, hãy chọn ngày gần trăng non.",
            en: "Full-moon nights: for about 3 days either side of full moon, moonlight washes out the Milky Way and faint objects. Departures in that window are clearly labelled and focus on the Moon, planets and double stars instead. Because this is disclosed in advance, moonlight is not grounds for a refund or free rescheduling. For Milky Way photography, choose dates near new moon.",
          },
        },
      ],
    },
    {
      id: "participants",
      title: { vi: "Trách nhiệm của người tham gia", en: "Participant responsibilities" },
      blocks: [
        {
          kind: "ul",
          items: [
            { vi: "Cung cấp thông tin liên hệ chính xác và thông báo trước về bệnh lý, dị ứng hoặc nhu cầu hỗ trợ đặc biệt.", en: "Give accurate contact details and tell us in advance about medical conditions, allergies or special assistance needs." },
            { vi: "Có mặt đúng giờ tại điểm hẹn; tour không chờ quá 30 phút.", en: "Arrive at the meeting point on time; the tour will not wait more than 30 minutes." },
            { vi: "Tuân thủ hướng dẫn của trưởng đoàn, đặc biệt khi di chuyển trên sống núi, đường đèo và trong bóng tối.", en: "Follow the trip leader's instructions, especially on ridges, mountain passes and in the dark." },
            { vi: "Giữ bóng tối tại điểm quan sát: chỉ dùng đèn đỏ, không chiếu đèn pin trắng hay đèn flash vào người khác và vào kính thiên văn.", en: "Protect the dark at observing sites: use red light only, and never point white torches or flash at people or telescopes." },
            { vi: "Không đốt lửa, thả đèn trời, bay flycam khi chưa được phép; mang rác ra khỏi điểm cắm trại và tôn trọng phong tục của cộng đồng địa phương.", en: "No fires, sky lanterns or drones without permission; carry out all litter and respect the customs of local communities." },
            { vi: "Tự bảo quản tư trang; bồi thường nếu cố ý hoặc bất cẩn làm hư hỏng thiết bị của đoàn.", en: "Look after your belongings, and pay for group equipment you damage deliberately or through negligence." },
          ],
        },
      ],
    },
    {
      id: "safety",
      title: { vi: "An toàn ở vùng núi cao", en: "Safety at high altitude" },
      blocks: [
        {
          kind: "p",
          text: {
            vi: "Nhiều điểm ngắm sao nằm ở độ cao 1.500–3.100 m như Tà Xùa, Y Tý, Bạch Mộc Lương Tử hay Fansipan. Ban đêm nhiệt độ có thể xuống gần 0 °C, gió mạnh và sương dày, kể cả vào mùa hè.",
            en: "Many stargazing sites sit at 1,500–3,100 m — Ta Xua, Y Ty, Bach Moc Luong Tu, Fansipan. Night temperatures can approach 0 °C with strong wind and heavy dew, even in summer.",
          },
        },
        {
          kind: "ul",
          items: [
            { vi: "Mang áo giữ nhiệt, áo khoác chắn gió, mũ len, găng tay và giày leo núi có độ bám tốt theo danh sách chúng tôi gửi.", en: "Bring thermal layers, a windproof jacket, a warm hat, gloves and grippy hiking boots as per the list we send." },
            { vi: "Tour độ khó “khó” yêu cầu đi bộ 6–8 giờ mỗi ngày; người có bệnh tim mạch, huyết áp, hô hấp hoặc đang mang thai cần hỏi ý kiến bác sĩ trước khi đăng ký.", en: "“Hard” tours involve 6–8 hours of walking a day; anyone with heart, blood-pressure or respiratory conditions, or who is pregnant, should consult a doctor before booking." },
            { vi: "Trưởng đoàn có quyền dừng hoặc rút ngắn hành trình của một khách hoặc cả đoàn khi điều kiện sức khỏe hay thời tiết không bảo đảm an toàn. Quyết định này không làm phát sinh nghĩa vụ hoàn tiền phần đã thực hiện.", en: "The trip leader may stop or shorten the trip for one guest or the whole group when health or weather makes it unsafe. Such a decision does not create a refund obligation for the part already delivered." },
            { vi: "Không uống rượu bia trước và trong khi di chuyển trên địa hình núi vào ban đêm.", en: "No alcohol before or while moving over mountain terrain at night." },
          ],
        },
      ],
    },
    {
      id: "liability",
      title: { vi: "Giới hạn trách nhiệm", en: "Limitation of liability" },
      blocks: [
        {
          kind: "ul",
          items: [
            { vi: "Sao Việt chịu trách nhiệm tổ chức tour đúng chương trình đã xác nhận và lựa chọn đối tác vận chuyển, lưu trú cẩn trọng.", en: "Sao Việt is responsible for running the tour as confirmed and for choosing transport and lodging partners with care." },
            { vi: "Trong phạm vi pháp luật cho phép, tổng trách nhiệm bồi thường của Sao Việt đối với một đơn đặt tour không vượt quá số tiền bạn đã thanh toán cho đơn đó.", en: "To the extent permitted by law, Sao Việt's total liability for a booking does not exceed the amount you paid for it." },
            { vi: "Chúng tôi không chịu trách nhiệm về thiệt hại do sự kiện bất khả kháng (thiên tai, dịch bệnh, quyết định của cơ quan nhà nước), do bạn không tuân thủ hướng dẫn an toàn, hoặc về mất mát tư trang không giao cho đoàn giữ.", en: "We are not liable for losses caused by force majeure (natural disasters, epidemics, government orders), by your failure to follow safety instructions, or for personal belongings not handed to the group for safekeeping." },
            { vi: "Điều kiện bầu trời, chỉ số Bortle, độ sáng nền SQM và điểm “đêm nay” trên website là ước tính tham khảo, không phải cam kết về chất lượng quan sát.", en: "Sky conditions, Bortle class, SQM sky brightness and the “tonight” score on the website are reference estimates, not a guarantee of observing quality." },
            { vi: "Không điều khoản nào loại trừ trách nhiệm của Sao Việt đối với thiệt hại về tính mạng, sức khỏe do lỗi của chúng tôi gây ra.", en: "Nothing in these terms excludes Sao Việt's liability for death or personal injury caused by our fault." },
          ],
        },
      ],
    },
    {
      id: "community",
      title: { vi: "Quy tắc nội dung cộng đồng", en: "Community content rules" },
      blocks: [
        {
          kind: "p",
          text: {
            vi: "Đánh giá, bình luận và diễn đàn tồn tại để mọi người chia sẻ kinh nghiệm thật về bầu trời Việt Nam. Khi đăng nội dung, bạn đồng ý:",
            en: "Reviews, comments and the forum exist so people can share genuine experience of Vietnam's night sky. When you post, you agree to:",
          },
        },
        {
          kind: "ul",
          items: [
            { vi: "Chỉ đánh giá tour bạn đã thực sự tham gia; mỗi tài khoản có một đánh giá cho mỗi tour và có thể sửa lại.", en: "Review only tours you actually joined; each account has one review per tour, which you can edit." },
            { vi: "Không đăng nội dung vi phạm pháp luật Việt Nam, xúc phạm, kỳ thị, quấy rối, khiêu dâm hoặc kích động bạo lực.", en: "Not post content that breaks Vietnamese law, or that is abusive, discriminatory, harassing, sexually explicit or incites violence." },
            { vi: "Không quảng cáo, spam, đăng liên kết lừa đảo hoặc mạo danh người khác.", en: "Not advertise, spam, post scam links or impersonate others." },
            { vi: "Không công khai thông tin cá nhân của người khác (số điện thoại, địa chỉ, ảnh chân dung) khi chưa có sự đồng ý của họ.", en: "Not publish other people's personal information (phone numbers, addresses, portraits) without their consent." },
            { vi: "Chỉ đăng ảnh bạn có quyền sử dụng và ghi rõ tác giả nếu dùng ảnh của người khác.", en: "Only post photos you have the right to use, and credit the author when sharing someone else's." },
          ],
        },
        {
          kind: "p",
          text: {
            vi: "Bạn giữ quyền tác giả đối với nội dung của mình và cấp cho Sao Việt quyền không độc quyền, miễn phí để hiển thị nội dung đó trên website. Quản trị viên có thể ẩn, gỡ bỏ nội dung vi phạm hoặc tạm khoá tài khoản tái phạm mà không cần báo trước; nếu cho rằng nội dung của bạn bị gỡ nhầm, hãy phản hồi {contact}.",
            en: "You keep copyright in your content and grant Sao Việt a non-exclusive, royalty-free right to display it on the website. Moderators may hide or remove infringing content, or suspend repeat offenders, without prior notice; if you believe your content was removed in error, let us know {contact}.",
          },
        },
      ],
    },
    {
      id: "law",
      title: { vi: "Luật áp dụng và giải quyết tranh chấp", en: "Governing law and disputes" },
      blocks: [
        {
          kind: "p",
          text: {
            vi: "Điều khoản này được điều chỉnh bởi pháp luật nước Cộng hòa Xã hội Chủ nghĩa Việt Nam, bao gồm các quy định về bảo vệ quyền lợi người tiêu dùng. Mọi tranh chấp trước hết được giải quyết bằng thương lượng thiện chí trong vòng 30 ngày; nếu không đạt được thoả thuận, một trong hai bên có thể đưa tranh chấp ra Toà án có thẩm quyền tại Việt Nam.",
            en: "These terms are governed by the laws of the Socialist Republic of Vietnam, including consumer protection regulations. Any dispute shall first be settled by good-faith negotiation within 30 days; failing agreement, either party may bring the dispute before a competent court in Vietnam.",
          },
        },
        {
          kind: "p",
          text: {
            vi: "Chúng tôi có thể cập nhật điều khoản và sẽ ghi rõ ngày hiệu lực mới. Đơn đặt tour đã xác nhận tiếp tục áp dụng điều khoản tại thời điểm xác nhận. Câu hỏi về điều khoản, vui lòng gửi {contact}.",
            en: "We may update these terms and will show the new effective date. Confirmed bookings remain under the terms in force when they were confirmed. For questions about these terms, please write to us {contact}.",
          },
        },
      ],
    },
  ],
};

export const contactFaq: Faq[] = [
  {
    q: { vi: "Tôi chưa từng ngắm sao, có tham gia được không?", en: "I've never been stargazing. Can I join?" },
    a: {
      vi: "Hoàn toàn được. Hướng dẫn viên bắt đầu từ cách nhận biết chòm sao bằng mắt thường, sau đó mới tới kính thiên văn. Toàn bộ thiết bị quan sát đều được chuẩn bị sẵn; bạn chỉ cần mang đồ ấm.",
      en: "Absolutely. Guides start with finding constellations by eye before moving on to telescopes. All observing gear is provided; you only need warm clothes.",
    },
  },
  {
    q: { vi: "Thời điểm nào trong năm ngắm Ngân Hà đẹp nhất?", en: "When is the best time of year to see the Milky Way?" },
    a: {
      vi: "Ở miền Bắc, lõi Ngân Hà rõ nhất từ tháng 4 đến tháng 9, đẹp nhất vào những đêm gần trăng non và sau các đợt gió mùa làm sạch không khí. Mùa khô miền Nam và Tây Nguyên (tháng 12–4) cho bầu trời trong ổn định hơn.",
      en: "In the north the Milky Way core is best from April to September, ideally near new moon and after monsoon winds clear the air. The dry season in the south and Central Highlands (December–April) offers steadier clear skies.",
    },
  },
  {
    q: { vi: "Nếu trời nhiều mây vào đúng ngày đi thì sao?", en: "What if it's cloudy on the day?" },
    a: {
      vi: "48 giờ trước khởi hành, nếu dự báo mây từ 70% trở lên cho mọi đêm của tour, chúng tôi đề xuất dời lịch miễn phí một lần hoặc hoàn 100%. Chi tiết tại Điều khoản đặt tour & hoàn huỷ.",
      en: "48 hours before departure, if cloud cover of 70% or more is forecast for every night of the tour, we offer one free reschedule or a 100% refund. See the Booking & Cancellation Terms for details.",
    },
  },
  {
    q: { vi: "Tôi có thể mang máy ảnh để chụp thiên văn không?", en: "Can I bring a camera for astrophotography?" },
    a: {
      vi: "Nên mang. Máy ảnh có chế độ chỉnh tay, ống kính góc rộng khẩu lớn và chân máy chắc chắn là đủ để chụp Ngân Hà. Một số tour có giá đỡ xích đạo để bám sao khi phơi sáng lâu.",
      en: "Please do. A camera with manual mode, a fast wide-angle lens and a sturdy tripod are enough for the Milky Way. Some tours provide a tracking mount for long exposures.",
    },
  },
  {
    q: { vi: "Trẻ em có tham gia được không?", en: "Can children come along?" },
    a: {
      vi: "Trẻ từ 8 tuổi có thể tham gia các tour độ khó “dễ” khi đi cùng cha mẹ hoặc người giám hộ. Tour vùng núi cao độ khó “khó” chỉ nhận khách từ 16 tuổi.",
      en: "Children aged 8 and over can join “easy” tours with a parent or guardian. “Hard” high-mountain tours accept guests aged 16 and over.",
    },
  },
];

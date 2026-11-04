import type { Service } from "./types";

export const services: Service[] = [
  {
    slug: "astrophotography-workshop",
    icon: "camera",
    title: { vi: "Lớp chụp ảnh thiên văn", en: "Astrophotography Workshop" },
    body: {
      vi: "Một đêm thực hành tại điểm trời tối, từ cân chỉnh giá đỡ bám sao đến ghép và xử lý ảnh. Nhóm nhỏ, mỗi người có thời gian riêng với hướng dẫn viên.",
      en: "A hands-on night at a dark site, from aligning a tracking mount to stacking and processing. Small groups, with one-to-one time for every participant.",
    },
    fromVnd: 2500000,
  },
  {
    slug: "telescope-rental",
    icon: "telescope",
    title: { vi: "Thuê kính thiên văn", en: "Telescope Rental" },
    body: {
      vi: "Kính Dobson, kính khúc xạ và ống nhòm thiên văn đã được cân chỉnh, kèm hướng dẫn sử dụng ngắn. Phù hợp để dùng thử trước khi quyết định mua.",
      en: "Collimated Dobsonians, refractors and astronomy binoculars with a short briefing on use. A good way to try before you buy.",
    },
    fromVnd: 350000,
  },
  {
    slug: "private-sky-guide",
    icon: "moon",
    title: { vi: "Hướng dẫn viên thiên văn riêng", en: "Private Sky Guide" },
    body: {
      vi: "Một hướng dẫn viên đi cùng nhóm của bạn, chọn đêm theo pha trăng và dự báo mây, mang theo kính và bản đồ sao. Lịch trình linh hoạt theo yêu cầu.",
      en: "A guide who travels with your group, picks the night by lunar phase and cloud forecast, and brings the telescope and charts. The schedule follows your plans.",
    },
    fromVnd: 3000000,
  },
  {
    slug: "corporate-star-night",
    icon: "users",
    title: { vi: "Đêm sao cho doanh nghiệp", en: "Corporate Star Night" },
    body: {
      vi: "Chương trình quan sát cho đoàn từ hai mươi đến một trăm người, gồm nhiều kính, phần giới thiệu bầu trời và hậu cần trọn gói. Có phương án trình chiếu trong nhà khi trời mây.",
      en: "An observing evening for groups of twenty to a hundred, with several telescopes, a guided sky tour and full logistics. An indoor presentation is ready in case of cloud.",
    },
    fromVnd: 25000000,
  },
  {
    slug: "school-astronomy-camp",
    icon: "graduation",
    title: { vi: "Trại thiên văn cho trường học", en: "School Astronomy Camp" },
    body: {
      vi: "Hai ngày một đêm dành cho học sinh, kết hợp hoạt động ban ngày về Mặt Trời và hệ Mặt Trời với buổi quan sát buổi tối. Nội dung bám theo chương trình khoa học phổ thông.",
      en: "Two days and a night for students, pairing daytime activities on the Sun and Solar System with an evening observing session. Content follows the national science curriculum.",
    },
    fromVnd: 1200000,
  },
  {
    slug: "dark-sky-glamping",
    icon: "tent",
    title: { vi: "Lều nghỉ dưới trời tối", en: "Dark-Sky Glamping" },
    body: {
      vi: "Lều có giường, chăn ấm và mái mở nhìn lên trời, đặt tại những điểm được chọn vì ít ánh sáng nhân tạo. Đèn trong khu trại đều là đèn ấm, chiếu xuống.",
      en: "Furnished tents with warm bedding and a sky-facing roof panel, pitched at sites chosen for minimal artificial light. All camp lighting is warm and downward-facing.",
    },
    fromVnd: 1600000,
  },
];

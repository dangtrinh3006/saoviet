import { placePhotos, tourPhotoFallback } from "./media";
import type { ImageRef, L10n, Tour } from "./types";

function cover(slug: string, alt: L10n): ImageRef {
  return { src: `/img/tours/${slug}.jpg`, alt, credit: "TBD", license: "TBD", sourceUrl: "" };
}

export const tours: Tour[] = [
  {
    slug: "ta-xua-cloud-sea-milky-way",
    code: "SV-01",
    title: { vi: "Tà Xùa: biển mây và Ngân Hà", en: "Ta Xua: Cloud Sea and Milky Way" },
    tagline: {
      vi: "Hai đêm trên sống lưng núi, nơi mây nằm dưới chân và sao ở trên đầu.",
      en: "Two nights on a mountain ridge, with cloud below and stars overhead.",
    },
    locationSlug: "ta-xua",
    nights: 2,
    difficulty: "moderate",
    priceVnd: 3900000,
    maxGuests: 10,
    highlights: [
      { vi: "Quan sát Ngân Hà từ độ cao gần hai nghìn mét", en: "Milky Way viewing from close to two thousand metres" },
      { vi: "Đón biển mây lúc bình minh tại sống lưng Khủng Long", en: "Dawn over the cloud sea at Dinosaur Ridge" },
      { vi: "Kính thiên văn 8 inch và hướng dẫn viên thiên văn đi cùng", en: "An 8-inch telescope and an astronomy guide throughout" },
      { vi: "Hướng dẫn chụp ảnh thiên văn bằng điện thoại", en: "Smartphone astrophotography coaching" },
    ],
    itinerary: [
      {
        title: { vi: "Ngày 1 — Hà Nội lên Tà Xùa", en: "Day 1 — Hanoi to Ta Xua" },
        body: {
          vi: "Khởi hành buổi sáng, đến homestay vào cuối chiều. Sau bữa tối, buổi nhập môn: tìm phương bắc, nhận diện chòm sao đầu mùa.",
          en: "Morning departure, arriving at the homestay by late afternoon. After dinner, an introduction: finding north and the season's first constellations.",
        },
      },
      {
        title: { vi: "Ngày 2 — Sống lưng Khủng Long", en: "Day 2 — Dinosaur Ridge" },
        body: {
          vi: "Đi bộ nhẹ lên sống núi vào buổi chiều. Đêm quan sát chính với kính thiên văn, chờ tâm Ngân Hà lên khỏi rặng núi phía nam.",
          en: "An easy afternoon walk onto the ridge. The main observing night with the telescope, waiting for the galactic core to clear the southern range.",
        },
      },
      {
        title: { vi: "Ngày 3 — Bình minh và trở về", en: "Day 3 — Dawn and return" },
        body: {
          vi: "Dậy trước bình minh để đón biển mây. Ăn sáng, trở về Hà Nội vào buổi tối.",
          en: "Up before sunrise for the cloud sea. Breakfast, then back in Hanoi by evening.",
        },
      },
    ],
    includes: [
      { vi: "Xe khứ hồi từ Hà Nội", en: "Return transport from Hanoi" },
      { vi: "Hai đêm homestay, phòng đôi", en: "Two nights in a homestay, twin rooms" },
      { vi: "Toàn bộ bữa ăn theo chương trình", en: "All meals on the programme" },
      { vi: "Kính thiên văn, đèn đỏ và bản đồ sao in", en: "Telescope, red lights and a printed star chart" },
      { vi: "Bảo hiểm du lịch", en: "Travel insurance" },
    ],
    image: cover("ta-xua-cloud-sea-milky-way", {
      vi: "Dải Ngân Hà phía trên biển mây ở Tà Xùa",
      en: "The Milky Way above the cloud sea at Ta Xua",
    }),
    featured: true,
  },
  {
    slug: "ha-giang-high-plateau",
    code: "SV-02",
    title: { vi: "Cao nguyên đá Hà Giang dưới bầu trời sao", en: "Ha Giang Stone Plateau by Starlight" },
    tagline: {
      vi: "Ba đêm dọc những con đèo tối nhất miền Bắc.",
      en: "Three nights along the darkest passes in the north.",
    },
    locationSlug: "dong-van",
    nights: 3,
    difficulty: "hard",
    priceVnd: 6800000,
    maxGuests: 8,
    highlights: [
      { vi: "Đêm quan sát trên đèo Mã Pì Lèng", en: "An observing night on Ma Pi Leng pass" },
      { vi: "Ba điểm trời tối khác nhau trong một hành trình", en: "Three different dark sites in one journey" },
      { vi: "Chụp chân trời sao với núi đá vôi làm tiền cảnh", en: "Starscapes with limestone peaks as foreground" },
      { vi: "Lưu trú tại nhà trình tường của người Mông", en: "Stays in Hmong rammed-earth houses" },
    ],
    itinerary: [
      {
        title: { vi: "Ngày 1 — Hà Giang đến Quản Bạ", en: "Day 1 — Ha Giang to Quan Ba" },
        body: {
          vi: "Vượt dốc Bắc Sum lên cao nguyên. Buổi tối làm quen thiết bị và cân chỉnh kính.",
          en: "Climb Bac Sum slope onto the plateau. Evening session on the equipment and telescope alignment.",
        },
      },
      {
        title: { vi: "Ngày 2 — Đồng Văn", en: "Day 2 — Dong Van" },
        body: {
          vi: "Qua Yên Minh và Sủng Là. Đêm đầu tiên ở vùng trời tối, tập trung vào các cụm sao và tinh vân.",
          en: "Through Yen Minh and Sung La. The first night under a properly dark sky, focused on star clusters and nebulae.",
        },
      },
      {
        title: { vi: "Ngày 3 — Mã Pì Lèng", en: "Day 3 — Ma Pi Leng" },
        body: {
          vi: "Chiều xuống sông Nho Quế. Đêm quan sát chính trên đèo, chụp Ngân Hà khi tâm thiên hà lên cao nhất.",
          en: "Afternoon down to the Nho Que river. The main night on the pass, photographing the Milky Way as the core reaches its highest.",
        },
      },
      {
        title: { vi: "Ngày 4 — Trở về", en: "Day 4 — Return" },
        body: {
          vi: "Ngủ bù buổi sáng, rời cao nguyên sau bữa trưa.",
          en: "A late morning to rest, leaving the plateau after lunch.",
        },
      },
    ],
    includes: [
      { vi: "Xe địa hình và tài xế quen đường đèo", en: "Off-road vehicle and a driver who knows the passes" },
      { vi: "Ba đêm lưu trú tại homestay", en: "Three nights in homestays" },
      { vi: "Bữa ăn và nước uống nóng trong đêm quan sát", en: "Meals and hot drinks during observing nights" },
      { vi: "Kính thiên văn, giá đỡ xích đạo cho máy ảnh", en: "Telescope and a tracking mount for cameras" },
      { vi: "Giấy phép vào khu vực biên giới", en: "Border-area permits" },
    ],
    image: cover("ha-giang-high-plateau", {
      vi: "Bầu trời sao phía trên đèo Mã Pì Lèng",
      en: "Starry sky over Ma Pi Leng pass",
    }),
    featured: true,
  },
  {
    slug: "ninh-thuan-desert-perseids",
    code: "SV-03",
    title: { vi: "Đồi cát Ninh Thuận và mưa sao băng Anh Tiên", en: "Ninh Thuan Dunes and the Perseids" },
    tagline: {
      vi: "Hai đêm giữa tháng tám trên miền đất khô nhất cả nước.",
      en: "Two nights in mid-August in the driest corner of the country.",
    },
    locationSlug: "mui-dinh",
    nights: 2,
    difficulty: "easy",
    priceVnd: 4600000,
    maxGuests: 14,
    highlights: [
      { vi: "Đêm cực điểm mưa sao băng Anh Tiên, khoảng 12–13 tháng 8", en: "Perseid peak night, around 12–13 August" },
      { vi: "Ghế ngả và chăn trên đồi cát, không cần thiết bị", en: "Reclining chairs and blankets on the dunes, no gear needed" },
      { vi: "Chân trời phía nam thông thoáng bên hải đăng Mũi Dinh", en: "An open southern horizon beside Mui Dinh lighthouse" },
      { vi: "Phần giới thiệu nguồn gốc sao băng từ sao chổi Swift–Tuttle", en: "A talk on meteors and comet Swift–Tuttle" },
    ],
    itinerary: [
      {
        title: { vi: "Ngày 1 — Phan Rang đến Mũi Dinh", en: "Day 1 — Phan Rang to Mui Dinh" },
        body: {
          vi: "Đón tại Phan Rang, nhận lều trên đồi cát. Chạng vạng đi dạo đến hải đăng, buổi tối nhận diện chòm Anh Tiên.",
          en: "Pick-up in Phan Rang and check-in to tents on the dunes. A dusk walk to the lighthouse, then locating Perseus in the evening.",
        },
      },
      {
        title: { vi: "Ngày 2 — Đêm cực điểm", en: "Day 2 — Peak night" },
        body: {
          vi: "Nghỉ ngơi ban ngày. Từ nửa đêm đến rạng sáng, khi điểm phát xạ lên cao, đếm sao băng cùng hướng dẫn viên.",
          en: "Rest during the day. From midnight to dawn, as the radiant climbs, count meteors with the guide.",
        },
      },
      {
        title: { vi: "Ngày 3 — Trở về", en: "Day 3 — Return" },
        body: {
          vi: "Ăn sáng muộn, trả khách tại Phan Rang hoặc sân bay Cam Ranh.",
          en: "Late breakfast, drop-off in Phan Rang or at Cam Ranh airport.",
        },
      },
    ],
    includes: [
      { vi: "Đưa đón từ Phan Rang hoặc sân bay Cam Ranh", en: "Transfers from Phan Rang or Cam Ranh airport" },
      { vi: "Hai đêm lều cắm trại có nệm", en: "Two nights in furnished camping tents" },
      { vi: "Bữa tối hải sản và bữa sáng", en: "Seafood dinners and breakfasts" },
      { vi: "Ghế ngả, chăn và đèn đỏ", en: "Reclining chairs, blankets and red lights" },
      { vi: "Bảo hiểm du lịch", en: "Travel insurance" },
    ],
    image: cover("ninh-thuan-desert-perseids", {
      vi: "Vệt sao băng trên đồi cát Mũi Dinh",
      en: "A meteor streak over the Mui Dinh dunes",
    }),
    featured: true,
  },
  {
    slug: "con-dao-island-night-sky",
    code: "SV-04",
    title: { vi: "Côn Đảo: bầu trời phương nam", en: "Con Dao: The Southern Sky" },
    tagline: {
      vi: "Ba đêm ở vĩ độ thấp, nơi Thập Tự Phương Nam hiện lên trên mặt biển.",
      en: "Three nights at low latitude, where the Southern Cross rises over the sea.",
    },
    locationSlug: "con-dao",
    nights: 3,
    difficulty: "easy",
    priceVnd: 9500000,
    maxGuests: 8,
    highlights: [
      { vi: "Thập Tự Phương Nam và Alpha Centauri trên chân trời", en: "The Southern Cross and Alpha Centauri on the horizon" },
      { vi: "Quan sát từ bãi biển vắng trong vườn quốc gia", en: "Observing from quiet national-park beaches" },
      { vi: "Đi thuyền ra đảo nhỏ, ở lại đến khi trăng chưa mọc", en: "A boat trip to an islet, staying until moonrise" },
      { vi: "Khách sạn ven biển, nhóm nhỏ tối đa tám người", en: "Seaside hotel, small group of up to eight" },
    ],
    itinerary: [
      {
        title: { vi: "Ngày 1 — Đến Côn Đảo", en: "Day 1 — Arrival" },
        body: {
          vi: "Bay đến Côn Đảo, nhận phòng. Buổi tối tại bãi Đầm Trầu, giới thiệu bầu trời phương nam.",
          en: "Fly in and check in. Evening at Dam Trau beach with an introduction to the southern sky.",
        },
      },
      {
        title: { vi: "Ngày 2 — Rừng và biển", en: "Day 2 — Forest and sea" },
        body: {
          vi: "Ban ngày đi bộ rừng hoặc lặn ống thở. Đêm quan sát bằng kính thiên văn: tinh vân Carina, cụm Omega Centauri.",
          en: "Forest walk or snorkelling by day. Telescope night: the Carina Nebula and the Omega Centauri cluster.",
        },
      },
      {
        title: { vi: "Ngày 3 — Đảo nhỏ", en: "Day 3 — The islet" },
        body: {
          vi: "Thuyền ra đảo nhỏ vào chiều muộn, quan sát và chụp ảnh với chân trời biển trọn vẹn.",
          en: "Boat out to an islet in the late afternoon for observing and photography with a full sea horizon.",
        },
      },
      {
        title: { vi: "Ngày 4 — Trở về", en: "Day 4 — Departure" },
        body: {
          vi: "Buổi sáng tự do, ra sân bay theo giờ bay.",
          en: "Free morning, airport transfer to suit your flight.",
        },
      },
    ],
    includes: [
      { vi: "Ba đêm khách sạn ven biển", en: "Three nights in a seaside hotel" },
      { vi: "Đưa đón sân bay và xe trong chương trình", en: "Airport transfers and ground transport" },
      { vi: "Thuyền riêng ra đảo nhỏ", en: "Private boat to the islet" },
      { vi: "Kính thiên văn và giá đỡ máy ảnh", en: "Telescope and camera mounts" },
      { vi: "Vé tham quan vườn quốc gia", en: "National park entry fees" },
    ],
    image: cover("con-dao-island-night-sky", {
      vi: "Bầu trời sao trên bãi biển Côn Đảo",
      en: "Stars over a Con Dao beach",
    }),
  },
  {
    slug: "bidoup-forest-astrophotography",
    code: "SV-05",
    title: { vi: "Bidoup: chụp ảnh thiên văn trong rừng thông", en: "Bidoup: Forest Astrophotography" },
    tagline: {
      vi: "Hai đêm thực hành dưới một trong những bầu trời tối nhất phía nam.",
      en: "Two hands-on nights under one of the darkest skies in the south.",
    },
    locationSlug: "bidoup-nui-ba",
    nights: 2,
    difficulty: "moderate",
    priceVnd: 5400000,
    maxGuests: 6,
    highlights: [
      { vi: "Nhóm tối đa sáu người, mỗi người một giá đỡ bám sao", en: "Up to six guests, one tracking mount each" },
      { vi: "Quy trình chụp, ghép và xử lý ảnh từ đầu đến cuối", en: "The full workflow: capture, stacking and processing" },
      { vi: "Tiền cảnh rừng thông cổ thụ", en: "Old-growth pine forest as foreground" },
      { vi: "Buổi xem lại ảnh và nhận xét chi tiết", en: "A review session with detailed feedback" },
    ],
    itinerary: [
      {
        title: { vi: "Ngày 1 — Đà Lạt đến Bidoup", en: "Day 1 — Da Lat to Bidoup" },
        body: {
          vi: "Buổi chiều học về phơi sáng, ISO, khẩu độ và cân chỉnh giá đỡ. Đêm đầu chụp chân trời sao.",
          en: "An afternoon on exposure, ISO, aperture and mount alignment. First night: wide-field starscapes.",
        },
      },
      {
        title: { vi: "Ngày 2 — Chụp sâu", en: "Day 2 — Deep sky" },
        body: {
          vi: "Chiều xử lý ảnh đêm trước. Đêm thứ hai chụp nhiều khung để ghép, nhắm vào vùng tâm Ngân Hà hoặc tinh vân Lạp Hộ tùy mùa.",
          en: "Afternoon processing of the first night. Second night shooting stacks of frames on the galactic core or the Orion Nebula, depending on season.",
        },
      },
      {
        title: { vi: "Ngày 3 — Xem lại và trở về", en: "Day 3 — Review and return" },
        body: {
          vi: "Buổi sáng ghép và chỉnh ảnh cuối, nhận xét từng người. Trả khách tại Đà Lạt sau bữa trưa.",
          en: "Morning stacking and final edits with individual feedback. Drop-off in Da Lat after lunch.",
        },
      },
    ],
    includes: [
      { vi: "Đưa đón từ Đà Lạt", en: "Transfers from Da Lat" },
      { vi: "Hai đêm nhà nghỉ trong vùng đệm vườn quốc gia", en: "Two nights in a lodge in the park buffer zone" },
      { vi: "Giá đỡ bám sao và chân máy cho mỗi khách", en: "Tracking mount and tripod for each guest" },
      { vi: "Phần mềm xử lý ảnh trên máy tính của nhóm", en: "Processing software on the group's laptops" },
      { vi: "Bữa ăn và phí vào vườn quốc gia", en: "Meals and park entry fees" },
    ],
    image: cover("bidoup-forest-astrophotography", {
      vi: "Ngân Hà phía trên rừng thông Bidoup",
      en: "The Milky Way above the Bidoup pine forest",
    }),
  },
  {
    slug: "moc-chau-family-stargazing",
    code: "SV-06",
    title: { vi: "Mộc Châu: một đêm ngắm sao cho cả nhà", en: "Moc Chau: A Family Night of Stars" },
    tagline: {
      vi: "Một đêm nhẹ nhàng trên cao nguyên, vừa sức trẻ nhỏ.",
      en: "A gentle night on the plateau, paced for children.",
    },
    locationSlug: "moc-chau-pha-luong",
    nights: 1,
    difficulty: "easy",
    priceVnd: 1800000,
    maxGuests: 16,
    highlights: [
      { vi: "Nhìn vành đai Sao Thổ hoặc miệng hố Mặt Trăng qua kính", en: "Saturn's rings or lunar craters through the telescope" },
      { vi: "Trò chơi tìm chòm sao cho trẻ từ sáu tuổi", en: "Constellation games for children aged six and up" },
      { vi: "Đồ ăn nhẹ và đồ uống nóng bên bếp lửa", en: "Snacks and hot drinks by the campfire" },
      { vi: "Lưu trú gần thị trấn, không cần đi bộ xa", en: "Lodging close to town, no long walks" },
    ],
    itinerary: [
      {
        title: { vi: "Chiều — Nhận phòng", en: "Afternoon — Check-in" },
        body: {
          vi: "Nhận phòng tại khu nghỉ trên đồi, làm bản đồ sao cầm tay cùng các bạn nhỏ.",
          en: "Check in at the hillside lodge and make a handheld star wheel with the children.",
        },
      },
      {
        title: { vi: "Tối — Ngắm sao", en: "Evening — Stargazing" },
        body: {
          vi: "Sau bữa tối, quan sát hành tinh và chòm sao trong khoảng hai giờ. Trẻ nhỏ có thể nghỉ trước, người lớn ở lại muộn hơn.",
          en: "After dinner, about two hours with planets and constellations. Young children can turn in early while adults stay on.",
        },
      },
      {
        title: { vi: "Sáng — Trở về", en: "Morning — Return" },
        body: {
          vi: "Ăn sáng, ghé đồi chè trước khi rời Mộc Châu.",
          en: "Breakfast and a stop at the tea hills before leaving Moc Chau.",
        },
      },
    ],
    includes: [
      { vi: "Một đêm phòng gia đình", en: "One night in a family room" },
      { vi: "Bữa tối và bữa sáng", en: "Dinner and breakfast" },
      { vi: "Hai kính thiên văn và ống nhòm cho trẻ em", en: "Two telescopes and children's binoculars" },
      { vi: "Bộ làm bản đồ sao mang về", en: "A take-home star wheel kit" },
      { vi: "Hướng dẫn viên thiên văn", en: "An astronomy guide" },
    ],
    image: cover("moc-chau-family-stargazing", {
      vi: "Gia đình ngắm sao qua kính thiên văn ở Mộc Châu",
      en: "A family at the telescope in Moc Chau",
    }),
  },
  {
    slug: "phong-nha-cave-and-sky",
    code: "SV-07",
    title: { vi: "Phong Nha: hang động và bầu trời", en: "Phong Nha: Cave and Sky" },
    tagline: {
      vi: "Ngày đi trong lòng đất, đêm nằm dưới vòm sao.",
      en: "Days beneath the earth, nights beneath the stars.",
    },
    locationSlug: "phong-nha-ke-bang",
    nights: 2,
    difficulty: "moderate",
    priceVnd: 4900000,
    maxGuests: 10,
    highlights: [
      { vi: "Khám phá hang Tối và hang Thiên Đường", en: "Exploring Dark Cave and Paradise Cave" },
      { vi: "Đêm cắm trại bên suối trong vùng lõi rừng", en: "A riverside camp inside the forest core" },
      { vi: "Mùa khô trùng mùa Ngân Hà", en: "Dry season aligned with Milky Way season" },
      { vi: "So sánh bóng tối trong hang và bóng tối của bầu trời", en: "Two kinds of darkness: the cave and the sky" },
    ],
    itinerary: [
      {
        title: { vi: "Ngày 1 — Đồng Hới đến Phong Nha", en: "Day 1 — Dong Hoi to Phong Nha" },
        body: {
          vi: "Đón tại Đồng Hới, chiều vào hang Thiên Đường. Tối làm quen bầu trời từ khu lưu trú.",
          en: "Pick-up in Dong Hoi and an afternoon in Paradise Cave. Evening sky orientation from the lodge.",
        },
      },
      {
        title: { vi: "Ngày 2 — Hang Tối và trại rừng", en: "Day 2 — Dark Cave and forest camp" },
        body: {
          vi: "Sáng chèo thuyền và lội bùn trong hang Tối. Chiều vào trại bên suối, đêm quan sát chính.",
          en: "Morning kayaking and mud in Dark Cave. Afternoon into the riverside camp for the main observing night.",
        },
      },
      {
        title: { vi: "Ngày 3 — Trở về", en: "Day 3 — Return" },
        body: {
          vi: "Ra khỏi rừng sau bữa sáng, trả khách tại Đồng Hới.",
          en: "Out of the forest after breakfast, drop-off in Dong Hoi.",
        },
      },
    ],
    includes: [
      { vi: "Đưa đón từ Đồng Hới", en: "Transfers from Dong Hoi" },
      { vi: "Một đêm nhà nghỉ và một đêm trại rừng", en: "One night in a lodge and one at a forest camp" },
      { vi: "Vé hang và thiết bị an toàn", en: "Cave entry and safety equipment" },
      { vi: "Bữa ăn theo chương trình", en: "Meals on the programme" },
      { vi: "Kính thiên văn và hướng dẫn viên thiên văn", en: "Telescope and astronomy guide" },
    ],
    image: cover("phong-nha-cave-and-sky", {
      vi: "Bầu trời sao trên rừng karst Phong Nha",
      en: "Stars over the Phong Nha karst forest",
    }),
  },
];

export function tourBySlug(slug: string): Tour | undefined {
  return tours.find((t) => t.slug === slug);
}

// Tours reuse their site's licensed photo until bespoke shoots exist.
for (const t of tours) {
  const photo = placePhotos[t.locationSlug] ?? tourPhotoFallback[t.locationSlug];
  if (photo && t.image.license === "TBD") t.image = photo;
}

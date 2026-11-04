import { postCovers } from "./media";
import type { ImageRef, L10n, Post } from "./types";

function cover(slug: string, alt: L10n): ImageRef {
  return { src: `/img/blog/${slug}.jpg`, alt, credit: "TBD", license: "TBD", sourceUrl: "" };
}

export const posts: Post[] = [
  {
    slug: "bortle-scale-explained",
    category: "guide",
    date: "2026-09-12",
    readingMinutes: 4,
    title: { vi: "Thang Bortle là gì", en: "The Bortle Scale Explained" },
    excerpt: {
      vi: "Chín bậc để mô tả một bầu trời tối đến đâu, và vì sao con số trên bản đồ của chúng tôi chỉ là ước tính.",
      en: "Nine classes that describe how dark a sky is, and why the numbers on our map are estimates.",
    },
    cover: cover("bortle-scale-explained", {
      vi: "Hai nửa bầu trời: một nửa sáng ánh đèn, một nửa đầy sao",
      en: "A sky split between city glow and a field of stars",
    }),
    body: {
      vi: `Thang Bortle do nhà thiên văn nghiệp dư người Mỹ John E. Bortle đề xuất trên tạp chí Sky & Telescope năm 2001. Thang chia bầu trời đêm thành chín bậc, từ bậc 1 là bầu trời tối tuyệt đối đến bậc 9 là trung tâm một thành phố lớn. Điểm hay của nó là không cần thiết bị: mỗi bậc được mô tả bằng những gì mắt thường thấy được.

## Đọc từng bậc

Ở bậc 1 và 2, Ngân Hà đủ sáng để đổ bóng mờ trên mặt đất, ánh sáng hoàng đạo hiện rõ sau hoàng hôn, và mây chỉ hiện ra như những mảng đen che sao. Bậc 3 là vùng nông thôn: Ngân Hà vẫn có cấu trúc rõ, nhưng chân trời đã có vài vòm sáng mờ. Bậc 4 là vùng chuyển tiếp giữa nông thôn và ngoại ô, Ngân Hà còn thấy được nhưng mất chi tiết gần chân trời. Từ bậc 5 trở lên, Ngân Hà nhạt dần rồi biến mất, và ở bậc 8–9 chỉ còn các sao sáng nhất cùng hành tinh.

## Con số SQM

Nếu thang Bortle là mô tả bằng mắt, thì SQM là con số đo. SQM đo độ sáng nền trời ở thiên đỉnh, tính bằng cấp sao trên giây cung vuông. Con số càng lớn thì trời càng tối. Bầu trời tự nhiên tối nhất trên Trái Đất vào khoảng 22,0; một vùng nông thôn tốt khoảng 21,5–21,8; ngoại ô thường quanh 19–20; trung tâm đô thị lớn có thể dưới 18. Vì thang cấp sao là thang logarit, chênh lệch 1 đơn vị tương ứng độ sáng nền trời gấp khoảng 2,5 lần.

## Vì sao bản đồ ghi là ước tính

Các giá trị Bortle và SQM trên bản đồ Sao Việt là ước tính, dựa trên dữ liệu vệ tinh về ánh sáng nhân tạo và hiểu biết thực địa, chưa phải số đo tại chỗ. Bầu trời thật còn phụ thuộc vào độ ẩm, bụi, độ cao của Mặt Trăng và cả hướng bạn nhìn. Một điểm ghi bậc 3 có thể cho cảm giác như bậc 2 vào một đêm khô gió, và tệ hơn bậc 4 khi sương mù phản chiếu ánh đèn thị trấn.

## Tự ước lượng tại chỗ

Cách đơn giản nhất là đếm sao trong một chòm quen thuộc, hoặc xem bạn có nhận ra cấu trúc của Ngân Hà quanh chòm Thiên Hạt hay không. Hãy để mắt thích nghi ít nhất hai mươi phút, tránh nhìn màn hình điện thoại không có chế độ đèn đỏ. Ghi lại cảm nhận của bạn sau mỗi chuyến: qua nhiều đêm, đó là thước đo đáng tin nhất về một bầu trời.`,
      en: `The Bortle scale was proposed by the American amateur astronomer John E. Bortle in Sky & Telescope in 2001. It divides the night sky into nine classes, from class 1, a truly dark site, to class 9, the centre of a large city. Its strength is that it needs no instrument: each class is described by what the naked eye can see.

## Reading the classes

At classes 1 and 2 the Milky Way is bright enough to cast a faint shadow, the zodiacal light is obvious after dusk, and clouds show only as black patches blotting out stars. Class 3 is rural sky: the Milky Way still shows clear structure, but a few faint light domes sit on the horizon. Class 4 marks the transition between countryside and suburb, where the Milky Way remains visible but loses detail near the horizon. From class 5 upwards it fades and then disappears, and at classes 8 and 9 only the brightest stars and planets remain.

## The SQM number

If the Bortle scale is a description, SQM is a measurement. It records the brightness of the sky background at the zenith in magnitudes per square arcsecond. Larger numbers mean darker skies. The darkest natural sky on Earth is around 22.0; a good rural site sits around 21.5 to 21.8; suburbs are often near 19 to 20; a large city centre can fall below 18. Because magnitudes are logarithmic, a difference of one unit corresponds to a sky background roughly 2.5 times brighter.

## Why our map says estimate

The Bortle and SQM values on the Sao Viet map are estimates, based on satellite data on artificial light and on field knowledge, not on readings taken at each site. The real sky also depends on humidity, dust, the Moon's altitude and the direction you face. A site marked class 3 can feel like class 2 on a dry, breezy night, and worse than class 4 when mist reflects the lights of a nearby town.

## Estimating it yourself

The simplest method is to count stars inside a familiar constellation, or to check whether you can trace the structure of the Milky Way around Sagittarius. Give your eyes at least twenty minutes to adapt and avoid any phone screen without a red-light mode. Note your impression after every trip: over many nights, that record becomes the most reliable measure of a sky you know.`,
    },
  },
  {
    slug: "when-to-see-the-milky-way-in-vietnam",
    category: "guide",
    date: "2026-09-26",
    readingMinutes: 5,
    title: { vi: "Khi nào ngắm Ngân Hà ở Việt Nam", en: "When to See the Milky Way in Vietnam" },
    excerpt: {
      vi: "Ba điều kiện phải trùng nhau: tâm Ngân Hà trên trời, Mặt Trăng dưới đường chân trời, và một đêm không mưa.",
      en: "Three conditions must line up: the galactic core in the sky, the Moon below the horizon, and a night without rain.",
    },
    cover: cover("when-to-see-the-milky-way-in-vietnam", {
      vi: "Tâm Ngân Hà mọc trên rặng núi phía nam",
      en: "The galactic core rising over a southern ridge",
    }),
    body: {
      vi: `Ngân Hà thật ra có mặt trên trời gần như mọi đêm trong năm. Điều người ta thường muốn thấy là vùng tâm thiên hà, nằm theo hướng chòm Nhân Mã và Thiên Hạt, nơi dải sáng dày và nhiều cấu trúc nhất. Muốn ngắm vùng này, cần ba điều kiện trùng nhau.

## Điều kiện thứ nhất: mùa tâm thiên hà

Tâm Ngân Hà có xích vĩ khoảng −29°, nên từ Việt Nam nó luôn nằm ở bầu trời phía nam. Ở Hà Giang (vĩ độ khoảng 23° Bắc), độ cao tối đa của nó chỉ chừng 38°; ở Côn Đảo (khoảng 9° Bắc) nó lên tới khoảng 52°. Càng đi về phía nam, tâm thiên hà càng cao và ít bị không khí dày gần chân trời làm mờ.

Theo lịch, tâm thiên hà bắt đầu xuất hiện trước bình minh từ khoảng tháng hai. Tháng tư và tháng năm nó mọc sau nửa đêm. Tháng sáu và tháng bảy là lúc nó hiện gần như suốt đêm. Tháng tám và tháng chín nó đã lên cao khi trời vừa tối, rồi lặn sớm dần, và đến khoảng cuối tháng mười thì gần như khuất trong ánh hoàng hôn.

## Điều kiện thứ hai: Mặt Trăng

Một vầng trăng gần tròn có thể làm nền trời sáng như một vùng ngoại ô. Hãy chọn khoảng một tuần quanh ngày trăng mới, hoặc những giờ trăng đã lặn hay chưa mọc. Ứng dụng bản đồ của chúng tôi hiển thị pha trăng cho từng đêm để bạn đối chiếu khi đặt chuyến.

## Điều kiện thứ ba: thời tiết

Đây là chỗ Việt Nam khó. Mùa tâm thiên hà rõ nhất, từ tháng năm đến tháng chín, cũng là mùa mưa ở phần lớn miền Bắc, Tây Nguyên và Nam Bộ. Vì vậy những tháng thực tế nhất thường là phần giao giữa hai mùa:

Miền Bắc: tháng ba đến tháng năm, trước khi mưa dày, và tháng chín, tháng mười khi trời bắt đầu hanh, dù khi đó tâm thiên hà chỉ còn vài giờ đầu buổi tối.

Tây Nguyên và Nam Bộ: tháng hai đến tháng tư, chấp nhận dậy lúc ba hoặc bốn giờ sáng.

Duyên hải Nam Trung Bộ, đặc biệt Ninh Thuận: lượng mưa thấp quanh năm, mùa mưa ngắn rơi vào khoảng tháng chín đến tháng mười một, nên tháng sáu đến tháng tám ở đây là một trong những khoảng tốt nhất cả nước.

Miền Trung từ Quảng Bình đến Phú Yên: mùa khô kéo từ khoảng tháng hai đến tháng tám, trùng khá đẹp với mùa Ngân Hà.

## Một lời nhắc

Các mốc trên là khung tham khảo, không phải lời hứa. Một đợt gió mùa, một tuần nồm hay khói đốt đồng có thể xóa sạch cả kế hoạch. Hãy giữ lịch linh hoạt vài ngày, xem dự báo mây sát ngày đi, và xem mỗi đêm quang là một món quà chứ không phải điều chắc chắn.`,
      en: `The Milky Way is in the sky on almost every night of the year. What people usually want to see is the galactic core, towards Sagittarius and Scorpius, where the band is densest and most structured. Seeing it well requires three conditions to line up.

## First: core season

The galactic centre lies at a declination of about −29°, so from Vietnam it always sits in the southern sky. From Ha Giang, at roughly 23° north, it peaks at only about 38° altitude; from Con Dao, near 9° north, it climbs to about 52°. The further south you go, the higher the core rides and the less it is dimmed by the thick air near the horizon.

By the calendar, the core begins to appear before dawn from around February. In April and May it rises after midnight. June and July are when it is up for most of the night. In August and September it is already high at dusk and sets progressively earlier, until by late October it is nearly lost in the evening twilight.

## Second: the Moon

A nearly full Moon can brighten the sky to suburban levels. Aim for the week around new moon, or the hours when the Moon has set or not yet risen. Our map shows the lunar phase for each night so you can check it when booking.

## Third: weather

This is the difficult part in Vietnam. The core is best placed from May to September, which is also the rainy season across most of the north, the Central Highlands and the south. The most practical months therefore tend to be where the two seasons overlap:

The north: March to May, before the heavy rains, and September to October as the air dries, although by then the core is visible only in the first hours of the evening.

The Central Highlands and the south: February to April, if you are willing to rise at three or four in the morning.

The south-central coast, especially Ninh Thuan: rainfall is low all year and the short wet season falls roughly between September and November, which makes June to August here one of the best windows in the country.

The central coast from Quang Binh to Phu Yen: the dry season runs roughly from February to August, a good match with Milky Way season.

## A caution

These dates are a frame of reference, not a promise. A monsoon surge, a humid week or smoke from field burning can wipe out a plan. Keep a few days of flexibility, check the cloud forecast close to departure, and treat each clear night as a gift rather than a certainty.`,
    },
  },
  {
    slug: "light-pollution-in-vietnam",
    category: "science",
    date: "2026-10-08",
    readingMinutes: 5,
    title: { vi: "Ô nhiễm ánh sáng ở Việt Nam", en: "Light Pollution in Vietnam" },
    excerpt: {
      vi: "Bầu trời đêm đang sáng lên nhanh hơn ta tưởng. Những gì dữ liệu cho thấy, và những gì còn chưa biết.",
      en: "Night skies are brightening faster than we assumed. What the data shows, and what remains unknown.",
    },
    cover: cover("light-pollution-in-vietnam", {
      vi: "Vòm sáng của một đô thị nhìn từ vùng núi",
      en: "A city's light dome seen from the mountains",
    }),
    body: {
      vi: `Ô nhiễm ánh sáng là ánh sáng nhân tạo chiếu sai chỗ, sai lúc hoặc quá mức cần thiết. Phần lớn nó không chiếu xuống mặt đường mà hắt lên trời, tán xạ trong khí quyển và tạo thành những vòm sáng có thể thấy từ cách xa hàng chục cây số.

## Dữ liệu toàn cầu nói gì

Tập bản đồ thế giới về độ sáng nhân tạo của bầu trời đêm, do Fabio Falchi và cộng sự công bố trên Science Advances năm 2016, ước tính hơn 80% dân số thế giới sống dưới bầu trời bị ô nhiễm ánh sáng. Một nghiên cứu khác của Christopher Kyba và cộng sự trên tạp chí Science năm 2023, dựa trên hàng chục nghìn quan sát của người dân trong chương trình Globe at Night, cho thấy độ sáng bầu trời mà mắt người cảm nhận đã tăng khoảng 9–10% mỗi năm trong giai đoạn 2011–2022. Tốc độ đó nhanh hơn nhiều so với những gì vệ tinh ghi nhận.

Khoảng chênh này có một phần nguyên nhân kỹ thuật: cảm biến VIIRS trên vệ tinh gần như không nhạy với ánh sáng xanh, trong khi đèn LED trắng phát nhiều ánh sáng xanh. Khi các thành phố chuyển sang LED, vệ tinh có thể thấy ít ánh sáng hơn trong khi bầu trời thực tế lại sáng hơn.

## Ở Việt Nam

Chúng tôi chưa tìm thấy một chương trình đo SQM có hệ thống trên toàn quốc. Vì vậy mọi nhận định dưới đây là ước tính, dựa trên ảnh vệ tinh ban đêm và quan sát thực địa.

Hai vùng đô thị lớn quanh Hà Nội và TP. Hồ Chí Minh tạo ra những vòm sáng rộng, khiến trung tâm thành phố ở mức Bortle 8–9 và vùng ngoại vi rộng tới vài chục cây số ở mức 5–7. Dọc dải đồng bằng ven biển, các thị xã, khu công nghiệp và đường cao tốc nối thành chuỗi gần như liên tục. Một nguồn đặc thù là đèn thuyền đánh cá ngoài khơi: vào mùa câu mực, đội tàu có thể sáng rõ trên ảnh vệ tinh như một thành phố trên biển.

Ngược lại, vùng núi phía Bắc, phần lớn Tây Nguyên, các vườn quốc gia và một số đảo vẫn giữ bầu trời ở mức Bortle 2–4. Đây là lý do bản đồ Sao Việt tập trung ở những nơi này.

## Vì sao điều này quan trọng

Ánh sáng nhân tạo ban đêm ảnh hưởng tới các loài di cư, côn trùng thụ phấn, rùa biển khi lên bãi đẻ trứng, và nhịp sinh học của chính con người. Với người yêu thiên văn, cái giá dễ thấy nhất là mất đi dải Ngân Hà, một phần di sản mà các thế hệ trước từng xem là hiển nhiên.

## Những gì có thể làm

Giải pháp không phải là tắt đèn, mà là chiếu sáng đúng: chụp đèn che hướng lên trời, chỉ chiếu khi cần, độ sáng vừa đủ, và ưu tiên ánh sáng ấm dưới 3000K. Ở các điểm du lịch, mỗi homestay chọn đèn hắt xuống thay vì đèn pha là đã giữ lại được một góc trời. Sao Việt làm việc với các chủ nhà nơi chúng tôi đưa khách đến để áp dụng những nguyên tắc này.`,
      en: `Light pollution is artificial light shining where it is not needed, when it is not needed, or more brightly than needed. Much of it never reaches the road; it spills upwards, scatters in the atmosphere and builds light domes visible from tens of kilometres away.

## What the global data says

The World Atlas of Artificial Night Sky Brightness, published by Fabio Falchi and colleagues in Science Advances in 2016, estimated that more than 80% of the world's population lives under light-polluted skies. A later study by Christopher Kyba and colleagues in Science in 2023, drawing on tens of thousands of citizen observations from the Globe at Night programme, found that sky brightness as perceived by the human eye rose by roughly 9 to 10% per year between 2011 and 2022. That is far faster than satellites had recorded.

Part of the gap is technical. The VIIRS sensor used for night imagery is largely blind to blue light, while white LEDs emit a great deal of it. As cities switch to LED, satellites can register less light even as the sky itself grows brighter.

## In Vietnam

We have not found a systematic nationwide programme of SQM measurements. Everything below is therefore an estimate, based on night-time satellite imagery and field observation.

The two large metropolitan areas around Hanoi and Ho Chi Minh City create wide light domes, putting their centres at Bortle 8 to 9 and a surrounding belt several tens of kilometres wide at 5 to 7. Along the coastal plains, towns, industrial parks and expressways form a nearly continuous chain. One distinctive source is offshore fishing: in squid season the fleets can show on satellite images as brightly as a city at sea.

By contrast, the northern mountains, much of the Central Highlands, the national parks and some islands still hold skies at Bortle 2 to 4. That is why the Sao Viet map concentrates on them.

## Why it matters

Artificial light at night affects migrating species, pollinating insects, sea turtles coming ashore to nest, and the circadian rhythm of people themselves. For anyone who loves the sky, the most visible cost is the loss of the Milky Way, a part of our heritage that earlier generations took for granted.

## What can be done

The answer is not darkness but better lighting: fixtures shielded from the sky, light only when it is needed, no brighter than necessary, and warm colour temperatures below 3000 K. At travel destinations, every homestay that chooses a downward-facing lamp over a floodlight keeps a piece of sky intact. Sao Viet works with the hosts we visit to apply these principles.`,
    },
  },
  {
    slug: "choosing-your-first-telescope",
    category: "gear",
    date: "2026-10-20",
    readingMinutes: 5,
    title: { vi: "Chọn kính thiên văn đầu tiên", en: "Choosing Your First Telescope" },
    excerpt: {
      vi: "Khẩu độ quan trọng hơn độ phóng đại, giá đỡ quan trọng hơn ống kính, và đôi khi câu trả lời là một chiếc ống nhòm.",
      en: "Aperture matters more than magnification, the mount more than the tube, and sometimes the answer is a pair of binoculars.",
    },
    cover: cover("choosing-your-first-telescope", {
      vi: "Kính thiên văn Dobson dưới bầu trời chạng vạng",
      en: "A Dobsonian telescope at dusk",
    }),
    body: {
      vi: `Chiếc kính thiên văn đầu tiên tốt nhất là chiếc bạn sẽ thật sự mang ra dùng. Câu nói nghe đơn giản, nhưng phần lớn kính mua về rồi nằm trong tủ là vì quá cồng kềnh, quá khó dựng, hoặc cho hình ảnh khiến người dùng thất vọng ngay đêm đầu.

## Bắt đầu bằng ống nhòm

Trước khi mua kính, hãy cân nhắc một chiếc ống nhòm 7×50 hoặc 10×50. Con số đầu là độ phóng đại, con số sau là đường kính vật kính tính bằng milimét. Ống nhòm cho thị trường rộng, dễ dùng, và đủ để thấy các miệng hố Mặt Trăng, bốn vệ tinh lớn của Sao Mộc, cụm sao Tua Rua và nhiều đám mây sao dọc Ngân Hà. Nó cũng giúp bạn học đường đi giữa các chòm sao, kỹ năng mà kính thiên văn nào cũng cần.

## Khẩu độ là thông số quan trọng nhất

Khẩu độ là đường kính của gương hoặc thấu kính chính. Khẩu độ càng lớn thì kính thu được càng nhiều ánh sáng và phân giải được càng nhiều chi tiết. Một kính 150 mm thu ánh sáng gấp khoảng hai lần kính 100 mm, vì diện tích tăng theo bình phương đường kính.

Hãy cảnh giác với những hộp kính quảng cáo độ phóng đại 500 hay 600 lần. Độ phóng đại hữu ích tối đa của một kính chỉ vào khoảng hai lần khẩu độ tính bằng milimét, nghĩa là một kính 70 mm chỉ dùng tốt đến khoảng 140 lần. Vượt quá con số đó, hình ảnh chỉ to ra và mờ đi.

## Giá đỡ quan trọng không kém ống kính

Một ống kính tốt đặt trên chân máy rung lắc là một trải nghiệm tồi. Ở độ phóng đại cao, chỉ một cú chạm nhẹ cũng khiến hình ảnh nhảy khỏi thị trường. Khi so sánh hai bộ kính cùng giá, hãy ưu tiên bộ có giá đỡ chắc chắn.

## Gợi ý cho người mới

Với đa số người mới, chúng tôi gợi ý một kính phản xạ kiểu Dobson khẩu độ 150–200 mm. Đây là kính phản xạ Newton đặt trên đế gỗ xoay đơn giản, không cần cân chỉnh phức tạp, và cho khẩu độ lớn nhất trên mỗi đồng chi ra. Nhược điểm là cồng kềnh, nên nếu bạn sống ở chung cư không có thang máy hoặc thường di chuyển bằng xe máy, một kính khúc xạ 80–100 mm trên giá đỡ alt-azimuth chắc chắn có thể hợp lý hơn.

Kính có hệ thống tự tìm sao tiện lợi, nhưng ở cùng mức giá thường đổi lấy khẩu độ nhỏ hơn. Nếu ngân sách có hạn, hãy dành tiền cho khẩu độ và học cách tự tìm đường trên bầu trời.

## Phụ kiện đáng mua trước

Một đèn đỏ để đọc bản đồ mà không làm mất khả năng thích nghi bóng tối của mắt. Một bản đồ sao in hoặc ứng dụng có chế độ đỏ. Một thị kính có độ phóng đại thấp, thị trường rộng. Còn lại, hãy đợi sau vài tháng sử dụng mới biết mình thật sự cần gì.

Nếu chưa chắc, bạn có thể thuê kính qua dịch vụ của Sao Việt và dùng thử trong một chuyến đi trước khi quyết định mua.`,
      en: `The best first telescope is the one you will actually take outside. It sounds simple, but most telescopes that end up in a cupboard got there because they were too bulky, too fiddly to set up, or showed something disappointing on the very first night.

## Start with binoculars

Before buying a telescope, consider a pair of 7×50 or 10×50 binoculars. The first number is the magnification, the second the objective diameter in millimetres. Binoculars give a wide field, are easy to use, and are enough to show lunar craters, the four large moons of Jupiter, the Pleiades and many star clouds along the Milky Way. They also teach you to move between constellations, a skill every telescope demands.

## Aperture is the number that matters

Aperture is the diameter of the main mirror or lens. The larger it is, the more light the telescope gathers and the finer the detail it can resolve. A 150 mm telescope collects roughly twice the light of a 100 mm one, because area grows with the square of the diameter.

Be wary of boxes that advertise 500× or 600× magnification. The highest useful magnification of a telescope is about twice its aperture in millimetres, so a 70 mm instrument tops out around 140×. Beyond that the image only gets bigger and dimmer.

## The mount matters as much as the tube

A good optical tube on a shaky tripod is a poor experience. At high magnification, the lightest touch sends the target out of view. When comparing two kits at the same price, favour the one with the steadier mount.

## A suggestion for beginners

For most beginners we suggest a Dobsonian reflector of 150 to 200 mm aperture. It is a Newtonian reflector on a simple rotating wooden base, with no complex alignment, and it offers the most aperture for the money. Its drawback is bulk, so if you live in a walk-up apartment or travel mostly by motorbike, an 80 to 100 mm refractor on a solid alt-azimuth mount may suit you better.

Computerised go-to telescopes are convenient, but at the same price they usually trade away aperture. On a limited budget, spend on aperture and learn to find your own way around the sky.

## Accessories worth buying first

A red torch, so you can read a chart without losing your dark adaptation. A printed star atlas or an app with a red mode. One low-power, wide-field eyepiece. For everything else, wait a few months of use until you know what you really need.

If you are unsure, you can rent a telescope through Sao Viet and try it on a trip before deciding to buy.`,
    },
  },
  {
    slug: "a-night-at-ta-xua",
    category: "story",
    date: "2026-11-01",
    readingMinutes: 4,
    title: { vi: "Một đêm ở Tà Xùa", en: "A Night at Ta Xua" },
    excerpt: {
      vi: "Ghi chép của một hướng dẫn viên: từ lúc mây còn phủ kín đến khi tâm Ngân Hà nhô lên khỏi rặng núi.",
      en: "A guide's notes: from the hour the cloud covered everything to the moment the galactic core cleared the ridge.",
    },
    cover: cover("a-night-at-ta-xua", {
      vi: "Lều trại trên sống núi Tà Xùa dưới bầu trời sao",
      en: "Tents on the Ta Xua ridge beneath the stars",
    }),
    body: {
      vi: `Đây là ghi chép của một hướng dẫn viên trong chuyến đi thử nghiệm đầu tháng năm. Tên người tham gia đã được lược bỏ.

## Bảy giờ tối

Mây phủ kín sống núi. Từ hiên homestay, chúng tôi chỉ nhìn thấy đèn pin của nhau và một vùng xám đều không có chiều sâu. Một vị khách hỏi liệu có nên đi ngủ sớm. Tôi trả lời rằng ở Tà Xùa, mây thường ở thấp hơn ta và hay dịch chuyển sau khi mặt trời lặn hẳn, nhưng không ai hứa trước được điều gì.

Chúng tôi uống trà, kiểm tra lại kính và giá đỡ, bật đèn đỏ. Đó là phần việc nhàm chán mà người làm thiên văn nào cũng quen: chuẩn bị thật kỹ cho một thứ có thể không đến.

## Chín giờ rưỡi

Gió đổi hướng. Lớp mây bắt đầu tụt xuống thung lũng như nước rút. Đầu tiên là sao Chức Nữ ở phía đông bắc, rồi chòm Bắc Đẩu nghiêng trên rặng núi phía bắc. Khi mây nằm hẳn dưới chân, nó thành một tấm thảm trắng mờ, che luôn ánh đèn của các bản dưới thung. Bầu trời phía trên tối hơn hẳn đêm trước.

Chúng tôi lên sống Khủng Long, mất khoảng hai mươi phút đi bộ. Không ai nói nhiều. Ở độ cao này, tiếng gió và tiếng bước chân trên đá là thứ duy nhất còn lại.

## Mười hai giờ đêm

Chòm Thiên Hạt mọc trọn vẹn ở phía đông nam, sao Tâm đỏ cam nằm giữa. Phía sau nó, dải Ngân Hà bắt đầu dày lên thành những đám mây sao, xen giữa là các vệt bụi tối. Tôi chĩa kính vào tinh vân Lagoon, một đốm sáng mờ có vệt tối chạy ngang. Một vị khách nhìn lâu rồi nói rằng anh tưởng nó sẽ có màu như trong ảnh. Tôi giải thích rằng mắt người ở trong bóng tối gần như không nhận ra màu của vật mờ; màu sắc là thứ máy ảnh thu được sau nhiều phút phơi sáng. Anh vẫn nhìn tiếp.

## Hai giờ sáng

Tâm Ngân Hà đã lên khỏi rặng núi phía nam, ở độ cao chừng ba mươi độ. Trên điện thoại, máy đo SQM ứng dụng cho con số khoảng 21,6 ở thiên đỉnh. Đây là một số đo bằng điện thoại nên chỉ mang tính tham khảo, nhưng nó khớp với ước tính Bortle 3 của chúng tôi cho điểm này.

Vài người chụp ảnh. Vài người chỉ nằm trên tấm bạt. Một người kể rằng lần cuối anh thấy Ngân Hà là khi còn nhỏ, ở quê, trước khi làng có điện đường.

## Năm giờ sáng

Phía đông sáng dần. Biển mây vẫn còn đó, lần này nhuộm hồng dưới ánh bình minh. Chúng tôi xuống núi trong im lặng, mệt, và có lẽ hơi khác so với tối hôm trước.`,
      en: `These are a guide's notes from a trial trip in early May. Participants' names have been omitted.

## Seven in the evening

Cloud covered the ridge. From the homestay porch we could see only each other's torches and a flat grey without depth. One guest asked whether we should turn in early. I said that at Ta Xua the cloud usually sits below us and often shifts once the sun is fully down, but no one can promise anything in advance.

We drank tea, checked the telescope and the mount again, and switched to red light. It is the dull part of the work every observer knows: careful preparation for something that may not come.

## Half past nine

The wind changed. The cloud began to drain into the valley like an ebbing tide. First came Vega in the north-east, then the Big Dipper tilting over the northern range. Once the cloud lay fully below us it became a pale carpet, covering the lights of the villages in the valley. The sky above was clearly darker than the night before.

We walked up to Dinosaur Ridge, about twenty minutes on foot. Nobody said much. At that height the wind and our steps on the rock were the only sounds left.

## Midnight

Scorpius had fully risen in the south-east, orange Antares at its heart. Behind it the Milky Way thickened into star clouds broken by dark lanes of dust. I turned the telescope to the Lagoon Nebula, a faint glow crossed by a dark band. One guest looked for a long time and said he had expected the colours from photographs. I explained that in the dark the human eye barely registers colour in faint objects; colour is what a camera gathers over many minutes of exposure. He kept looking.

## Two in the morning

The galactic core had cleared the southern range and stood about thirty degrees high. On a phone, an SQM app gave a reading of around 21.6 at the zenith. A phone reading is only indicative, but it agreed with our Bortle 3 estimate for the site.

Some people took photographs. Some simply lay on the groundsheet. One said the last time he had seen the Milky Way was as a child in his home village, before the street lights arrived.

## Five in the morning

The east grew pale. The sea of cloud was still there, now tinted pink by the dawn. We walked down in silence, tired, and perhaps a little changed from the evening before.`,
    },
  },
];

export function postBySlug(slug: string): Post | undefined {
  return posts.find((p) => p.slug === slug);
}

for (const p of posts) {
  const cover = postCovers[p.slug];
  if (cover && p.cover.license === "TBD") p.cover = cover;
}

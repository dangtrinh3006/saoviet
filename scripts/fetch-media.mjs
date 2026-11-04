// Downloads licensed media into public/img and resizes it. Re-run safely: existing files are skipped.
// Every entry's licence/author is mirrored in src/content/media.ts for on-page attribution.
import { existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import sharp from "sharp";

const C = "https://upload.wikimedia.org/wikipedia/commons/thumb";
const PH = "https://dl.polyhaven.org/file/ph-assets/HDRIs/extra/Tonemapped%20JPG";

const MEDIA = [
  ["places/ta-xua.jpg", `${C}/1/1c/Man_alone_in_T%E1%BA%A3_X%C3%B9a_03-03-2017.jpg/1920px-Man_alone_in_T%E1%BA%A3_X%C3%B9a_03-03-2017.jpg`, 1600],
  ["places/ha-giang.jpg", `${C}/4/46/Ma_Pi_Leng_Pass_winding_road_Ha_Giang_Vietnam.jpg/1920px-Ma_Pi_Leng_Pass_winding_road_Ha_Giang_Vietnam.jpg`, 1600],
  ["places/moc-chau.jpg", "https://upload.wikimedia.org/wikipedia/commons/7/71/Moc-chau-tea-doi-2094890_960_720.jpg", 960],
  ["places/fansipan.jpg", `${C}/7/70/Fansipan_Summit_3143m_aerial_view_Sa_Pa_Lao_Cai_Vietnam.jpg/1920px-Fansipan_Summit_3143m_aerial_view_Sa_Pa_Lao_Cai_Vietnam.jpg`, 1600],
  ["places/lang-biang.jpg", `${C}/3/38/Lang_Biang_mountain_in_Da_Lat_Vietnam_-_panoramio_%283%29.jpg/1280px-Lang_Biang_mountain_in_Da_Lat_Vietnam_-_panoramio_%283%29.jpg`, 1280],
  ["places/con-dao.jpg", `${C}/3/3d/C%C3%B4n_%C4%90%E1%BA%A3o_National_Park.jpg/1920px-C%C3%B4n_%C4%90%E1%BA%A3o_National_Park.jpg`, 1600],
  ["places/phu-quoc.jpg", `${C}/1/1f/1_Phu_Quoc_beach_Saigon_Phu_Quoc_Resort_and_Spa.jpg/1920px-1_Phu_Quoc_beach_Saigon_Phu_Quoc_Resort_and_Spa.jpg`, 1600],
  ["places/vinh-hy.jpg", `${C}/7/78/Vinh_hy_bay.jpg/1920px-Vinh_hy_bay.jpg`, 1600],
  ["places/pu-luong.jpg", `${C}/2/2e/Pu_Luong_01.JPG/1920px-Pu_Luong_01.JPG`, 1600],
  ["places/mu-cang-chai.jpg", `${C}/d/de/Terraces_in_Che_Cu_Nha_commune%2C_Mu_Cang_Chai_%28Unsplash%29.jpg/1920px-Terraces_in_Che_Cu_Nha_commune%2C_Mu_Cang_Chai_%28Unsplash%29.jpg`, 1600],
  ["space/milky-way-eso.jpg", "https://cdn.eso.org/images/large/eso0932a.jpg", 2400],
  ["space/webb.jpg", "https://cdn.esawebb.org/archives/images/screen/weic2205a.jpg", 1600],
  ["pano/satara-night.jpg", `${PH}/satara_night.jpg`, 4096],
  ["pano/kloppenheim.jpg", `${PH}/kloppenheim_02.jpg`, 4096],
  ["pano/moonless-golf.jpg", `${PH}/moonless_golf.jpg`, 4096],
  ["pano/eso-southern-sky.jpg", `${C}/9/90/Rare_360-degree_panorama_of_the_southern_sky_%28vlt-mw-potw-cc-extended%29.jpg/3840px-Rare_360-degree_panorama_of_the_southern_sky_%28vlt-mw-potw-cc-extended%29.jpg`, 3840],
  ["pano/mekong-delta.jpg", `${C}/3/37/Mekong_Delta_2024_360.jpg/3840px-Mekong_Delta_2024_360.jpg`, 3840],
];

const root = join(import.meta.dirname, "..", "public", "img");
let failed = 0;
for (const [rel, url, width] of MEDIA) {
  const out = join(root, rel);
  if (existsSync(out)) {
    console.log(`= ${rel}`);
    continue;
  }
  mkdirSync(dirname(out), { recursive: true });
  try {
    // Wikimedia rejects requests without a descriptive User-Agent.
    let res;
    // Wikimedia rate-limits bursts (429); back off and retry a few times.
    for (let attempt = 0; attempt < 5; attempt++) {
      res = await fetch(url, { headers: { "User-Agent": "SaoVietDemo/0.1 (astro-tourism demo; contact via repo)" } });
      if (res.status !== 429) break;
      await new Promise((r) => setTimeout(r, 4000 * (attempt + 1)));
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    await new Promise((r) => setTimeout(r, 1500));
    const buf = Buffer.from(await res.arrayBuffer());
    await sharp(buf).resize({ width, withoutEnlargement: true }).jpeg({ quality: 80, mozjpeg: true }).toFile(out);
    console.log(`+ ${rel}`);
  } catch (err) {
    failed++;
    console.log(`! ${rel}: ${err.message}`);
  }
}
process.exit(failed ? 1 : 0);

import type { ImageRef, Region } from "./types";

// Files are fetched by scripts/fetch-media.mjs; attribution here is what CC BY / BY-SA require.
const img = (src: string, vi: string, en: string, credit: string, license: string, sourceUrl: string): ImageRef => ({
  src,
  alt: { vi, en },
  credit,
  license,
  sourceUrl,
});

const COMMONS = "https://commons.wikimedia.org/wiki/File:";

export const placePhotos: Record<string, ImageRef> = {
  "ta-xua": img("/img/places/ta-xua.jpg", "Biển mây Tà Xùa", "Sea of clouds at Tà Xùa", "Linh Pham", "CC0", `${COMMONS}Man_alone_in_Tả_Xùa_03-03-2017.jpg`),
  "dong-van": img("/img/places/ha-giang.jpg", "Đèo Mã Pì Lèng, Hà Giang", "Mã Pì Lèng pass, Hà Giang", "Khánh Hmoong", "CC BY 2.0", `${COMMONS}Ma_Pi_Leng_Pass_winding_road_Ha_Giang_Vietnam.jpg`),
  "moc-chau-pha-luong": img("/img/places/moc-chau.jpg", "Đồi chè Mộc Châu", "Mộc Châu tea hills", "ToanNguyen", "CC0", `${COMMONS}Moc-chau-tea-doi-2094890_960_720.jpg`),
  fansipan: img("/img/places/fansipan.jpg", "Đỉnh Fansipan nhìn từ trên cao", "Fansipan summit from above", "Vivu Vietnam", "CC BY-SA 4.0", `${COMMONS}Fansipan_Summit_3143m_aerial_view_Sa_Pa_Lao_Cai_Vietnam.jpg`),
  "lang-biang": img("/img/places/lang-biang.jpg", "Núi Lang Biang, Đà Lạt", "Lang Biang mountain, Đà Lạt", "The Erica Chang", "CC BY 3.0", `${COMMONS}Lang_Biang_mountain_in_Da_Lat_Vietnam_-_panoramio_(3).jpg`),
  "con-dao": img("/img/places/con-dao.jpg", "Vườn quốc gia Côn Đảo", "Côn Đảo National Park", "Tycho", "CC BY-SA 3.0", `${COMMONS}Côn_Đảo_National_Park.jpg`),
  "bac-phu-quoc": img("/img/places/phu-quoc.jpg", "Bờ biển Phú Quốc", "Phú Quốc coastline", "Elmschrat", "CC0", `${COMMONS}1_Phu_Quoc_beach_Saigon_Phu_Quoc_Resort_and_Spa.jpg`),
  "nui-chua-vinh-hy": img("/img/places/vinh-hy.jpg", "Vịnh Vĩnh Hy", "Vĩnh Hy bay", "Karel Bilek", "CC BY-SA 4.0", `${COMMONS}Vinh_hy_bay.jpg`),
  "pu-luong": img("/img/places/pu-luong.jpg", "Thung lũng Pù Luông", "Pù Luông valley", "Gió Đông", "Public domain", `${COMMONS}Pu_Luong_01.JPG`),
  "mu-cang-chai": img("/img/places/mu-cang-chai.jpg", "Ruộng bậc thang Mù Cang Chải", "Mù Cang Chải rice terraces", "Doan Tuan", "CC0", `${COMMONS}Terraces_in_Che_Cu_Nha_commune,_Mu_Cang_Chai_(Unsplash).jpg`),
};

export const space = {
  milkyWay: img("/img/space/milky-way-eso.jpg", "Toàn cảnh dải Ngân Hà", "Milky Way panorama", "ESO/S. Brunier", "CC BY 4.0", "https://www.eso.org/public/images/eso0932a/"),
  webb: img("/img/space/webb.jpg", "Ảnh của kính viễn vọng James Webb", "James Webb Space Telescope image", "ESA/Webb, NASA & CSA", "CC BY 4.0", "https://esawebb.org/images/weic2205a/"),
};

// Real 360° night skies (not of the exact site): CC0 HDRI skies and ESO's southern sky.
const PANOS = {
  satara: img("/img/pano/satara-night.jpg", "Bầu trời 360° với dải Ngân Hà", "360° sky with the Milky Way", "Greg Zaal / Poly Haven", "CC0", "https://polyhaven.com/a/satara_night"),
  kloppenheim: img("/img/pano/kloppenheim.jpg", "Bầu trời đêm 360°", "360° night sky", "Greg Zaal / Poly Haven", "CC0", "https://polyhaven.com/a/kloppenheim_02"),
  moonless: img("/img/pano/moonless-golf.jpg", "Đêm không trăng 360°", "Moonless night, 360°", "Greg Zaal / Poly Haven", "CC0", "https://polyhaven.com/a/moonless_golf"),
  eso: img("/img/pano/eso-southern-sky.jpg", "Bầu trời phương Nam 360° tại Paranal", "360° southern sky at Paranal", "ESO/H.H. Heyer", "CC BY 4.0", "https://www.eso.org/public/images/vlt-mw-potw-cc-extended/"),
  mekong: img("/img/pano/mekong-delta.jpg", "Đồng bằng sông Cửu Long 360°", "Mekong Delta in 360°", "Omar David Sandoval Sida", "CC BY-SA 4.0", `${COMMONS}Mekong_Delta_2024_360.jpg`),
};

export const panoramaForRegion: Record<Region, ImageRef> = {
  north: PANOS.satara,
  central: PANOS.kloppenheim,
  highlands: PANOS.moonless,
  south: PANOS.mekong,
  islands: PANOS.eso,
};

export const postCovers: Record<string, ImageRef> = {
  "bortle-scale-explained": space.milkyWay,
  "when-to-see-the-milky-way-in-vietnam": PANOS.satara,
  "light-pollution-in-vietnam": placePhotos["dong-van"],
  "choosing-your-first-telescope": space.webb,
  "a-night-at-ta-xua": placePhotos["ta-xua"],
};

// Sites without their own licensed photo borrow a same-province shot (or the Milky Way).
export const tourPhotoFallback: Record<string, ImageRef> = {
  "mui-dinh": placePhotos["nui-chua-vinh-hy"],
  "bidoup-nui-ba": placePhotos["lang-biang"],
  "phong-nha-ke-bang": space.milkyWay,
};

export interface HeroVideo {
  src: string;
  poster: string;
  credit: string;
  license: string;
  sourceUrl: string;
}

// Re-encoded to 720p/25fps, muted, ≤10 s (scripts in docs). ESO requires a visible credit.
export const heroVideos: HeroVideo[] = [
  { src: "/video/paranal.mp4", poster: "/video/paranal.jpg", credit: "ESO/B.Tafreshi", license: "CC BY 4.0", sourceUrl: "https://www.eso.org/public/videos/uhd_bt_paranal_03/" },
  { src: "/video/lasilla.mp4", poster: "/video/lasilla.jpg", credit: "ESO/B. Tafreshi (twanight.org)", license: "CC BY 4.0", sourceUrl: "https://www.eso.org/public/videos/bt_lasilla_crux/" },
  { src: "/video/star-trails.mp4", poster: "/video/star-trails.jpg", credit: "ESO/B.Tafreshi", license: "CC BY 4.0", sourceUrl: "https://www.eso.org/public/videos/bt_lasilla_diff/" },
  { src: "/video/hills.mp4", poster: "/video/hills.jpg", credit: "Emre Ayata / Pexels", license: "Pexels License", sourceUrl: "https://www.pexels.com/video/stunning-timelapse-of-milky-way-over-hills-32063954/" },
  { src: "/video/vlt-domes.mp4", poster: "/video/vlt-domes.jpg", credit: "ESO/José Francisco Salgado (josefrancisco.org)", license: "CC BY 4.0", sourceUrl: "https://www.eso.org/public/videos/vltandatrotationtimelapse/" },
];

"use client";

// One icon set for the whole site (Phosphor, light/duotone), behind the names the
// components already use, so swapping families never touches feature code.
import {
  Archive as PhArchive,
  ArrowDown as PhArrowDown,
  ArrowLeft as PhArrowLeft,
  ArrowRight as PhArrowRight,
  ArrowUp as PhArrowUp,
  ArrowUpRight as PhArrowUpRight,
  Binoculars,
  Camera as PhCamera,
  ChatCircle,
  Check as PhCheck,
  CheckCircle,
  Cloud as PhCloud,
  Copy as PhCopy,
  Eye as PhEye,
  EyeSlash,
  GraduationCap as PhGraduationCap,
  Jeep as PhJeep,
  FloppyDisk,
  List,
  MapPinPlus as PhMapPinPlus,
  MagnifyingGlass,
  Moon as PhMoon,
  MoonStars,
  PencilSimple,
  Mountains,
  Planet,
  Plus as PhPlus,
  PushPin,
  ShieldCheck,
  SignOut,
  SpinnerGap,
  Stack,
  Star as PhStar,
  Sun as PhSun,
  Tent as PhTent,
  Trash as PhTrash,
  User as PhUser,
  Users as PhUsers,
  Warning as PhWarning,
  Wind as PhWind,
  X as PhX,
  type Icon,
  type IconWeight,
} from "@phosphor-icons/react";

type Props = { size?: number; className?: string; strokeWidth?: number; weight?: IconWeight };

function wrap(Ph: Icon, fallback: IconWeight = "light") {
  function Wrapped({ size = 18, className, weight }: Props) {
    // Tailwind "fill-*" means a solid glyph (e.g. rated stars).
    const w = weight ?? (className?.includes("fill-") ? "fill" : fallback);
    return <Ph size={size} weight={w} className={className} aria-hidden />;
  }
  return Wrapped;
}

export const Archive = wrap(PhArchive);
export const ArrowDown = wrap(PhArrowDown);
export const ArrowLeft = wrap(PhArrowLeft);
export const ArrowRight = wrap(PhArrowRight);
export const ArrowUp = wrap(PhArrowUp);
export const ArrowUpRight = wrap(PhArrowUpRight);
export const Camera = wrap(PhCamera, "duotone");
export const Check = wrap(PhCheck, "bold");
export const CheckCircle2 = wrap(CheckCircle, "duotone");
export const Cloud = wrap(PhCloud);
export const Copy = wrap(PhCopy);
export const Eye = wrap(PhEye);
export const EyeOff = wrap(EyeSlash);
export const GraduationCap = wrap(PhGraduationCap, "duotone");
export const Jeep = wrap(PhJeep, "duotone");
export const Layers = wrap(Stack);
export const Loader2 = wrap(SpinnerGap, "bold");
export const LogOut = wrap(SignOut);
export const MapPinPlus = wrap(PhMapPinPlus, "duotone");
export const Menu = wrap(List);
export const MessageSquare = wrap(ChatCircle);
export const Moon = wrap(PhMoon);
export const MoonStar = wrap(MoonStars, "duotone");
export const Mountain = wrap(Mountains);
export const Orbit = wrap(Planet, "duotone");
export const Pencil = wrap(PencilSimple);
export const Pin = wrap(PushPin);
export const Plus = wrap(PhPlus);
export const Save = wrap(FloppyDisk);
export const Search = wrap(MagnifyingGlass);
export const Shield = wrap(ShieldCheck);
export const Star = wrap(PhStar);
export const Sun = wrap(PhSun);
export const Telescope = wrap(Binoculars, "duotone");
export const Tent = wrap(PhTent, "duotone");
export const Trash = wrap(PhTrash);
export const User = wrap(PhUser);
export const Users = wrap(PhUsers, "duotone");
export const Warning = wrap(PhWarning);
export const Wind = wrap(PhWind);
export const X = wrap(PhX);

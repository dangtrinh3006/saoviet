import { Camera, GraduationCap, Moon, Telescope, Tent, Users } from "@/components/ui/icons";

// Plain module (no "use client") so both server and client components can share the map.
export const SERVICE_ICON_COMPONENTS = {
  telescope: Telescope,
  camera: Camera,
  tent: Tent,
  users: Users,
  graduation: GraduationCap,
  moon: Moon,
} as const;

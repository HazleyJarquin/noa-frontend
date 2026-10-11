import type { MantineColorsTuple } from "@mantine/core";

// Design tokens from the NOA brand guide. Single source of truth:
// Mantine reads them through the theme, Tailwind through the --noa-* CSS variables.
export const tokens = {
  // 01 · Brand
  primary: "#131451", // Navy Deep
  primaryContainer: "#292B67", // Navy Institucional (Pantone 2748 C)
  primaryFixed: "#E1E0FF", // Navy Light Container
  onPrimary: "#FFFFFF",
  secondary: "#51589F", // Indigo Soft

  // 02 · Surfaces
  surface: "#FBF8FF",
  surfaceContainerLowest: "#FFFFFF",
  surfaceContainerLow: "#F3F2FF",
  surfaceContainer: "#EEF0FF",
  onSurface: "#141A35",
  outlineVariant: "#C7C5D1",

  // 03 · Semantic / commerce
  success: "#107C41", // Emerald Deep
  successSoft: "#269F6E", // icons on success containers (chat button)
  successContainer: "#E6F4F0",
  successContainerHover: "#D6EFE6",
  successOutline: "#ACEAC7",
  warning: "#D97706", // Amber Solid
  error: "#DC2626", // Crimson Alert
  link: "#4F46E5", // Indigo Accent
  whatsapp: "#25D366",
} as const;

// Base color sits at index 6 (Mantine's default primaryShade in light mode)
export const navy: MantineColorsTuple = ["#F3F2FF", "#E1E0FF", "#C3C4D4", "#A1A2BC", "#7F80A4", "#545585", "#292B67", "#222354", "#1B1C44", "#131451"];
export const indigo: MantineColorsTuple = ["#F6F7FA", "#E7E8F2", "#CED0E4", "#B2B6D5", "#979BC5", "#7479B2", "#51589F", "#424882", "#353A69", "#2A2E53"];
export const emerald: MantineColorsTuple = ["#F3F8F6", "#DEEDE4", "#BCDACA", "#96C5AB", "#70B08D", "#409667", "#107C41", "#0D6635", "#0B522B", "#084022"];
export const amber: MantineColorsTuple = ["#FDF8F3", "#FAECDC", "#F4D9B9", "#EEC391", "#E8AD6A", "#E19238", "#D97706", "#B26205", "#8F4F04", "#713E03"];
export const crimson: MantineColorsTuple = ["#FDF4F4", "#FAE1E1", "#F5C2C2", "#F0A0A0", "#EA7D7D", "#E35151", "#DC2626", "#B41F1F", "#911919", "#721414"];
export const link: MantineColorsTuple = ["#F6F6FE", "#E6E5FB", "#CECBF8", "#B2AEF4", "#9590EF", "#726BEA", "#4F46E5", "#4139BC", "#342E97", "#292477"];

// 04 · Merchandising: standard colors for notebook covers, cardstock and markers (CMYK-verified)
export const productVariants = [
  { id: "azul-marino", name: "Azul Marino", hex: "#1E293B" },
  { id: "rojo-escolar", name: "Rojo Escolar", hex: "#B91C1C" },
  { id: "verde-bosque", name: "Verde Bosque", hex: "#15803D" },
  { id: "negro-clasico", name: "Negro Clásico", hex: "#18181B" },
  { id: "celeste-pastel", name: "Celeste Pastel", hex: "#38BDF8" },
  { id: "mostaza-ocre", name: "Mostaza Ocre", hex: "#D97706" },
] as const;

export type ProductVariant = (typeof productVariants)[number];

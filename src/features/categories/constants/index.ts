import {
  IconBackpack,
  IconBriefcase,
  IconBrush,
  IconCategory,
  IconFileText,
  IconNotebook,
  IconPalette,
  IconPencil,
  IconScissors,
  type Icon,
} from "@tabler/icons-react";

export type Category = {
  id: string;
  slug: string;
  name: string;
};

// Icons live in the frontend; Supabase only stores the slug
export const CATEGORY_ICONS: Record<string, Icon> = {
  cuadernos: IconNotebook,
  escritura: IconPencil,
  "arte-color": IconPalette,
  papeleria: IconFileText,
  oficina: IconBriefcase,
  "tijeras-diy": IconScissors,
  pegamentos: IconBrush,
  "kits-lista": IconBackpack,
};

export const getCategoryIcon = (slug: string) =>
  CATEGORY_ICONS[slug] ?? IconCategory;

// The catalog filters by category through the URL
export const getCategoryHref = (slug: string) => `/productos?categoria=${slug}`;

import {
  IconBook,
  IconCircleCheck,
  IconShield,
  IconTruckDelivery,
  type Icon,
} from "@tabler/icons-react";

export type ProductSort = "recomendados" | "precio-asc" | "precio-desc";

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  categorySlug: string;
  price: number;
  previousPrice?: number;
  onSale: boolean;
  badgeLabel?: string;
  // Total stock across variants
  stock: number;
  inStock: boolean;
  // Products with options (color, sheet type…) must be configured on the detail page;
  // single-variant products can be added straight from a card
  hasOptions: boolean;
  defaultVariant?: { id: string; stock: number };
  // Cover image (position 0), used by cards and the cart
  image?: string;
};

export type ProductImage = {
  url: string;
  alt: string;
};

export type ProductOptionValue = {
  id: string;
  label: string;
  colorHex?: string;
};

export type ProductOption = {
  id: string;
  name: string;
  kind: "text" | "color";
  values: ProductOptionValue[];
};

export type ProductVariant = {
  id: string;
  sku: string;
  price: number;
  stock: number;
  optionValueIds: string[];
};

export type ProductHighlight = {
  icon: string;
  title: string;
  text: string;
};

export type ProductSpecification = {
  label: string;
  value: string;
};

// Product detail page: full gallery (3–5 images), options and variants
export type ProductDetail = Product & {
  brand?: string;
  shortDescription?: string;
  description: string[];
  highlights: ProductHighlight[];
  specifications: ProductSpecification[];
  images: ProductImage[];
  options: ProductOption[];
  variants: ProductVariant[];
};

export const MIN_PRODUCT_IMAGES = 3;
export const MAX_PRODUCT_IMAGES = 5;

// Supabase stores the icon key; the frontend maps it to a Tabler icon
export const HIGHLIGHT_ICONS: Record<string, Icon> = {
  book: IconBook,
  shield: IconShield,
  truck: IconTruckDelivery,
};

export const getHighlightIcon = (key: string) =>
  HIGHLIGHT_ICONS[key] ?? IconCircleCheck;

export const getProductHref = (slug: string) => `/productos/${slug}`;

export const PRODUCTS_PAGE_HREF = "/productos";
export const CATEGORY_SEARCH_PARAM = "categoria";
export const PRODUCTS_PAGE_SIZE = 20;

// Same for every product; move to Supabase if it ever varies per product
export const DELIVERY_POLICIES = [
  {
    title: "Managua",
    text: "Entrega express en 24 horas hábiles en pedidos confirmados antes de las 3:00 p.m.",
  },
  {
    title: "Departamentos",
    text: "Despachos a todo el país por transportista de 2 a 4 días hábiles.",
  },
  {
    title: "Cambios y devoluciones",
    text: "Tienes 7 días para cambios por defecto de fábrica, con el producto sin uso y en su empaque.",
  },
];

export const PRODUCT_SORTS: { value: ProductSort; label: string }[] = [
  { value: "recomendados", label: "Recomendados" },
  { value: "precio-asc", label: "Menor precio" },
  { value: "precio-desc", label: "Mayor precio" },
];

export const ALL_CATEGORIES_FILTER = "todos";

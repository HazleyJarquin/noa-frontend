import type { Product, ProductSort } from "../constants";

export const sortProducts = (products: Product[], sort: ProductSort) => {
  if (sort === "precio-asc") return [...products].sort((a, b) => a.price - b.price);
  if (sort === "precio-desc") return [...products].sort((a, b) => b.price - a.price);
  // "Recomendados": in-stock first, keeping the original order within each group
  return [...products].sort((a, b) => Number(b.inStock) - Number(a.inStock));
};

// Lowercase without accents, so "lapiz" matches "Lápiz"
export const normalizeSearch = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();

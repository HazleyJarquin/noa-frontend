"use cache";

import { cacheLife, cacheTag } from "next/cache";
import type { QueryData } from "@supabase/supabase-js";
import { createPublicClient } from "@/shared/lib/supabase/public";
import { supabaseEnv } from "@/shared/lib/supabase/env";
import type {
  Product,
  ProductDetail,
  ProductHighlight,
  ProductSpecification,
} from "../constants";

type PublicClient = ReturnType<typeof createPublicClient>;

const getImageUrl = (path: string) =>
  `${supabaseEnv.url}/storage/v1/object/public/products/${path}`;

// ─── Cards (catalog, recommendations) ──────────────────────────────────────

const selectProducts = (supabase: PublicClient) =>
  supabase
    .from("products")
    .select(
      "id, slug, name, price, previous_price, on_sale, badge_label, category:categories!inner(slug, name), product_images(path, alt, position), product_variants(id, stock, position)",
    )
    // Cards only need the cover
    .order("position", { referencedTable: "product_images" })
    .limit(1, { referencedTable: "product_images" })
    .order("position", { referencedTable: "product_variants" });

type ProductRow = QueryData<ReturnType<typeof selectProducts>>[number];

const toProduct = (row: ProductRow): Product => {
  const stock = row.product_variants.reduce((total, variant) => total + variant.stock, 0);
  const [onlyVariant] = row.product_variants;
  const hasOptions = row.product_variants.length > 1;

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category.name,
    categorySlug: row.category.slug,
    price: row.price,
    previousPrice: row.previous_price ?? undefined,
    onSale: row.on_sale,
    badgeLabel: row.badge_label ?? undefined,
    stock,
    inStock: stock > 0,
    hasOptions,
    defaultVariant:
      !hasOptions && onlyVariant
        ? { id: onlyVariant.id, stock: onlyVariant.stock }
        : undefined,
    image: row.product_images[0] ? getImageUrl(row.product_images[0].path) : undefined,
  };
};

export const getFeaturedProducts = async (): Promise<Product[]> => {
  cacheTag("products");
  cacheLife("hours");

  const supabase = createPublicClient();
  const { data, error } = await selectProducts(supabase)
    .eq("is_featured", true)
    .order("created_at")
    // Tie-breaker: seeded rows share created_at
    .order("name");

  if (error) {
    throw new Error(`No se pudieron cargar los productos: ${error.message}`);
  }

  return data.map(toProduct);
};

// Whole catalog for /productos (~300 rows): filtered, searched and paginated on the client
export const getAllProducts = async (): Promise<Product[]> => {
  cacheTag("products");
  cacheLife("hours");

  const supabase = createPublicClient();
  const { data, error } = await selectProducts(supabase).order("name");

  if (error) {
    throw new Error(`No se pudieron cargar los productos: ${error.message}`);
  }

  return data.map(toProduct);
};

export const getRecommendedProducts = async (productId: string): Promise<Product[]> => {
  cacheTag("products", `product-recommendations:${productId}`);
  cacheLife("hours");

  const supabase = createPublicClient();
  const { data: recommendations, error: recommendationsError } = await supabase
    .from("product_recommendations")
    .select("recommended_product_id")
    .eq("product_id", productId)
    .order("position");

  if (recommendationsError) {
    throw new Error(`No se pudieron cargar los recomendados: ${recommendationsError.message}`);
  }

  const ids = recommendations.map((row) => row.recommended_product_id);
  if (ids.length === 0) return [];

  const { data, error } = await selectProducts(supabase).in("id", ids);

  if (error) {
    throw new Error(`No se pudieron cargar los recomendados: ${error.message}`);
  }

  // Keep the order chosen in Supabase
  return data
    .map(toProduct)
    .sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));
};

export const getProductSlugs = async (): Promise<string[]> => {
  cacheTag("products");
  cacheLife("hours");

  const supabase = createPublicClient();
  const { data, error } = await supabase.from("products").select("slug");

  if (error) {
    throw new Error(`No se pudieron cargar los productos: ${error.message}`);
  }

  return data.map((row) => row.slug);
};

// ─── Detail page ───────────────────────────────────────────────────────────

const selectProductDetail = (supabase: PublicClient) =>
  supabase
    .from("products")
    .select(
      "id, slug, name, price, previous_price, on_sale, badge_label, brand, short_description, description, highlights, specifications, category:categories!inner(slug, name), product_images(path, alt, position), product_options(id, name, kind, position, product_option_values(id, label, color_hex, position)), product_variants(id, sku, price, stock, position, product_variant_values(option_value_id))",
    )
    .order("position", { referencedTable: "product_images" })
    .order("position", { referencedTable: "product_options" })
    .order("position", { referencedTable: "product_options.product_option_values" })
    .order("position", { referencedTable: "product_variants" });

export const getProductBySlug = async (slug: string): Promise<ProductDetail | null> => {
  cacheTag("products", `product:${slug}`);
  cacheLife("hours");

  const supabase = createPublicClient();
  const { data, error } = await selectProductDetail(supabase).eq("slug", slug).maybeSingle();

  if (error) {
    throw new Error(`No se pudo cargar el producto: ${error.message}`);
  }
  if (!data) return null;

  const stock = data.product_variants.reduce((total, variant) => total + variant.stock, 0);
  const hasOptions = data.product_variants.length > 1;
  const [onlyVariant] = data.product_variants;

  return {
    id: data.id,
    slug: data.slug,
    name: data.name,
    category: data.category.name,
    categorySlug: data.category.slug,
    price: data.price,
    previousPrice: data.previous_price ?? undefined,
    onSale: data.on_sale,
    badgeLabel: data.badge_label ?? undefined,
    stock,
    inStock: stock > 0,
    hasOptions,
    defaultVariant:
      !hasOptions && onlyVariant
        ? { id: onlyVariant.id, stock: onlyVariant.stock }
        : undefined,
    image: data.product_images[0] ? getImageUrl(data.product_images[0].path) : undefined,
    brand: data.brand ?? undefined,
    shortDescription: data.short_description ?? undefined,
    description: (data.description ?? "").split(/\n\s*\n/).filter(Boolean),
    // jsonb columns: shape documented in the migration
    highlights: data.highlights as ProductHighlight[],
    specifications: data.specifications as ProductSpecification[],
    images: data.product_images.map((image) => ({
      url: getImageUrl(image.path),
      alt: image.alt ?? data.name,
    })),
    options: data.product_options.map((option) => ({
      id: option.id,
      name: option.name,
      kind: option.kind === "color" ? "color" : "text",
      values: option.product_option_values.map((value) => ({
        id: value.id,
        label: value.label,
        colorHex: value.color_hex ?? undefined,
      })),
    })),
    variants: data.product_variants.map((variant) => ({
      id: variant.id,
      sku: variant.sku,
      price: variant.price ?? data.price,
      stock: variant.stock,
      optionValueIds: variant.product_variant_values.map((value) => value.option_value_id),
    })),
  };
};

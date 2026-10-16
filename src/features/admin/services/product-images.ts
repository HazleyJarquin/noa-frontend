import "server-only";

import { updateTag } from "next/cache";
import { createAdminClient } from "@/shared/lib/supabase/admin";
import { supabaseEnv } from "@/shared/lib/supabase/env";
import {
  MAX_PRODUCT_IMAGE_SIZE,
  MAX_PRODUCT_IMAGES,
  PRODUCT_IMAGE_TYPES,
  PRODUCT_IMAGES_BUCKET,
  type AdminProductImage,
  type AdminProductOption,
} from "../constants";

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const getPublicUrl = (path: string) =>
  `${supabaseEnv.url}/storage/v1/object/public/${PRODUCT_IMAGES_BUCKET}/${path}`;

// The catalog caches products for hours: show the change in the store right away
const refreshCatalog = () => updateTag("products");

const getProductSlug = async (productId: string) => {
  const { data, error } = await createAdminClient()
    .from("products")
    .select("slug")
    .eq("id", productId)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("Producto no encontrado");
  return data.slug;
};

const getImageIds = async (productId: string) => {
  const { data, error } = await createAdminClient()
    .from("product_images")
    .select("id")
    .eq("product_id", productId)
    .order("position");
  if (error) throw error;
  return data.map((row) => row.id);
};

export const listProducts = async (): Promise<AdminProductOption[]> => {
  const { data, error } = await createAdminClient()
    .from("products")
    .select("id, name, product_images(count)")
    .order("name");
  if (error) throw error;
  return data.map((row) => ({
    id: row.id,
    name: row.name,
    imageCount: row.product_images[0]?.count ?? 0,
  }));
};

export const getProductImages = async (productId: string): Promise<AdminProductImage[]> => {
  const { data, error } = await createAdminClient()
    .from("product_images")
    .select("id, path, position")
    .eq("product_id", productId)
    .order("position");
  if (error) throw error;
  return data.map((row) => ({ id: row.id, url: getPublicUrl(row.path), position: row.position }));
};

export const prepareImageUpload = async (productId: string, file: { type: string; size: number }) => {
  if (!PRODUCT_IMAGE_TYPES.includes(file.type)) {
    return { ok: false as const, error: "Solo se aceptan fotos JPG, PNG o WebP." };
  }
  if (file.size <= 0 || file.size > MAX_PRODUCT_IMAGE_SIZE) {
    return { ok: false as const, error: "La foto puede pesar hasta 8 MB." };
  }
  if ((await getImageIds(productId)).length >= MAX_PRODUCT_IMAGES) {
    return { ok: false as const, error: `Este producto ya tiene ${MAX_PRODUCT_IMAGES} fotos.` };
  }

  // Unique name so uploads never overwrite each other
  const path = `${await getProductSlug(productId)}/${crypto.randomUUID()}.${EXTENSIONS[file.type]}`;
  const { data, error } = await createAdminClient()
    .storage.from(PRODUCT_IMAGES_BUCKET)
    .createSignedUploadUrl(path);
  if (error) throw error;
  return { ok: true as const, path: data.path, token: data.token };
};

export const addImage = async (productId: string, path: string) => {
  const slug = await getProductSlug(productId);
  const match = path.match(/^([^/]+)\/([0-9a-f-]{36}\.(?:jpg|png|webp))$/);
  // The path must belong to this product and look like one we generated
  if (!match || match[1] !== slug) return { ok: false as const, error: "Ruta de foto inválida." };

  const supabase = createAdminClient();
  // Make sure the file was really uploaded before pointing the product at it
  const { data: found, error: listError } = await supabase.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .list(slug, { search: match[2], limit: 1 });
  if (listError) throw listError;
  if (!found?.some((item) => item.name === match[2])) {
    return { ok: false as const, error: "La foto no terminó de subirse. Intenta de nuevo." };
  }

  const ids = await getImageIds(productId);
  if (ids.length >= MAX_PRODUCT_IMAGES) {
    return { ok: false as const, error: `Este producto ya tiene ${MAX_PRODUCT_IMAGES} fotos.` };
  }

  const { error } = await supabase
    .from("product_images")
    .insert({ product_id: productId, path, position: ids.length });
  if (error) throw error;

  refreshCatalog();
  return { ok: true as const };
};

export const reorderImages = async (productId: string, imageIds: string[]) => {
  const current = await getImageIds(productId);
  // Must be exactly this product's photos, each once
  const sameSet =
    imageIds.length === current.length &&
    new Set(imageIds).size === imageIds.length &&
    imageIds.every((id) => current.includes(id));
  if (!sameSet) return { ok: false as const, error: "El orden no coincide con las fotos actuales." };

  const { error } = await createAdminClient().rpc("reorder_product_images", {
    p_product_id: productId,
    p_image_ids: imageIds,
  });
  if (error) throw error;

  refreshCatalog();
  return { ok: true as const };
};

export const deleteImage = async (imageId: string) => {
  const supabase = createAdminClient();
  const { data: image, error } = await supabase
    .from("product_images")
    .select("id, product_id, path")
    .eq("id", imageId)
    .maybeSingle();
  if (error) throw error;
  if (!image) return { ok: false as const, error: "La foto ya no existe." };

  const { error: deleteError } = await supabase.from("product_images").delete().eq("id", imageId);
  if (deleteError) throw deleteError;

  // The row is gone either way; a leftover file in Storage isn't critical
  await supabase.storage.from(PRODUCT_IMAGES_BUCKET).remove([image.path]).catch(() => undefined);

  // Close the gap so positions stay 0..n-1 (0 = cover)
  const remaining = await getImageIds(image.product_id);
  if (remaining.length > 0) {
    await supabase.rpc("reorder_product_images", {
      p_product_id: image.product_id,
      p_image_ids: remaining,
    });
  }

  refreshCatalog();
  return { ok: true as const };
};

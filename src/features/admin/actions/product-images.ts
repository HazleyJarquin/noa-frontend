"use server";

import { isUuid } from "@/features/checkout/services/orders";
import type { AdminProductImage } from "../constants";
import { requireAdmin } from "../services/auth";
import {
  addImage,
  deleteImage,
  getProductImages,
  prepareImageUpload,
  reorderImages,
} from "../services/product-images";

// Every action starts with requireAdmin(): Server Actions are public endpoints

type Result<T extends object = object> = ({ ok: true } & T) | { ok: false; error: string };

const run = async <T extends object>(task: () => Promise<Result<T>>): Promise<Result<T>> => {
  try {
    return await task();
  } catch (error) {
    console.error("[admin] product images", error);
    return { ok: false, error: "Algo salió mal. Intenta de nuevo." };
  }
};

export const fetchProductImages = async (
  productId: string,
): Promise<Result<{ images: AdminProductImage[] }>> => {
  await requireAdmin();
  if (!isUuid(productId)) return { ok: false, error: "Producto inválido." };
  return run(async () => ({ ok: true, images: await getProductImages(productId) }));
};

export const requestProductImageUpload = async (
  productId: string,
  file: { type: string; size: number },
): Promise<Result<{ path: string; token: string }>> => {
  await requireAdmin();
  if (!isUuid(productId)) return { ok: false, error: "Producto inválido." };
  return run<{ path: string; token: string }>(() =>
    prepareImageUpload(productId, { type: String(file?.type ?? ""), size: Number(file?.size) }),
  );
};

export const saveProductImage = async (productId: string, path: string): Promise<Result> => {
  await requireAdmin();
  if (!isUuid(productId) || typeof path !== "string") return { ok: false, error: "Datos inválidos." };
  return run(() => addImage(productId, path));
};

export const reorderProductImages = async (productId: string, imageIds: string[]): Promise<Result> => {
  await requireAdmin();
  if (!isUuid(productId) || !Array.isArray(imageIds) || !imageIds.every(isUuid)) {
    return { ok: false, error: "Datos inválidos." };
  }
  return run(() => reorderImages(productId, imageIds));
};

export const removeProductImage = async (imageId: string): Promise<Result> => {
  await requireAdmin();
  if (!isUuid(imageId)) return { ok: false, error: "Foto inválida." };
  return run(() => deleteImage(imageId));
};

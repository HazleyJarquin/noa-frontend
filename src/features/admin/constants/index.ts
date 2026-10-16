// Shared by the admin panel (browser) and the server: no secrets here

export const PRODUCT_IMAGES_BUCKET = "products";
export const MAX_PRODUCT_IMAGES = 5; // matches product_images.position 0..4
export const MAX_PRODUCT_IMAGE_SIZE = 8 * 1024 * 1024;
// No HEIC: several browsers can't display it
export const PRODUCT_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export type AdminProductOption = { id: string; name: string; imageCount: number };

export type AdminProductImage = { id: string; url: string; position: number };

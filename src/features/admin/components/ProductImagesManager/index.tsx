"use client";

import Image from "next/image";
import { useState } from "react";
import {
  ActionIcon,
  Alert,
  Badge,
  Card,
  Group,
  Loader,
  Select,
  SimpleGrid,
  Stack,
  Text,
  Tooltip,
} from "@mantine/core";
import { Dropzone } from "@mantine/dropzone";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import {
  IconAlertCircle,
  IconArrowLeft,
  IconArrowRight,
  IconPhotoPlus,
  IconStar,
  IconTrash,
} from "@tabler/icons-react";
import { createClient } from "@/shared/lib/supabase/client";
import {
  fetchProductImages,
  removeProductImage,
  reorderProductImages,
  requestProductImageUpload,
  saveProductImage,
} from "../../actions/product-images";
import {
  MAX_PRODUCT_IMAGE_SIZE,
  MAX_PRODUCT_IMAGES,
  PRODUCT_IMAGE_TYPES,
  PRODUCT_IMAGES_BUCKET,
  type AdminProductImage,
  type AdminProductOption,
} from "../../constants";

const notifyError = (message: string) =>
  notifications.show({ color: "crimson", title: "No se pudo guardar", message });

const notifySaved = (message: string) =>
  notifications.show({ color: "emerald", title: "Listo", message });

export const ProductImagesManager = ({ products: initialProducts }: { products: AdminProductOption[] }) => {
  const [products, setProducts] = useState(initialProducts);
  const [productId, setProductId] = useState<string | null>(null);
  const [images, setImages] = useState<AdminProductImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selected = products.find((product) => product.id === productId);
  const isFull = images.length >= MAX_PRODUCT_IMAGES;

  const reload = async (id: string) => {
    const result = await fetchProductImages(id);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setImages(result.images);
    // Keep the "· N fotos" hint in the dropdown in sync
    setProducts((current) =>
      current.map((product) =>
        product.id === id ? { ...product, imageCount: result.images.length } : product,
      ),
    );
  };

  const selectProduct = async (id: string | null) => {
    setProductId(id);
    setImages([]);
    setError(null);
    if (!id) return;
    setLoading(true);
    await reload(id);
    setLoading(false);
  };

  const uploadFiles = async (files: File[]) => {
    if (!productId) return;
    const room = MAX_PRODUCT_IMAGES - images.length;
    const toUpload = files.slice(0, room);
    if (files.length > room) notifyError(`Solo caben ${room} fotos más en este producto.`);

    setBusy(true);
    const storage = createClient().storage.from(PRODUCT_IMAGES_BUCKET);
    try {
      for (const [index, file] of toUpload.entries()) {
        setUploadStatus(`Subiendo ${index + 1} de ${toUpload.length}…`);
        // 1 · permission from the server  2 · upload to Storage  3 · save in the product
        const permission = await requestProductImageUpload(productId, { type: file.type, size: file.size });
        if (!permission.ok) throw new Error(permission.error);
        const { error: uploadError } = await storage.uploadToSignedUrl(
          permission.path,
          permission.token,
          file,
          { contentType: file.type },
        );
        if (uploadError) throw new Error(`No se pudo subir "${file.name}".`);
        const saved = await saveProductImage(productId, permission.path);
        if (!saved.ok) throw new Error(saved.error);
      }
      notifySaved(toUpload.length === 1 ? "Foto agregada." : `${toUpload.length} fotos agregadas.`);
    } catch (uploadError) {
      notifyError(uploadError instanceof Error ? uploadError.message : "Intenta de nuevo.");
    } finally {
      await reload(productId);
      setUploadStatus(null);
      setBusy(false);
    }
  };

  const saveOrder = async (ordered: AdminProductImage[], message: string) => {
    if (!productId) return;
    const previous = images;
    setImages(ordered); // optimistic: move it now, undo if the server says no
    setBusy(true);
    const result = await reorderProductImages(productId, ordered.map((image) => image.id));
    setBusy(false);
    if (!result.ok) {
      setImages(previous);
      notifyError(result.error);
      return;
    }
    notifySaved(message);
  };

  const move = (index: number, direction: -1 | 1) => {
    const ordered = [...images];
    [ordered[index], ordered[index + direction]] = [ordered[index + direction], ordered[index]];
    saveOrder(ordered, "Orden actualizado.");
  };

  const makeCover = (index: number) => {
    const ordered = [images[index], ...images.filter((_, i) => i !== index)];
    saveOrder(ordered, "Portada actualizada.");
  };

  const confirmDelete = (image: AdminProductImage) =>
    modals.openConfirmModal({
      title: "¿Eliminar esta foto?",
      children: <Text size="sm">Se quitará del producto y de la tienda. No se puede deshacer.</Text>,
      labels: { confirm: "Eliminar", cancel: "Cancelar" },
      confirmProps: { color: "crimson" },
      onConfirm: async () => {
        if (!productId) return;
        setBusy(true);
        const result = await removeProductImage(image.id);
        await reload(productId);
        setBusy(false);
        if (result.ok) notifySaved("Foto eliminada.");
        else notifyError(result.error);
      },
    });

  return (
    <Stack gap="lg">
      <Select
        label="Producto"
        placeholder="Busca por nombre: cuaderno, lapicero, foamy…"
        searchable
        clearable
        limit={60}
        nothingFoundMessage="No hay productos con ese nombre"
        data={products.map((product) => ({
          value: product.id,
          label: product.name,
        }))}
        renderOption={({ option }) => {
          const count = products.find((product) => product.id === option.value)?.imageCount ?? 0;
          return (
            <Group justify="space-between" wrap="nowrap" className="w-full">
              <Text size="sm" truncate="end">
                {option.label}
              </Text>
              <Text fz={11} c={count === 0 ? "crimson" : "dimmed"} className="shrink-0">
                {count} {count === 1 ? "foto" : "fotos"}
              </Text>
            </Group>
          );
        }}
        value={productId}
        onChange={selectProduct}
        disabled={busy}
      />

      {error && (
        <Alert color="crimson" variant="light" icon={<IconAlertCircle size={18} />}>
          {error}
        </Alert>
      )}

      {loading && (
        <Group justify="center" className="py-10">
          <Loader color="navy" />
        </Group>
      )}

      {selected && !loading && (
        <Stack gap="md">
          <Group justify="space-between">
            <Text fw={700} className="text-primary">
              Fotos de {selected.name}
            </Text>
            <Text fz={12} c="dimmed">
              {images.length} de {MAX_PRODUCT_IMAGES}
            </Text>
          </Group>

          {images.length === 0 ? (
            <Text size="sm" c="dimmed">
              Este producto todavía no tiene fotos. La primera que subas será la portada.
            </Text>
          ) : (
            <SimpleGrid cols={{ base: 2, sm: 3 }} spacing="sm">
              {images.map((image, index) => (
                <Card key={image.id} radius="lg" padding={0} className="border border-outline-variant/30">
                  <div className="relative aspect-square bg-surface-container-low">
                    <Image src={image.url} alt="" fill sizes="(min-width: 640px) 33vw, 50vw" className="object-cover" />
                    {index === 0 && (
                      <Badge color="navy.9" size="sm" radius="sm" className="absolute left-2 top-2">
                        Portada
                      </Badge>
                    )}
                  </div>
                  <Group justify="space-between" gap={2} wrap="nowrap" className="p-1.5">
                    <Group gap={2} wrap="nowrap">
                      <Tooltip label="Mover antes">
                        <ActionIcon
                          variant="subtle"
                          color="navy"
                          aria-label="Mover antes"
                          disabled={busy || index === 0}
                          onClick={() => move(index, -1)}
                        >
                          <IconArrowLeft size={16} />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label="Mover después">
                        <ActionIcon
                          variant="subtle"
                          color="navy"
                          aria-label="Mover después"
                          disabled={busy || index === images.length - 1}
                          onClick={() => move(index, 1)}
                        >
                          <IconArrowRight size={16} />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                    <Group gap={2} wrap="nowrap">
                      <Tooltip label="Hacer portada">
                        <ActionIcon
                          variant="subtle"
                          color="amber"
                          aria-label="Hacer portada"
                          disabled={busy || index === 0}
                          onClick={() => makeCover(index)}
                        >
                          <IconStar size={16} />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label="Eliminar">
                        <ActionIcon
                          variant="subtle"
                          color="crimson"
                          aria-label="Eliminar foto"
                          disabled={busy}
                          onClick={() => confirmDelete(image)}
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                  </Group>
                </Card>
              ))}
            </SimpleGrid>
          )}

          <Dropzone
            onDrop={uploadFiles}
            onReject={() => notifyError("Solo fotos JPG, PNG o WebP de hasta 8 MB.")}
            accept={PRODUCT_IMAGE_TYPES}
            maxSize={MAX_PRODUCT_IMAGE_SIZE}
            disabled={busy || isFull}
            loading={busy && uploadStatus !== null}
            radius="lg"
            className="border-outline-variant bg-surface-container-low"
          >
            <Stack align="center" gap={4} className="pointer-events-none py-4" ta="center">
              <IconPhotoPlus size={34} stroke={1.5} className="text-secondary" />
              <Text size="sm" fw={600} className="text-primary">
                {isFull
                  ? `Ya tiene ${MAX_PRODUCT_IMAGES} fotos (elimina una para agregar otra)`
                  : "Toca para elegir o arrastra las fotos"}
              </Text>
              <Text fz={12} c="dimmed">
                {uploadStatus ?? "JPG, PNG o WebP · hasta 8 MB cada una"}
              </Text>
            </Stack>
          </Dropzone>
        </Stack>
      )}
    </Stack>
  );
};

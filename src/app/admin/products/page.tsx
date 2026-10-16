import { Suspense } from "react";
import { Loader, Stack, Text, Title } from "@mantine/core";
import { AdminHeader } from "@/features/admin/components/AdminHeader";
import { ProductImagesManager } from "@/features/admin/components/ProductImagesManager";
import { requireAdmin } from "@/features/admin/services/auth";
import { listProducts } from "@/features/admin/services/product-images";

const AdminProductsContent = async () => {
  const admin = await requireAdmin();
  const products = await listProducts();

  return (
    <>
      <AdminHeader email={admin.email} />
      <div className="mx-auto w-full max-w-3xl px-5 py-6">
        <Stack gap="lg">
          <Stack gap={4}>
            <Title order={1} fz={22} className="text-primary">
              Fotos de productos
            </Title>
            <Text size="sm" c="dimmed">
              Elige un producto, sube hasta 5 fotos y ordénalas. La primera es la portada que se
              ve en el catálogo. Los cambios aparecen en la tienda al instante.
            </Text>
          </Stack>
          <ProductImagesManager products={products} />
        </Stack>
      </div>
    </>
  );
};

export default function AdminProductsPage() {
  return (
    // Session check and data are per-request: stream them inside Suspense
    <Suspense
      fallback={
        <Stack align="center" className="py-20">
          <Loader color="navy" />
        </Stack>
      }
    >
      <AdminProductsContent />
    </Suspense>
  );
}

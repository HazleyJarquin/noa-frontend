import type { Metadata } from "next";
import { DesktopHeader } from "@/shared/components/DesktopHeader";
import { Suspense } from "react";
import { Skeleton, SimpleGrid, Stack } from "@mantine/core";
import { Footer } from "@/shared/components";
import { PageHeader } from "@/shared/components/PageHeader";
import { CartSummaryBar } from "@/features/cart/components";
import { getCategories } from "@/features/categories/services";
import { ProductBrowser } from "@/features/products/components";
import { getAllProducts } from "@/features/products/services";

export const metadata: Metadata = {
  title: "Todos los productos | NOA Librería",
  description:
    "Catálogo completo de útiles escolares, papelería, arte y oficina con precios en córdobas.",
};

const BrowserFallback = () => (
  <Stack gap="sm">
    <Skeleton height={28} width="60%" />
    <Skeleton height={36} radius="md" />
    <SimpleGrid cols={2} spacing="sm">
      {Array.from({ length: 4 }, (_, index) => (
        <Skeleton key={index} height={270} radius="lg" />
      ))}
    </SimpleGrid>
  </Stack>
);

export default async function ProductsPage() {
  const [products, categories] = await Promise.all([
    getAllProducts(),
    getCategories(),
  ]);

  return (
    // pb-24 keeps the footer clear of the fixed cart bar
    <div className="min-h-screen w-full bg-white flex flex-col gap-5 pb-24">
      <DesktopHeader />
      <PageHeader subtitle="Catálogo" />

      <div className="px-5 mx-auto w-full max-w-7xl lg:px-8">
        {/* ProductBrowser reads ?categoria= with useSearchParams, which needs a Suspense boundary */}
        <Suspense fallback={<BrowserFallback />}>
          <ProductBrowser products={products} categories={categories} />
        </Suspense>
      </div>

      <Footer />

      <CartSummaryBar />
    </div>
  );
}

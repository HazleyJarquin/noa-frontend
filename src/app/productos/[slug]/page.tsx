import type { Metadata } from "next";
import { DesktopHeader } from "@/shared/components/DesktopHeader";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Breadcrumbs } from "@mantine/core";
import { IconChevronRight } from "@tabler/icons-react";
import { Footer } from "@/shared/components";
import { AnchorLink } from "@/shared/components/AnchorLink";
import { productInfoTabsFlag, resolveFlag } from "@/shared/flags";
import { getCategoryHref } from "@/features/categories/constants";
import type { ProductDetail } from "@/features/products/constants";
import {
  ProductInfoTabs,
  ProductPurchase,
  RecommendedProducts,
} from "@/features/products/components";
import {
  getProductBySlug,
  getProductSlugs,
  getRecommendedProducts,
} from "@/features/products/services";

// Prerender every product page at build time
export const generateStaticParams = async () => {
  const slugs = await getProductSlugs();
  return slugs.map((slug) => ({ slug }));
};

export const generateMetadata = async ({
  params,
}: PageProps<"/productos/[slug]">): Promise<Metadata> => {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};

  return {
    title: `${product.name} | NOA Librería`,
    description: product.shortDescription ?? product.description[0],
    openGraph: { images: product.image ? [product.image] : [] },
  };
};

// GrowthBook flag "product-info-tabs": Descripción / Especificaciones / Políticas de Entrega
const ProductInfoSection = async ({ product }: { product: ProductDetail }) => {
  const showTabs = await resolveFlag(productInfoTabsFlag);
  if (!showTabs) return null;

  return (
    <div className="px-5 mx-auto w-full max-w-7xl lg:px-8">
      <ProductInfoTabs product={product} />
    </div>
  );
};

export default async function ProductPage({ params }: PageProps<"/productos/[slug]">) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const recommended = await getRecommendedProducts(product.id);

  return (
    // pb-28 keeps the footer clear of the fixed purchase bar
    <div className="min-h-screen w-full bg-surface flex flex-col gap-8 pb-28">
      <DesktopHeader />
      <div className="flex flex-col gap-4 px-5 pt-4 mx-auto w-full max-w-7xl lg:px-8 lg:pt-6">
        <Breadcrumbs
          separator={<IconChevronRight size={12} />}
          separatorMargin={4}
          classNames={{ breadcrumb: "text-xs" }}
        >
          <AnchorLink href="/" c="dimmed">
            Inicio
          </AnchorLink>
          <AnchorLink
            href={getCategoryHref(product.categorySlug)}
            className="text-primary"
          >
            {product.category}
          </AnchorLink>
        </Breadcrumbs>

        <ProductPurchase product={product} />
      </div>

      {/* Flag reads cookies (dynamic): resolved inside Suspense so the page stays prerendered */}
      <Suspense fallback={null}>
        <ProductInfoSection product={product} />
      </Suspense>

      <div className="px-5 mx-auto w-full max-w-7xl lg:px-8">
        <RecommendedProducts products={recommended} />
      </div>

      <Footer />
    </div>
  );
}

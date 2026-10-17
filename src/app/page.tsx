import { IconCategory } from "@tabler/icons-react";
import { DesktopHeader } from "@/shared/components/DesktopHeader";
import { CategoryCard } from "@/features/categories/components";
import { Footer, Header, TrustBanner } from "@/shared/components";
import { SimpleGrid } from "@mantine/core";
import {
  getCategoryHref,
  getCategoryIcon,
} from "@/features/categories/constants";
import { getCategories } from "@/features/categories/services";
import { FeaturedCatalog } from "@/features/products/components";
import { getFeaturedProducts } from "@/features/products/services";
import { CartSummaryBar } from "@/features/cart/components";
import { ServicesShowcase } from "@/features/service-requests/components/ServicesShowcase";

export default async function Home() {
  const [categories, products] = await Promise.all([
    getCategories(),
    getFeaturedProducts(),
  ]);

  return (
    <div className="min-h-screen w-full bg-white flex flex-col gap-5 pb-24">
      <div className="flex flex-col">
        <TrustBanner />
        <Header />
      </div>

      <DesktopHeader />

      <div className="flex flex-col gap-3 px-5 mx-auto w-full max-w-7xl lg:px-8">
        <div className="flex items-center gap-1">
          <IconCategory size={20} />
          <p className="text-primary font-bold text-lg">Categorías Populares</p>
        </div>
        <SimpleGrid cols={{ base: 4, lg: 8 }} spacing="sm">
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              icon={getCategoryIcon(category.slug)}
              label={category.name}
              href={getCategoryHref(category.slug)}
            />
          ))}
        </SimpleGrid>
      </div>

      <div className="px-5 mx-auto w-full max-w-7xl lg:px-8">
        <ServicesShowcase />
      </div>

      <div className="px-5 mx-auto w-full max-w-7xl lg:px-8">
        <FeaturedCatalog products={products} categories={categories} />
      </div>

      <Footer />

      <CartSummaryBar />
    </div>
  );
}

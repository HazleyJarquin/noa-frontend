import { Group, ScrollArea, Stack, Text } from "@mantine/core";
import { AnchorLink } from "@/shared/components/AnchorLink";
import type { Product } from "../../constants";
import { RecommendedProductCard } from "../RecommendedProductCard";

type RecommendedProductsProps = {
  products: Product[];
};

export const RecommendedProducts = ({ products }: RecommendedProductsProps) => {
  if (products.length === 0) return null;

  return (
    <section className="flex flex-col gap-3">
      <Group justify="space-between" align="end">
        <Stack gap={0}>
          <Text component="h2" fz={18} fw={700} className="text-primary">
            Útiles recomendados
          </Text>
          <Text size="xs" c="dimmed">
            Combinan perfecto con este producto
          </Text>
        </Stack>
        <AnchorLink href="/productos" size="xs" fw={600} className="text-primary">
          Ver todos
        </AnchorLink>
      </Group>

      {/* Bleeds to the screen edge so cards scroll under the page padding */}
      <ScrollArea type="never" className="-mx-5">
        <Group gap="sm" wrap="nowrap" align="stretch" className="px-5">
          {products.map((product) => (
            <RecommendedProductCard key={product.id} product={product} />
          ))}
        </Group>
      </ScrollArea>
    </section>
  );
};

"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Button, Group, SimpleGrid, Text } from "@mantine/core";
import { IconArrowRight } from "@tabler/icons-react";
import type { Category } from "@/features/categories/constants";
import {
  ALL_CATEGORIES_FILTER,
  CATEGORY_SEARCH_PARAM,
  PRODUCTS_PAGE_HREF,
  type Product,
  type ProductSort,
} from "../../constants";
import { sortProducts } from "../../utils";
import { CategoryChips } from "../CategoryChips";
import { ProductCard } from "../ProductCard";
import { SortMenu } from "../SortMenu";

type FeaturedCatalogProps = {
  products: Product[];
  categories: Category[];
};

export const FeaturedCatalog = ({ products: allProducts, categories }: FeaturedCatalogProps) => {
  const [filter, setFilter] = useState<string>(ALL_CATEGORIES_FILTER);
  const [sort, setSort] = useState<ProductSort>("recomendados");

  const products = useMemo(() => {
    const filtered =
      filter === ALL_CATEGORIES_FILTER
        ? allProducts
        : allProducts.filter((product) => product.categorySlug === filter);
    return sortProducts(filtered, sort);
  }, [allProducts, filter, sort]);

  return (
    <section className="flex flex-col gap-3">
      <Group justify="space-between">
        <Text component="h2" fz={22} fw={700} className="text-primary">
          Catálogo Destacado
        </Text>
        <Text size="xs" fw={600} className="text-on-surface">
          {products.length} Productos
        </Text>
      </Group>

      <CategoryChips categories={categories} value={filter} onChange={setFilter} />

      <Group justify="space-between" wrap="nowrap">
        <Text fz={11} c="dimmed" className="whitespace-nowrap">
          Precios en Córdobas Netos (C$)
        </Text>
        <SortMenu value={sort} onChange={setSort} />
      </Group>

      {products.length > 0 ? (
        <SimpleGrid cols={2} spacing="sm">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </SimpleGrid>
      ) : (
        <Text size="sm" c="dimmed" ta="center" className="py-10">
          No hay productos destacados en esta categoría.
        </Text>
      )}

      <Button
        component={Link}
        // Keep the selected category when jumping to the full catalog
        href={
          filter === ALL_CATEGORIES_FILTER
            ? PRODUCTS_PAGE_HREF
            : `${PRODUCTS_PAGE_HREF}?${CATEGORY_SEARCH_PARAM}=${filter}`
        }
        variant="light"
        color="navy"
        radius="md"
        size="md"
        fullWidth
        rightSection={<IconArrowRight size={16} />}
      >
        Ver todos los productos
      </Button>
    </section>
  );
};

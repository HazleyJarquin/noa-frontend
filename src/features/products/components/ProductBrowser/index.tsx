"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import {
  Button,
  CloseButton,
  Group,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
} from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { IconSearch, IconSearchOff } from "@tabler/icons-react";
import type { Category } from "@/features/categories/constants";
import {
  ALL_CATEGORIES_FILTER,
  CATEGORY_SEARCH_PARAM,
  PRODUCTS_PAGE_SIZE,
  type Product,
  type ProductSort,
} from "../../constants";
import { normalizeSearch, sortProducts } from "../../utils";
import { CategoryChips } from "../CategoryChips";
import { ProductCard } from "../ProductCard";
import { SortMenu } from "../SortMenu";

type ProductBrowserProps = {
  products: Product[];
  categories: Category[];
};

export const ProductBrowser = ({ products: allProducts, categories }: ProductBrowserProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // The category lives in the URL so links like /productos?categoria=cuadernos work
  const categoryParam = searchParams.get(CATEGORY_SEARCH_PARAM);
  const category = categories.some((item) => item.slug === categoryParam)
    ? categoryParam!
    : ALL_CATEGORIES_FILTER;

  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 200);
  const [sort, setSort] = useState<ProductSort>("recomendados");
  const [visibleCount, setVisibleCount] = useState(PRODUCTS_PAGE_SIZE);

  const setCategory = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value === ALL_CATEGORIES_FILTER) params.delete(CATEGORY_SEARCH_PARAM);
    else params.set(CATEGORY_SEARCH_PARAM, value);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    setVisibleCount(PRODUCTS_PAGE_SIZE);
  };

  const products = useMemo(() => {
    const term = normalizeSearch(debouncedSearch);
    const filtered = allProducts.filter(
      (product) =>
        (category === ALL_CATEGORIES_FILTER || product.categorySlug === category) &&
        (!term || normalizeSearch(product.name).includes(term)),
    );
    return sortProducts(filtered, sort);
  }, [allProducts, category, debouncedSearch, sort]);

  const visibleProducts = products.slice(0, visibleCount);
  const remaining = products.length - visibleProducts.length;

  return (
    <section className="flex flex-col gap-3">
      <Group justify="space-between" align="end">
        <Text component="h1" fz={22} fw={700} className="text-primary">
          Todos los productos
        </Text>
        <Text size="xs" fw={600} className="text-on-surface">
          {products.length} Productos
        </Text>
      </Group>

      <TextInput
        value={search}
        onChange={(event) => {
          setSearch(event.currentTarget.value);
          setVisibleCount(PRODUCTS_PAGE_SIZE);
        }}
        placeholder="Buscar cuadernos, lapiceros, foamy…"
        aria-label="Buscar productos"
        leftSection={<IconSearch size={16} />}
        rightSection={
          search && (
            <CloseButton size="sm" aria-label="Limpiar búsqueda" onClick={() => setSearch("")} />
          )
        }
      />

      <CategoryChips categories={categories} value={category} onChange={setCategory} />

      <Group justify="space-between" wrap="nowrap">
        <Text fz={11} c="dimmed" className="whitespace-nowrap">
          Precios en Córdobas Netos (C$)
        </Text>
        <SortMenu value={sort} onChange={setSort} />
      </Group>

      {products.length > 0 ? (
        <>
          <SimpleGrid cols={2} spacing="sm">
            {visibleProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </SimpleGrid>

          {remaining > 0 && (
            <Button
              variant="light"
              color="navy"
              radius="md"
              size="md"
              fullWidth
              onClick={() => setVisibleCount((count) => count + PRODUCTS_PAGE_SIZE)}
            >
              Cargar más ({remaining} restantes)
            </Button>
          )}
        </>
      ) : (
        <Stack align="center" gap="xs" className="py-10" ta="center">
          <ThemeIcon variant="light" color="navy" radius="xl" size={56}>
            <IconSearchOff size={26} />
          </ThemeIcon>
          <Text fw={600} className="text-primary">
            No encontramos productos
          </Text>
          <Text size="sm" c="dimmed">
            Prueba con otra palabra o elige otra categoría.
          </Text>
        </Stack>
      )}
    </section>
  );
};

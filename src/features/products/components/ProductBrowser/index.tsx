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
import { ProductFilters, type PriceRange } from "../ProductFilters";
import { SortMenu } from "../SortMenu";

const SEARCH_PARAM = "q";
const NO_PRICE: PriceRange = { min: null, max: null };

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

  // The desktop header search lands here with ?q=…
  const queryParam = searchParams.get(SEARCH_PARAM) ?? "";
  const [search, setSearch] = useState(queryParam);
  const [syncedQuery, setSyncedQuery] = useState(queryParam);
  if (queryParam !== syncedQuery) {
    // New search from the header while already on this page (no effect: see "activity pauses effects")
    setSyncedQuery(queryParam);
    setSearch(queryParam);
  }

  const [debouncedSearch] = useDebouncedValue(search, 200);
  const [sort, setSort] = useState<ProductSort>("recomendados");
  const [price, setPrice] = useState<PriceRange>(NO_PRICE);
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PRODUCTS_PAGE_SIZE);

  const resetPage = () => setVisibleCount(PRODUCTS_PAGE_SIZE);

  const setCategory = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value === ALL_CATEGORIES_FILTER) params.delete(CATEGORY_SEARCH_PARAM);
    else params.set(CATEGORY_SEARCH_PARAM, value);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    resetPage();
  };

  // Everything except the category: used for the list and for the per-category counts
  const matchingOtherFilters = useMemo(() => {
    const term = normalizeSearch(debouncedSearch);
    return allProducts.filter(
      (product) =>
        (!term || normalizeSearch(product.name).includes(term)) &&
        (price.min === null || product.price >= price.min) &&
        (price.max === null || product.price <= price.max) &&
        (!onlyAvailable || product.inStock),
    );
  }, [allProducts, debouncedSearch, price, onlyAvailable]);

  const counts = useMemo(() => {
    const result: Record<string, number> = { [ALL_CATEGORIES_FILTER]: matchingOtherFilters.length };
    for (const product of matchingOtherFilters) {
      result[product.categorySlug] = (result[product.categorySlug] ?? 0) + 1;
    }
    return result;
  }, [matchingOtherFilters]);

  const products = useMemo(
    () =>
      sortProducts(
        category === ALL_CATEGORIES_FILTER
          ? matchingOtherFilters
          : matchingOtherFilters.filter((product) => product.categorySlug === category),
        sort,
      ),
    [matchingOtherFilters, category, sort],
  );

  const visibleProducts = products.slice(0, visibleCount);
  const remaining = products.length - visibleProducts.length;

  const clearFilters = () => {
    setPrice(NO_PRICE);
    setOnlyAvailable(false);
    setCategory(ALL_CATEGORIES_FILTER);
  };

  return (
    <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[260px_1fr] lg:items-start lg:gap-8">
      {/* Desktop sidebar */}
      <aside className="hidden lg:sticky lg:top-24 lg:block">
        <ProductFilters
          categories={categories}
          counts={counts}
          category={category}
          onCategoryChange={setCategory}
          price={price}
          onPriceChange={(value) => {
            setPrice(value);
            resetPage();
          }}
          onlyAvailable={onlyAvailable}
          onOnlyAvailableChange={(value) => {
            setOnlyAvailable(value);
            resetPage();
          }}
          onClear={clearFilters}
        />
      </aside>

      <section className="flex min-w-0 flex-col gap-3">
        <Group justify="space-between" align="end">
          <Text component="h1" fz={{ base: 22, lg: 28 }} fw={700} className="text-primary">
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
            resetPage();
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

        {/* Mobile: chips (desktop uses the sidebar) */}
        <div className="lg:hidden">
          <CategoryChips categories={categories} value={category} onChange={setCategory} />
        </div>

        <Group justify="space-between" wrap="nowrap">
          <Text fz={11} c="dimmed" className="whitespace-nowrap">
            Precios en Córdobas Netos (C$)
          </Text>
          <SortMenu value={sort} onChange={setSort} />
        </Group>

        {products.length > 0 ? (
          <>
            <SimpleGrid cols={{ base: 2, sm: 3, lg: 4 }} spacing="sm">
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
                className="lg:w-auto lg:self-center lg:px-10"
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
              Prueba con otra palabra o cambia los filtros.
            </Text>
          </Stack>
        )}
      </section>
    </div>
  );
};

"use client";

import { Button, Divider, Group, NumberInput, Paper, Radio, Stack, Switch, Text } from "@mantine/core";
import { IconAdjustmentsHorizontal } from "@tabler/icons-react";
import type { Category } from "@/features/categories/constants";
import { ALL_CATEGORIES_FILTER } from "../../constants";

export type PriceRange = { min: number | null; max: number | null };

type ProductFiltersProps = {
  categories: Category[];
  counts: Record<string, number>; // products per category slug (+ "todos")
  category: string;
  onCategoryChange: (slug: string) => void;
  price: PriceRange;
  onPriceChange: (price: PriceRange) => void;
  onlyAvailable: boolean;
  onOnlyAvailableChange: (value: boolean) => void;
  onClear: () => void;
};

const toPrice = (value: string | number) => (value === "" ? null : Number(value));

// Desktop sidebar of the catalog (the parent shows it only on lg)
export const ProductFilters = ({
  categories,
  counts,
  category,
  onCategoryChange,
  price,
  onPriceChange,
  onlyAvailable,
  onOnlyAvailableChange,
  onClear,
}: ProductFiltersProps) => {
  const hasFilters =
    category !== ALL_CATEGORIES_FILTER || price.min !== null || price.max !== null || onlyAvailable;

  const options = [
    { value: ALL_CATEGORIES_FILTER, label: "Todas" },
    ...categories.map((item) => ({ value: item.slug, label: item.name })),
  ];

  return (
    <Paper radius="lg" p="md" className="border border-outline-variant/30 bg-surface-container-lowest">
      <Stack gap="md">
        <Group justify="space-between">
          <Group gap={6}>
            <IconAdjustmentsHorizontal size={18} className="text-primary" />
            <Text fw={700} className="text-primary">
              Filtros
            </Text>
          </Group>
          {hasFilters && (
            <Button variant="subtle" color="navy" size="compact-xs" onClick={onClear}>
              Limpiar
            </Button>
          )}
        </Group>

        <Divider className="border-outline-variant/30" />

        <Radio.Group value={category} onChange={onCategoryChange} label="Categorías">
          <Stack gap={8} className="mt-2">
            {options.map((option) => (
              <Group key={option.value} justify="space-between" wrap="nowrap">
                <Radio value={option.value} label={option.label} color="navy.9" size="sm" />
                <Text fz={11} c="dimmed">
                  {counts[option.value] ?? 0}
                </Text>
              </Group>
            ))}
          </Stack>
        </Radio.Group>

        <Divider className="border-outline-variant/30" />

        <div>
          <Text size="sm" fw={500} className="mb-2">
            Precio (C$)
          </Text>
          <Group grow gap="xs">
            <NumberInput
              placeholder="Mín."
              aria-label="Precio mínimo"
              min={0}
              allowNegative={false}
              hideControls
              value={price.min ?? ""}
              onChange={(value) => onPriceChange({ ...price, min: toPrice(value) })}
            />
            <NumberInput
              placeholder="Máx."
              aria-label="Precio máximo"
              min={0}
              allowNegative={false}
              hideControls
              value={price.max ?? ""}
              onChange={(value) => onPriceChange({ ...price, max: toPrice(value) })}
            />
          </Group>
        </div>

        <Divider className="border-outline-variant/30" />

        <Switch
          label="Solo productos disponibles"
          color="navy.9"
          checked={onlyAvailable}
          onChange={(event) => onOnlyAvailableChange(event.currentTarget.checked)}
        />
      </Stack>
    </Paper>
  );
};

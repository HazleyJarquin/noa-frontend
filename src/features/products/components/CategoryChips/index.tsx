"use client";

import { Chip, Group, ScrollArea } from "@mantine/core";
import type { Category } from "@/features/categories/constants";
import { ALL_CATEGORIES_FILTER } from "../../constants";

type CategoryChipsProps = {
  categories: Category[];
  value: string;
  onChange: (value: string) => void;
};

export const CategoryChips = ({ categories, value, onChange }: CategoryChipsProps) => {
  const options = [
    { value: ALL_CATEGORIES_FILTER, label: "Todos" },
    ...categories.map((category) => ({ value: category.slug, label: category.name })),
  ];

  return (
    // Bleeds to the screen edge so chips scroll under the page padding
    <ScrollArea type="never" className="-mx-5">
      <Chip.Group value={value} onChange={onChange}>
        <Group gap="xs" wrap="nowrap" className="px-5">
          {options.map((option) => (
            <Chip
              key={option.value}
              value={option.value}
              size="sm"
              classNames={{
                iconWrapper: "hidden",
                label:
                  "px-4 font-medium bg-surface-container-lowest border border-outline-variant/50 text-on-surface data-checked:bg-primary data-checked:border-primary data-checked:text-on-primary",
              }}
            >
              {option.label}
            </Chip>
          ))}
        </Group>
      </Chip.Group>
    </ScrollArea>
  );
};

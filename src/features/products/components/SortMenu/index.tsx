"use client";

import { Button, Menu } from "@mantine/core";
import { IconArrowsSort, IconCheck, IconChevronDown } from "@tabler/icons-react";
import { PRODUCT_SORTS, type ProductSort } from "../../constants";

type SortMenuProps = {
  value: ProductSort;
  onChange: (value: ProductSort) => void;
};

export const SortMenu = ({ value, onChange }: SortMenuProps) => {
  const label = PRODUCT_SORTS.find((option) => option.value === value)?.label;

  return (
    <Menu position="bottom-end" shadow="md" radius="md">
      <Menu.Target>
        <Button
          variant="subtle"
          color="navy.9"
          size="compact-xs"
          className="shrink-0 px-1"
          leftSection={<IconArrowsSort size={12} />}
          rightSection={<IconChevronDown size={12} />}
        >
          {label}
        </Button>
      </Menu.Target>
      <Menu.Dropdown>
        {PRODUCT_SORTS.map((option) => (
          <Menu.Item
            key={option.value}
            onClick={() => onChange(option.value)}
            rightSection={option.value === value && <IconCheck size={14} />}
          >
            {option.label}
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  );
};

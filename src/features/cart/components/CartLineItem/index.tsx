"use client";

import Image from "next/image";
import Link from "next/link";
import { ActionIcon, Group, Paper, Text } from "@mantine/core";
import { IconPhoto, IconTrash } from "@tabler/icons-react";
import { QuantityStepper } from "@/shared/components/QuantityStepper";
import { formatCordobas } from "@/shared/lib/currency";
import { getProductHref } from "@/features/products/constants";
import { useCartStore, type CartItem } from "../../store";

type CartLineItemProps = {
  item: CartItem;
};

export const CartLineItem = ({ item }: CartLineItemProps) => {
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const href = getProductHref(item.slug);

  return (
    <Paper
      radius="lg"
      p="sm"
      className="flex gap-3 bg-surface-container-lowest border border-outline-variant/30"
    >
      <Link
        href={href}
        className="relative size-18 shrink-0 overflow-hidden rounded-md bg-surface-container-low"
      >
        {item.image ? (
          <Image src={item.image} alt={item.name} fill sizes="72px" className="object-cover" />
        ) : (
          <div className="flex size-full items-center justify-center">
            <IconPhoto size={24} stroke={1.5} className="text-outline-variant" />
          </div>
        )}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col">
        <Group justify="space-between" align="start" wrap="nowrap" gap="xs">
          <div className="min-w-0">
            {item.category && (
              <Text fz={10} fw={700} tt="uppercase" className="text-secondary tracking-wide">
                {item.category}
              </Text>
            )}
            <Text
              component={Link}
              href={href}
              size="sm"
              fw={600}
              truncate="end"
              title={item.name}
              className="block text-on-surface"
            >
              {item.name}
            </Text>
            <Text fz={11} c="dimmed" truncate="end">
              {item.quantity} × {formatCordobas(item.price)}
              {item.variantLabel && ` · ${item.variantLabel}`}
            </Text>
          </div>

          <ActionIcon
            variant="subtle"
            color="gray"
            size="sm"
            aria-label={`Quitar ${item.name} del carrito`}
            onClick={() => removeItem(item.variantId)}
          >
            <IconTrash size={16} />
          </ActionIcon>
        </Group>

        <Group justify="space-between" align="center" wrap="nowrap" className="mt-auto pt-1">
          <Text fz={18} fw={700} className="text-primary">
            {formatCordobas(item.price * item.quantity)}
          </Text>
          <QuantityStepper
            value={item.quantity}
            onChange={(quantity) => updateQuantity(item.variantId, quantity)}
            max={item.stock}
          />
        </Group>
      </div>
    </Paper>
  );
};

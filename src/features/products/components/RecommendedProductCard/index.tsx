"use client";

import Image from "next/image";
import Link from "next/link";
import { ActionIcon, Badge, Button, Card, Group, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconChevronRight, IconPhoto, IconPlus } from "@tabler/icons-react";
import { formatCordobas } from "@/shared/lib/currency";
import { selectQuantityInCart, useCartStore } from "@/features/cart/store";
import { getProductHref, type Product } from "../../constants";

type RecommendedProductCardProps = {
  product: Product;
  // "icon": small "+" next to the price (product detail); "button": full-width "+ Agregar" (cart)
  action?: "icon" | "button";
};

export const RecommendedProductCard = ({
  product,
  action = "icon",
}: RecommendedProductCardProps) => {
  const addItem = useCartStore((state) => state.addItem);
  const variant = product.defaultVariant;
  const inCart = useCartStore(selectQuantityInCart(variant?.id));
  const href = getProductHref(product.slug);
  const canAdd = !!variant && variant.stock - inCart > 0;

  const handleAdd = () => {
    if (!variant) return;
    addItem(
      {
        variantId: variant.id,
        productId: product.id,
        slug: product.slug,
        name: product.name,
        category: product.category,
        price: product.price,
        image: product.image,
        stock: variant.stock,
      },
      1,
    );
    notifications.show({
      color: "emerald",
      title: "Agregado al carrito",
      message: `1 × ${product.name}`,
    });
  };

  return (
    <Card
      radius="lg"
      padding={0}
      className="w-40 shrink-0 bg-surface-container-lowest border border-outline-variant/30"
    >
      <Link href={href} className="relative block aspect-square bg-surface-container-low">
        {product.image ? (
          <Image src={product.image} alt={product.name} fill sizes="160px" className="object-cover" />
        ) : (
          <div className="flex size-full items-center justify-center">
            <IconPhoto size={28} stroke={1.5} className="text-outline-variant" />
          </div>
        )}
        {product.badgeLabel && (
          <Badge
            size="xs"
            radius="sm"
            tt="none"
            className="absolute right-2 top-2 bg-primary-fixed text-primary"
          >
            {product.badgeLabel}
          </Badge>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-0.5 p-2.5">
        <Text fz={10} fw={700} tt="uppercase" className="text-secondary tracking-wide">
          {product.category}
        </Text>
        <Text
          component={Link}
          href={href}
          size="sm"
          fw={500}
          lh={1.3}
          truncate="end"
          title={product.name}
          className="text-on-surface"
        >
          {product.name}
        </Text>

        {action === "button" ? (
          <>
            <Text fw={700} className="text-primary">
              {formatCordobas(product.price)}
            </Text>
            {product.hasOptions ? (
              <Button
                component={Link}
                href={href}
                variant="light"
                color="navy"
                size="compact-xs"
                radius="md"
                className="mt-1"
              >
                Ver opciones
              </Button>
            ) : (
              <Button
                variant="light"
                color="navy"
                size="compact-xs"
                radius="md"
                className="mt-1"
                leftSection={<IconPlus size={12} />}
                disabled={!canAdd}
                onClick={handleAdd}
              >
                Agregar
              </Button>
            )}
          </>
        ) : (
          <Group justify="space-between" align="end" wrap="nowrap" className="mt-1">
            <div>
              <Text fw={700} className="text-primary">
                {formatCordobas(product.price)}
              </Text>
              <Text fz={10} fw={600} className={product.inStock ? "text-success" : "text-error"}>
                {product.inStock ? "En Stock" : "Agotado"}
              </Text>
            </div>
  
            {product.hasOptions ? (
              <ActionIcon
                component={Link}
                href={href}
                color="navy.9"
                radius="md"
                size={28}
                aria-label={`Ver opciones de ${product.name}`}
              >
                <IconChevronRight size={16} />
              </ActionIcon>
            ) : (
              <ActionIcon
                color="navy.9"
                radius="md"
                size={28}
                aria-label={`Agregar ${product.name} al carrito`}
                disabled={!canAdd}
                onClick={handleAdd}
              >
                <IconPlus size={16} />
              </ActionIcon>
            )}
          </Group>
        )}
      </div>
    </Card>
  );
};

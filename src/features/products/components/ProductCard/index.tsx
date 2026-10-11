"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Badge, Button, Card, Divider, Group, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconAdjustmentsHorizontal, IconPhoto, IconShoppingCartPlus } from "@tabler/icons-react";
import { QuantityStepper } from "@/shared/components/QuantityStepper";
import { formatCordobas } from "@/shared/lib/currency";
import { selectQuantityInCart, useCartStore } from "@/features/cart/store";
import { getProductHref, type Product } from "../../constants";

type ProductCardProps = {
  product: Product;
};

export const ProductCard = ({ product }: ProductCardProps) => {
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((state) => state.addItem);
  const variant = product.defaultVariant;
  const inCart = useCartStore(selectQuantityInCart(variant?.id));
  const href = getProductHref(product.slug);

  // What can still be added, after what's already in the cart
  const available = Math.max((variant?.stock ?? 0) - inCart, 0);
  const canAdd = available > 0;

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
      Math.min(quantity, available),
    );
    setQuantity(1);
    notifications.show({
      color: "emerald",
      title: "Agregado al carrito",
      message: `${quantity} × ${product.name}`,
    });
  };

  return (
    <Card
      radius="lg"
      padding={0}
      className="h-full bg-surface-container-lowest border border-outline-variant/30"
    >
      <Link href={href} className="relative block aspect-6/5 bg-surface-container-low">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="50vw"
            className="object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center">
            <IconPhoto size={32} stroke={1.5} className="text-outline-variant" />
          </div>
        )}

        <Group justify="space-between" className="absolute inset-x-2 top-2">
          {product.inStock ? (
            <Badge
              size="sm"
              radius="sm"
              className="bg-success-container text-success normal-case"
              leftSection={<span className="size-1.5 rounded-full bg-success" />}
            >
              Stock
            </Badge>
          ) : (
            <Badge size="sm" radius="sm" color="crimson" variant="light">
              Agotado
            </Badge>
          )}

          {product.onSale && (
            <Badge size="sm" radius="sm" color="navy.9">
              Oferta
            </Badge>
          )}
        </Group>
      </Link>

      <div className="flex flex-1 flex-col gap-1 p-2">
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

        <Group gap={4} align="baseline" className="mb-2">
          <Text fz={20} fw={700} className="text-primary">
            {formatCordobas(product.price)}
          </Text>
          {product.previousPrice && (
            <Text fz={10} td="line-through" c="dimmed">
              {formatCordobas(product.previousPrice)}
            </Text>
          )}
        </Group>

        <Divider className="mt-auto border-outline-variant/30" />

        {product.hasOptions ? (
          <Button
            component={Link}
            href={href}
            // "light" needs the color name without a shade, or bg and text both become navy.9
            color="navy"
            variant="light"
            size="compact-xs"
            radius="md"
            fz={11}
            className="mt-2 h-6"
            leftSection={<IconAdjustmentsHorizontal size={12} />}
          >
            Elegir opciones
          </Button>
        ) : (
          <Group gap={4} wrap="nowrap" className="pt-2">
            <QuantityStepper
              value={Math.min(quantity, Math.max(available, 1))}
              onChange={setQuantity}
              max={available}
              disabled={!canAdd}
            />
            <Button
              color="navy.9"
              size="compact-xs"
              radius="md"
              fz={11}
              className="h-6 flex-1 px-1"
              classNames={{ section: "me-1" }}
              leftSection={<IconShoppingCartPlus size={12} />}
              disabled={!canAdd}
              onClick={handleAdd}
            >
              Agregar
            </Button>
          </Group>
        )}
      </div>
    </Card>
  );
};

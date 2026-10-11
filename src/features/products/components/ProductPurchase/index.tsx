"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  Affix,
  Badge,
  Button,
  Chip,
  ColorSwatch,
  Group,
  Paper,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconShoppingBag } from "@tabler/icons-react";
import { QuantityStepper } from "@/shared/components/QuantityStepper";
import { formatCordobas } from "@/shared/lib/currency";
import { selectQuantityInCart, useCartStore } from "@/features/cart/store";
import type { ProductDetail, ProductVariant } from "../../constants";
import { ProductGallery } from "../ProductGallery";

const LOW_STOCK_THRESHOLD = 5;

type Selection = Record<string, string>; // optionId → valueId

const findVariant = (variants: ProductVariant[], selection: Selection) =>
  variants.find((variant) =>
    Object.values(selection).every((valueId) => variant.optionValueIds.includes(valueId)),
  );

// Start on the first variant with stock, so the page never opens on a sold-out combination
const getInitialSelection = (product: ProductDetail): Selection => {
  const variant =
    product.variants.find((item) => item.stock > 0) ?? product.variants[0];
  return Object.fromEntries(
    product.options.map((option) => [
      option.id,
      option.values.find((value) => variant?.optionValueIds.includes(value.id))?.id ??
        option.values[0]?.id,
    ]),
  );
};

type ProductPurchaseProps = {
  product: ProductDetail;
};

export const ProductPurchase = ({ product }: ProductPurchaseProps) => {
  const router = useRouter();
  const [selection, setSelection] = useState(() => getInitialSelection(product));
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((state) => state.addItem);

  const variant = useMemo(
    () => findVariant(product.variants, selection),
    [product.variants, selection],
  );
  const inCart = useCartStore(selectQuantityInCart(variant?.id));

  const price = variant?.price ?? product.price;
  const stock = variant?.stock ?? 0;
  const available = Math.max(stock - inCart, 0);
  const canAdd = available > 0;
  const selectedQuantity = Math.min(quantity, Math.max(available, 1));

  const savings = product.previousPrice ? product.previousPrice - price : 0;
  const discount = product.previousPrice
    ? Math.round((savings / product.previousPrice) * 100)
    : 0;

  // A value is available if, combined with the rest of the selection, some variant has stock
  const isValueAvailable = (optionId: string, valueId: string) =>
    (findVariant(product.variants, { ...selection, [optionId]: valueId })?.stock ?? 0) > 0;

  const selectValue = (optionId: string, valueId: string) => {
    setSelection((current) => ({ ...current, [optionId]: valueId }));
    setQuantity(1);
  };

  const variantLabel = product.options
    .map((option) => option.values.find((value) => value.id === selection[option.id])?.label)
    .filter(Boolean)
    .join(" · ");

  const addToCart = () => {
    if (!variant || !canAdd) return false;
    addItem(
      {
        variantId: variant.id,
        productId: product.id,
        slug: product.slug,
        name: product.name,
        category: product.category,
        variantLabel: variantLabel || undefined,
        price,
        image: product.image,
        stock: variant.stock,
      },
      selectedQuantity,
    );
    setQuantity(1);
    return true;
  };

  const handleAdd = () => {
    if (!addToCart()) return;
    notifications.show({
      color: "emerald",
      title: "Agregado al carrito",
      message: `${selectedQuantity} × ${product.name}${variantLabel ? ` (${variantLabel})` : ""}`,
    });
  };

  const handleBuyNow = () => {
    if (addToCart()) router.push("/carrito");
  };

  const stockBadge =
    stock === 0 ? (
      <Badge size="sm" radius="sm" color="crimson" variant="light">
        Agotado
      </Badge>
    ) : stock <= LOW_STOCK_THRESHOLD ? (
      <Badge size="sm" radius="sm" color="amber" variant="light" tt="none">
        Últimas {stock} unidades
      </Badge>
    ) : (
      <Badge
        size="sm"
        radius="sm"
        tt="none"
        className="bg-success-container text-success"
        leftSection={<span className="size-1.5 rounded-full bg-success" />}
      >
        En Stock Managua
      </Badge>
    );

  return (
    <>
      <ProductGallery
        images={product.images}
        overlay={
          <>
            {discount > 0 ? (
              <Badge size="sm" radius="sm" color="navy.9">
                -{discount}%
              </Badge>
            ) : (
              <span />
            )}
            {stockBadge}
          </>
        }
      />

      <Stack gap={4}>
        <Title order={1} fz={24} lh={1.2} className="text-primary">
          {product.name}
        </Title>
        {product.shortDescription && (
          <Text size="xs" c="dimmed">
            {product.shortDescription}
          </Text>
        )}
        {variant && (
          <Text fz={10} c="dimmed">
            SKU: {variant.sku}
          </Text>
        )}
      </Stack>

      <Group gap="xs" align="center">
        <Text fz={28} fw={700} className="text-primary">
          {formatCordobas(price)}
        </Text>
        {product.previousPrice && savings > 0 && (
          <>
            <Text size="sm" td="line-through" c="dimmed">
              {formatCordobas(product.previousPrice)}
            </Text>
            <Badge size="sm" radius="sm" tt="none" className="bg-primary-fixed text-primary">
              Ahorras {formatCordobas(savings)}
            </Badge>
          </>
        )}
      </Group>

      {product.options.map((option) => {
        const selected = option.values.find((value) => value.id === selection[option.id]);

        return (
          <Stack key={option.id} gap="xs">
            <Group justify="space-between">
              <Text size="sm" fw={600} className="text-on-surface">
                {option.name}:
              </Text>
              {option.kind === "color" && (
                <Text size="xs" className="text-secondary">
                  {selected?.label}
                </Text>
              )}
            </Group>

            {option.kind === "color" ? (
              <Group gap="sm">
                {option.values.map((value) => {
                  const isSelected = value.id === selection[option.id];
                  const isAvailable = isValueAvailable(option.id, value.id);
                  return (
                    <ColorSwatch
                      key={value.id}
                      component="button"
                      type="button"
                      color={value.colorHex ?? "#CCCCCC"}
                      size={32}
                      aria-label={value.label}
                      aria-pressed={isSelected}
                      title={isAvailable ? value.label : `${value.label} (agotado)`}
                      onClick={() => selectValue(option.id, value.id)}
                      className={`text-white ring-offset-2 ${isSelected ? "ring-2 ring-primary" : ""} ${isAvailable ? "" : "opacity-35"}`}
                    >
                      {isSelected && <IconCheck size={16} stroke={3} />}
                    </ColorSwatch>
                  );
                })}
              </Group>
            ) : (
              <Chip.Group
                value={selection[option.id]}
                onChange={(valueId) => selectValue(option.id, valueId)}
              >
                <Group gap="xs">
                  {option.values.map((value) => (
                    <Chip
                      key={value.id}
                      value={value.id}
                      radius="md"
                      size="sm"
                      disabled={!isValueAvailable(option.id, value.id)}
                      classNames={{
                        iconWrapper: "hidden",
                        label:
                          "px-4 font-medium bg-surface-container-lowest border border-outline-variant/50 text-on-surface data-checked:bg-primary data-checked:border-primary data-checked:text-on-primary data-disabled:opacity-40 data-disabled:line-through",
                      }}
                    >
                      {value.label}
                    </Chip>
                  ))}
                </Group>
              </Chip.Group>
            )}
          </Stack>
        );
      })}

      <Group justify="space-between">
        <Text size="sm" fw={600} className="text-on-surface">
          Cantidad:
        </Text>
        <QuantityStepper
          value={selectedQuantity}
          onChange={setQuantity}
          max={available}
          disabled={!canAdd}
        />
      </Group>

      <Stack gap="xs">
        <Button
          color="navy.9"
          radius="md"
          size="md"
          fullWidth
          leftSection={<IconShoppingBag size={18} />}
          disabled={!canAdd}
          onClick={handleAdd}
        >
          {stock === 0 ? "Agotado" : canAdd ? "Agregar al carrito" : "Ya tienes todo el stock"}
        </Button>
        <Button
          variant="outline"
          color="navy.9"
          radius="md"
          size="md"
          fullWidth
          disabled={!canAdd}
          onClick={handleBuyNow}
        >
          Comprar ahora
        </Button>
      </Stack>

      <Affix position={{ bottom: 0, left: 0, right: 0 }}>
        <Paper
          radius={0}
          className="flex items-center justify-between gap-3 px-5 py-3 bg-surface-container-lowest border-t border-outline-variant/30 shadow-[0_-4px_16px_rgba(19,20,81,0.06)]"
        >
          <div className="whitespace-nowrap">
            <Text fz={10} fw={700} tt="uppercase" className="text-on-surface tracking-wide">
              Total estimado
            </Text>
            <Group gap={4} align="baseline">
              <Text fz={22} fw={700} className="text-primary">
                {formatCordobas(price * selectedQuantity)}
              </Text>
              <Text fz={10} c="dimmed">
                ({selectedQuantity} ud)
              </Text>
            </Group>
          </div>

          <Button
            color="navy.9"
            radius="md"
            className="h-11 min-w-0 flex-1"
            leftSection={<IconShoppingBag size={16} />}
            disabled={!canAdd}
            onClick={handleAdd}
          >
            Agregar
          </Button>
        </Paper>
      </Affix>
    </>
  );
};

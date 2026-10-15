"use client";

import Link from "next/link";
import { Suspense, use } from "react";
import {
  Affix,
  Badge,
  Button,
  Group,
  Paper,
  ScrollArea,
  Skeleton,
  Stack,
  Text,
  ThemeIcon,
} from "@mantine/core";
import { useDisclosure, useMounted } from "@mantine/hooks";
import {
  IconCreditCard,
  IconShieldCheck,
  IconShoppingBag,
} from "@tabler/icons-react";
import { AnchorLink } from "@/shared/components/AnchorLink";
import { formatCordobas } from "@/shared/lib/currency";
import type { Product } from "@/features/products/constants";
import { RecommendedProductCard } from "@/features/products/components/RecommendedProductCard";
import { CheckoutDrawer } from "@/features/checkout/components/CheckoutDrawer";
import { PAYMENT_PROVIDER_LABEL } from "../../constants";
import { selectSubtotal, useCartStore } from "../../store";
import { CartHeader } from "../CartHeader";
import { CartLineItem } from "../CartLineItem";
import { OrderSummary } from "../OrderSummary";
import { SchoolListCard } from "../SchoolListCard";

type CartViewProps = {
  suggestions: Product[];
  // GrowthBook flag "school-list-upload", resolved inside Suspense
  showSchoolList: Promise<boolean>;
};

const SchoolListSlot = ({ show }: { show: Promise<boolean> }) =>
  use(show) ? (
    <div className="px-5">
      <SchoolListCard />
    </div>
  ) : null;

export const CartView = ({ suggestions, showSchoolList }: CartViewProps) => {
  const items = useCartStore((state) => state.items);
  const subtotal = useCartStore(selectSubtotal);
  // The cart lives in localStorage: wait for mount so server and client HTML match
  const mounted = useMounted();
  const [checkoutOpened, { open: openCheckout, close: closeCheckout }] = useDisclosure(false);

  // No delivery for now: the total is the subtotal
  const total = subtotal;
  const unitCount = items.reduce((count, item) => count + item.quantity, 0);

  const productIdsInCart = new Set(items.map((item) => item.productId));
  const availableSuggestions = suggestions.filter(
    (product) => !productIdsInCart.has(product.id),
  );

  return (
    <div className="flex flex-col gap-5">
      <CartHeader />

      {!mounted ? (
        <Stack gap="sm" className="px-5">
          <Skeleton height={100} radius="lg" />
          <Skeleton height={100} radius="lg" />
        </Stack>
      ) : items.length === 0 ? (
        <Stack align="center" gap="sm" className="px-5 py-10" ta="center">
          <ThemeIcon variant="light" color="navy" radius="xl" size={64}>
            <IconShoppingBag size={30} />
          </ThemeIcon>
          <Text fw={700} className="text-primary">
            Tu carrito está vacío
          </Text>
          <Text size="sm" c="dimmed">
            Agrega útiles desde el catálogo y aparecerán aquí.
          </Text>
          <Button
            component={Link}
            href="/productos"
            color="navy.9"
            radius="md"
            className="mt-2"
          >
            Ver catálogo
          </Button>
        </Stack>
      ) : (
        <section className="flex flex-col gap-3 px-5">
          <Group justify="space-between">
            <Text fw={700} className="text-primary">
              Artículos en tu cesta ({items.length})
            </Text>
            <Text fz={11} c="dimmed">
              Revisa las cantidades
            </Text>
          </Group>
          {items.map((item) => (
            <CartLineItem key={item.variantId} item={item} />
          ))}
        </section>
      )}

      <Suspense fallback={null}>
        <SchoolListSlot show={showSchoolList} />
      </Suspense>

      {availableSuggestions.length > 0 && (
        <section className="flex flex-col gap-3 px-5">
          <Group justify="space-between" align="end">
            <Stack gap={0}>
              <Text fw={700} className="text-primary">
                Frecuentemente añadidos
              </Text>
              <Text fz={11} c="dimmed">
                Complementa tu pedido escolar
              </Text>
            </Stack>
            <AnchorLink href="/productos" size="xs" fw={600} className="text-primary">
              Ver todo
            </AnchorLink>
          </Group>

          {/* Bleeds to the screen edge so cards scroll under the page padding */}
          <ScrollArea type="never" className="-mx-5">
            <Group gap="sm" wrap="nowrap" align="stretch" className="px-5">
              {availableSuggestions.map((product) => (
                <RecommendedProductCard
                  key={product.id}
                  product={product}
                  action="button"
                />
              ))}
            </Group>
          </ScrollArea>
        </section>
      )}

      {mounted && items.length > 0 && (
        <div className="px-5">
          <OrderSummary itemCount={unitCount} subtotal={subtotal} total={total} />
        </div>
      )}

      {mounted && items.length > 0 && (
        <Affix position={{ bottom: 0, left: 0, right: 0 }}>
          <Paper
            radius={0}
            className="px-5 pt-3 pb-2 bg-surface-container-lowest border-t border-outline-variant/30 shadow-[0_-4px_16px_rgba(19,20,81,0.06)]"
          >
            <Button
              onClick={openCheckout}
              color="navy.9"
              radius="md"
              size="md"
              fullWidth
              leftSection={<IconCreditCard size={18} />}
              rightSection={
                <Badge
                  size="lg"
                  radius="sm"
                  tt="none"
                  className="bg-on-primary/15 text-on-primary"
                >
                  {formatCordobas(total)}
                </Badge>
              }
              classNames={{ inner: "justify-between", label: "flex-1" }}
            >
              Pagar con {PAYMENT_PROVIDER_LABEL}
            </Button>
            <Group gap={6} justify="center" className="mt-1.5">
              <IconShieldCheck size={12} className="text-success" />
              <Text fz={10} c="dimmed">
                Pago 100% protegido
              </Text>
            </Group>
          </Paper>
        </Affix>
      )}

      <CheckoutDrawer opened={checkoutOpened} onClose={closeCheckout} total={total} />
    </div>
  );
};

"use client";

import Link from "next/link";
import { Affix, Badge, Button, Group, Paper, Text } from "@mantine/core";
import { useMounted } from "@mantine/hooks";
import { IconShoppingBag } from "@tabler/icons-react";
import { formatCordobas } from "@/shared/lib/currency";
import { selectItemCount, selectSubtotal, useCartStore } from "../../store";

export const CartSummaryBar = () => {
  const itemCount = useCartStore(selectItemCount);
  const subtotal = useCartStore(selectSubtotal);
  // The cart lives in localStorage: wait for mount so server and client HTML match
  const mounted = useMounted();
  const visible = mounted && itemCount > 0;

  return (
    <Affix position={{ bottom: 0, left: 0, right: 0 }} className="lg:hidden">
      {/* CSS transition instead of Mantine <Transition>: Next keeps visited pages alive in a
          hidden <Activity>, which pauses effects, so an effect-driven enter animation is
          missed when the cart changes on another page. CSS only depends on the current value. */}
      <Paper
        radius={0}
        data-visible={visible || undefined}
        aria-hidden={!visible}
        inert={!visible}
        className="flex translate-y-full items-center justify-between gap-3 px-5 py-3 bg-surface-container-lowest border-t border-outline-variant/30 shadow-[0_-4px_16px_rgba(19,20,81,0.06)] transition-transform duration-250 ease-out data-visible:translate-y-0"
      >
        <div className="shrink-0 whitespace-nowrap">
          <Group gap={6} wrap="nowrap">
            <Text
              fz={10}
              fw={700}
              tt="uppercase"
              className="text-on-surface tracking-wide"
            >
              Subtotal orden
            </Text>
            <Badge
              size="xs"
              radius="sm"
              tt="none"
              className="bg-primary-fixed text-primary"
            >
              {itemCount} {itemCount === 1 ? "item" : "items"}
            </Badge>
          </Group>
          <Group gap={4} align="baseline">
            <Text fz={22} fw={700} className="text-primary">
              {formatCordobas(subtotal)}
            </Text>
            <Text fz={10} c="dimmed">
              NIO
            </Text>
          </Group>
        </div>

        <Button
          component={Link}
          href="/carrito"
          color="navy.9"
          radius="md"
          size="xs"
          className="h-11 min-w-0 px-3"
          leftSection={<IconShoppingBag size={16} className="text-emerald-400" />}
        >
          Ver Carrito / Finalizar
        </Button>
      </Paper>
    </Affix>
  );
};

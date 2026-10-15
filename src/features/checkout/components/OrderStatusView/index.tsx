"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import {
  Button,
  Divider,
  Group,
  Loader,
  Paper,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { IconBuildingStore, IconCircleCheck, IconClockX, IconCreditCard } from "@tabler/icons-react";
import { formatCordobas } from "@/shared/lib/currency";
import { useCartStore } from "@/features/cart/store";
import type { OrderStatus } from "../../constants";

const REFRESH_EVERY_MS = 4_000;
const MAX_REFRESHES = 30; // ~2 minutes waiting for Poket's confirmation

type OrderStatusViewProps = {
  status: OrderStatus;
  number: number;
  customerName: string;
  total: number;
  paymentUrl: string | null;
  paymentExpiresAt: string | null;
  items: { name: string; variant_label: string | null; quantity: number; line_total: number }[];
};

export const OrderStatusView = ({
  status,
  number,
  customerName,
  total,
  paymentUrl,
  paymentExpiresAt,
  items,
}: OrderStatusViewProps) => {
  const router = useRouter();
  const clearCart = useCartStore((state) => state.clear);
  const refreshes = useRef(0);

  // Paid: the cart was bought
  useEffect(() => {
    if (status === "paid") clearCart();
  }, [status, clearCart]);

  // Pending: re-run the server check until Poket confirms (the page re-syncs on each refresh)
  useEffect(() => {
    if (status !== "pending" || refreshes.current >= MAX_REFRESHES) return;
    const timer = setTimeout(() => {
      refreshes.current += 1;
      router.refresh();
    }, REFRESH_EVERY_MS);
    return () => clearTimeout(timer);
  }, [status, router]);

  const canStillPay =
    status === "pending" &&
    paymentUrl &&
    (!paymentExpiresAt || new Date(paymentExpiresAt).getTime() > Date.now());

  return (
    <Stack gap="lg">
      {status === "paid" && (
        <Stack align="center" gap="xs" ta="center">
          <ThemeIcon size={64} radius="xl" className="bg-success-container text-success">
            <IconCircleCheck size={36} />
          </ThemeIcon>
          <Title order={1} fz={22} className="text-primary">
            ¡Pago confirmado!
          </Title>
          <Text size="sm" c="dimmed">
            Gracias, {customerName}. Tu pedido #{number} está listo para preparar.
          </Text>
        </Stack>
      )}

      {status === "pending" && (
        <Stack align="center" gap="xs" ta="center">
          <Loader color="navy" />
          <Title order={1} fz={22} className="text-primary">
            Confirmando tu pago…
          </Title>
          <Text size="sm" c="dimmed">
            Pedido #{number}. Esto puede tardar unos segundos; no cierres esta página.
          </Text>
          {canStillPay && (
            <Button
              component="a"
              href={paymentUrl}
              variant="light"
              color="navy"
              radius="md"
              leftSection={<IconCreditCard size={16} />}
            >
              ¿No terminaste de pagar? Ir a pagar
            </Button>
          )}
        </Stack>
      )}

      {(status === "failed" || status === "expired" || status === "cancelled") && (
        <Stack align="center" gap="xs" ta="center">
          <ThemeIcon size={64} radius="xl" color="crimson" variant="light">
            <IconClockX size={34} />
          </ThemeIcon>
          <Title order={1} fz={22} className="text-primary">
            {status === "expired" ? "El enlace de pago venció" : "No se completó el pago"}
          </Title>
          <Text size="sm" c="dimmed">
            Pedido #{number}. No se realizó ningún cobro. Tus productos siguen en el carrito.
          </Text>
          <Button component={Link} href="/carrito" color="navy.9" radius="md">
            Volver al carrito
          </Button>
        </Stack>
      )}

      <Paper radius="lg" p="md" className="border border-outline-variant/30 bg-surface-container-lowest">
        <Text fw={700} className="mb-2 text-primary">
          Resumen del pedido #{number}
        </Text>
        <Stack gap={6}>
          {items.map((item, index) => (
            <Group key={index} justify="space-between" wrap="nowrap" align="start">
              <Text size="sm" className="text-on-surface">
                {item.quantity} × {item.name}
                {item.variant_label && (
                  <Text component="span" size="xs" c="dimmed">
                    {" "}
                    · {item.variant_label}
                  </Text>
                )}
              </Text>
              <Text size="sm" fw={500} className="shrink-0">
                {formatCordobas(Number(item.line_total))}
              </Text>
            </Group>
          ))}
        </Stack>
        <Divider my="sm" className="border-outline-variant/30" />
        <Group justify="space-between">
          <Text fw={700}>Total</Text>
          <Text fz={20} fw={700} className="text-primary">
            {formatCordobas(total)}
          </Text>
        </Group>
      </Paper>

      {status === "paid" && (
        <Paper radius="lg" p="md" className="flex gap-3 bg-surface-container-low">
          <IconBuildingStore size={22} className="shrink-0 text-primary" />
          <Text size="sm" className="text-on-surface">
            <strong>Retiro en tienda.</strong> Te escribiremos por WhatsApp cuando tu pedido esté
            listo para recoger.
          </Text>
        </Paper>
      )}

      <Button component={Link} href="/productos" variant="subtle" color="navy" radius="md">
        Seguir comprando
      </Button>
    </Stack>
  );
};

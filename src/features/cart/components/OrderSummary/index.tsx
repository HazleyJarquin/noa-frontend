"use client";

import { Divider, Group, Paper, Text } from "@mantine/core";
import { formatCordobas } from "@/shared/lib/currency";

type OrderSummaryProps = {
  itemCount: number;
  subtotal: number;
  total: number;
};

export const OrderSummary = ({ itemCount, subtotal, total }: OrderSummaryProps) => {
  return (
    <Paper
      radius="lg"
      p="md"
      className="bg-surface-container-lowest border border-outline-variant/30"
    >
      <Text fw={700} className="mb-3 text-primary">
        Resumen de pedido
      </Text>

      <Group justify="space-between">
        <Text size="sm" c="dimmed">
          Subtotal ({itemCount} {itemCount === 1 ? "artículo" : "artículos"})
        </Text>
        <Text size="sm" fw={500} className="text-on-surface">
          {formatCordobas(subtotal)}
        </Text>
      </Group>

      <Divider my="sm" className="border-outline-variant/30" />

      <Group justify="space-between" align="end">
        <div>
          <Text fw={700} className="text-on-surface">
            Total
          </Text>
          <Text fz={10} c="dimmed">
            Impuestos incluidos
          </Text>
        </div>
        <Text fz={26} fw={700} className="text-primary">
          {formatCordobas(total)}
        </Text>
      </Group>
    </Paper>
  );
};

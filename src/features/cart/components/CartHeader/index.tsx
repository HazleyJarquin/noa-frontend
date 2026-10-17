"use client";

import { useRouter } from "next/navigation";
import { ActionIcon, Group, Indicator, Stack, Text } from "@mantine/core";
import { IconArrowLeft, IconShoppingBag } from "@tabler/icons-react";
import { selectItemCount, useCartStore } from "../../store";

export const CartHeader = () => {
  const router = useRouter();
  const itemCount = useCartStore(selectItemCount);

  return (
    <Group justify="space-between" wrap="nowrap" className="px-5 pt-4 lg:hidden">
      <Group gap="sm" wrap="nowrap">
        <ActionIcon
          variant="subtle"
          color="navy.9"
          size={36}
          radius="xl"
          aria-label="Volver"
          onClick={() => router.back()}
        >
          <IconArrowLeft size={20} />
        </ActionIcon>
        <Stack gap={0}>
          <Text fw={700} size="lg" lh={1.2} className="text-primary">
            NOA Librería
          </Text>
          <Text
            fz={10}
            fw={600}
            tt="uppercase"
            c="dimmed"
            className="tracking-wide"
          >
            Mi carrito
          </Text>
        </Stack>
      </Group>
    </Group>
  );
};

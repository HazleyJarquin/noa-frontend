"use client";

import Link from "next/link";
import { Button, Indicator } from "@mantine/core";
import { useMounted } from "@mantine/hooks";
import { IconShoppingBag } from "@tabler/icons-react";
import { selectItemCount, useCartStore } from "../../store";

// Desktop header cart button with the item count
export const HeaderCartButton = () => {
  const itemCount = useCartStore(selectItemCount);
  // The cart lives in localStorage: wait for mount so server and client HTML match
  const count = useMounted() ? itemCount : 0;

  return (
    <Indicator label={count} disabled={count === 0} color="emerald" size={18} offset={4} withBorder>
      <Button
        component={Link}
        href="/carrito"
        color="navy.9"
        radius="xl"
        leftSection={<IconShoppingBag size={16} />}
      >
        Mi carrito
      </Button>
    </Indicator>
  );
};

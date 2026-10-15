"use client";

import { useState, useTransition } from "react";
import {
  Alert,
  Button,
  Drawer,
  Paper,
  Stack,
  Text,
  TextInput,
  Textarea,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconAlertCircle, IconBuildingStore, IconCreditCard } from "@tabler/icons-react";
import { formatCordobas } from "@/shared/lib/currency";
import { useCartStore } from "@/features/cart/store";
import { startCheckout } from "../../actions";

type CheckoutDrawerProps = {
  opened: boolean;
  onClose: () => void;
  total: number;
};

export const CheckoutDrawer = ({ opened, onClose, total }: CheckoutDrawerProps) => {
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm({
    mode: "uncontrolled",
    initialValues: { name: "", phone: "", email: "", notes: "" },
    validate: {
      name: (value) => (value.trim().length < 2 ? "Escribe tu nombre" : null),
      phone: (value) =>
        /^[+\d][\d\s-]{7,19}$/.test(value.trim()) ? null : "Escribe un teléfono válido",
      email: (value) =>
        !value.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
          ? null
          : "El correo no es válido",
    },
  });

  const handleSubmit = form.onSubmit((customer) => {
    setError(null);
    startTransition(async () => {
      const result = await startCheckout(
        customer,
        items.map((item) => ({ variantId: item.variantId, quantity: item.quantity })),
      );

      if (result.ok) {
        // Leave the site for Poket's hosted checkout; the cart is cleared once payment is confirmed
        window.location.assign(result.paymentUrl);
        return;
      }

      setError(result.error);
      // Stock changed since the products were added: fit the cart to what's left
      result.unavailable?.forEach(({ variantId, available }) =>
        updateQuantity(variantId, available),
      );
    });
  });

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="bottom"
      size="auto"
      radius="lg"
      title={
        <Text fw={700} className="text-primary">
          Datos para tu pedido
        </Text>
      }
      classNames={{ content: "mx-auto max-w-xl" }}
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="sm" className="pb-4">
          <Paper radius="md" p="sm" className="flex gap-3 bg-surface-container-low">
            <IconBuildingStore size={20} className="shrink-0 text-primary" />
            <Text size="xs" className="text-on-surface">
              <strong>Retiro en tienda.</strong> Te avisamos por WhatsApp cuando tu pedido esté
              listo.
            </Text>
          </Paper>

          <TextInput
            label="Nombre completo"
            autoComplete="name"
            required
            key={form.key("name")}
            {...form.getInputProps("name")}
          />
          <TextInput
            label="Teléfono / WhatsApp"
            type="tel"
            autoComplete="tel"
            placeholder="8161 5603"
            required
            key={form.key("phone")}
            {...form.getInputProps("phone")}
          />
          <TextInput
            label="Correo (opcional)"
            type="email"
            autoComplete="email"
            key={form.key("email")}
            {...form.getInputProps("email")}
          />
          <Textarea
            label="Notas (opcional)"
            placeholder="Ej: lo recoge mi hermana"
            autosize
            minRows={2}
            maxLength={500}
            key={form.key("notes")}
            {...form.getInputProps("notes")}
          />

          {error && (
            <Alert color="crimson" variant="light" icon={<IconAlertCircle size={18} />}>
              {error}
            </Alert>
          )}

          <Button
            type="submit"
            color="navy.9"
            radius="md"
            size="md"
            fullWidth
            loading={isPending}
            disabled={items.length === 0}
            leftSection={<IconCreditCard size={18} />}
          >
            Pagar {formatCordobas(total)} con Pocket LAFISE
          </Button>
          <Text fz={11} c="dimmed" ta="center">
            Te llevaremos al sitio seguro de Pocket LAFISE para ingresar tu tarjeta.
          </Text>
        </Stack>
      </form>
    </Drawer>
  );
};

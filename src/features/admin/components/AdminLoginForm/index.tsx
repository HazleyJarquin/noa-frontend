"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Alert, Button, PasswordInput, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconAlertCircle, IconLogin } from "@tabler/icons-react";
import { signInAdmin } from "../../actions/auth";

export const AdminLoginForm = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm({
    mode: "uncontrolled",
    initialValues: { email: "", password: "" },
    validate: {
      email: (value) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) ? null : "Escribe tu correo"),
      password: (value) => (value ? null : "Escribe tu contraseña"),
    },
  });

  const handleSubmit = form.onSubmit(({ email, password }) => {
    setError(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.set("email", email);
      formData.set("password", password);
      const result = await signInAdmin(formData);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.replace("/admin/products");
      router.refresh();
    });
  });

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Stack gap="sm">
        <TextInput
          label="Correo"
          type="email"
          autoComplete="email"
          key={form.key("email")}
          {...form.getInputProps("email")}
        />
        <PasswordInput
          label="Contraseña"
          autoComplete="current-password"
          key={form.key("password")}
          {...form.getInputProps("password")}
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
          loading={isPending}
          leftSection={<IconLogin size={18} />}
        >
          Entrar
        </Button>
      </Stack>
    </form>
  );
};

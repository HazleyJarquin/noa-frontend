import Image from "next/image";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Loader, Paper, Stack, Text } from "@mantine/core";
import { AdminLoginForm } from "@/features/admin/components/AdminLoginForm";
import { getAdminUser } from "@/features/admin/services/auth";

// Already signed in → straight to the panel
const AlreadySignedIn = async () => {
  if (await getAdminUser()) redirect("/admin/products");
  return <AdminLoginForm />;
};

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-5 py-10">
      <Paper
        radius="lg"
        p="xl"
        className="w-full max-w-sm border border-outline-variant/30 bg-surface-container-lowest"
      >
        <Stack gap="lg">
          <Stack align="center" gap={6} ta="center">
            <Image src="/brand/noa-isotipo.png" alt="" width={48} height={48} />
            <Text fw={700} fz={20} className="text-primary">
              Panel NOA
            </Text>
            <Text size="sm" c="dimmed">
              Entra para administrar las fotos de los productos.
            </Text>
          </Stack>
          {/* Reading the session uses cookies (dynamic): stream it */}
          <Suspense fallback={<Loader color="navy" className="mx-auto" />}>
            <AlreadySignedIn />
          </Suspense>
        </Stack>
      </Paper>
    </div>
  );
}

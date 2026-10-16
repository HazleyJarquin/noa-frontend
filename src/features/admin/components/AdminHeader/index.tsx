import Image from "next/image";
import { Button, Group, Stack, Text } from "@mantine/core";
import { IconLogout } from "@tabler/icons-react";
import { signOutAdmin } from "../../actions/auth";

export const AdminHeader = ({ email }: { email: string }) => (
  <Group
    justify="space-between"
    wrap="nowrap"
    className="border-b border-outline-variant/30 bg-surface-container-lowest px-5 py-3"
  >
    <Group gap="sm" wrap="nowrap" className="min-w-0">
      <Image src="/brand/noa-isotipo.png" alt="" width={32} height={32} />
      <Stack gap={0} className="min-w-0">
        <Text fw={700} className="text-primary">
          Panel NOA
        </Text>
        <Text fz={11} c="dimmed" truncate="end">
          {email}
        </Text>
      </Stack>
    </Group>
    {/* Plain form: works with the Server Action directly */}
    <form action={signOutAdmin}>
      <Button
        type="submit"
        variant="subtle"
        color="navy"
        size="compact-sm"
        leftSection={<IconLogout size={16} />}
      >
        Salir
      </Button>
    </form>
  </Group>
);

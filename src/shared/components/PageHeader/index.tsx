"use client";

import Link from "next/link";
import { ActionIcon, Group, Stack, Text } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";

type PageHeaderProps = {
  subtitle: string;
  backHref?: string;
};

// Top bar for inner pages: back arrow + store name + section name
export const PageHeader = ({ subtitle, backHref = "/" }: PageHeaderProps) => (
  <Group gap="sm" wrap="nowrap" className="px-5 pt-4">
    <ActionIcon
      component={Link}
      href={backHref}
      variant="subtle"
      color="navy.9"
      size={36}
      radius="xl"
      aria-label="Volver"
    >
      <IconArrowLeft size={20} />
    </ActionIcon>
    <Stack gap={0}>
      <Text fw={700} size="lg" lh={1.2} className="text-primary">
        NOA Librería
      </Text>
      <Text fz={10} fw={600} tt="uppercase" c="dimmed" className="tracking-wide">
        {subtitle}
      </Text>
    </Stack>
  </Group>
);

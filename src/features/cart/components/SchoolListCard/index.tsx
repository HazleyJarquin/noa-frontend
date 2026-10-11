"use client";

import Link from "next/link";
import { Badge, Button, Group, Paper, Stack, Text, ThemeIcon } from "@mantine/core";
import { IconFileUpload, IconListCheck } from "@tabler/icons-react";

export const SchoolListCard = () => {
  return (
    <Paper
      radius="lg"
      p="md"
      className="border border-dashed border-secondary/40 bg-surface-container-low"
    >
      <Group align="start" wrap="nowrap" gap="sm">
        <ThemeIcon size={40} radius="md" className="shrink-0 bg-surface-container-lowest text-primary">
          <IconListCheck size={20} />
        </ThemeIcon>

        <Stack gap={6} className="min-w-0 flex-1">
          <Group gap="xs">
            <Text fw={700} className="text-primary">
              ¿Tienes lista escolar?
            </Text>
            <Badge size="xs" radius="sm" tt="none" className="bg-primary-fixed text-primary">
              Nuevo
            </Badge>
          </Group>
          <Text fz={12} lh={1.45} c="dimmed">
            Sube una foto o PDF de la lista de útiles de tu colegio y nuestro equipo
            cotizará todo por ti.
          </Text>
          <Button
            component={Link}
            href="/listas-escolares"
            variant="white"
            color="navy.9"
            radius="md"
            size="xs"
            className="mt-1 self-start shadow-[0_0_0_1px_#EAEAF0]"
            leftSection={<IconFileUpload size={14} />}
          >
            Subir PDF / Foto
          </Button>
        </Stack>
      </Group>
    </Paper>
  );
};

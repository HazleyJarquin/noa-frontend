"use client";

import { Group, NumberInput, SegmentedControl, Select, Stack, Text } from "@mantine/core";
import {
  COLOR_MODE_LABELS,
  MAX_COPIES,
  PAPER_SIZE_LABELS,
  SIDES_LABELS,
  type ColorMode,
  type PaperSize,
  type PrintOptions,
  type PrintSides,
} from "../../constants";

const toOptions = <T extends string>(labels: Record<T, string>) =>
  (Object.entries(labels) as [T, string][]).map(([value, label]) => ({ value, label }));

type PrintOptionsFieldsProps = {
  value: PrintOptions;
  onChange: (value: PrintOptions) => void;
};

export const PrintOptionsFields = ({ value, onChange }: PrintOptionsFieldsProps) => {
  const update = (patch: Partial<PrintOptions>) => onChange({ ...value, ...patch });

  return (
    <Stack gap="sm">
      <Text size="sm" fw={600} className="text-on-surface">
        Opciones de impresión
      </Text>

      <SegmentedControl
        fullWidth
        radius="md"
        color="navy.9"
        value={value.colorMode}
        onChange={(colorMode) => update({ colorMode: colorMode as ColorMode })}
        data={toOptions(COLOR_MODE_LABELS)}
        aria-label="Color de impresión"
      />

      <Group grow align="start">
        <NumberInput
          label="Copias"
          min={1}
          max={MAX_COPIES}
          clampBehavior="strict"
          allowDecimal={false}
          value={value.copies}
          onChange={(copies) => update({ copies: Number(copies) || 1 })}
        />
        <Select
          label="Papel"
          allowDeselect={false}
          data={toOptions(PAPER_SIZE_LABELS)}
          value={value.paperSize}
          onChange={(paperSize) => paperSize && update({ paperSize: paperSize as PaperSize })}
        />
      </Group>

      <SegmentedControl
        fullWidth
        radius="md"
        color="navy.9"
        value={value.sides}
        onChange={(sides) => update({ sides: sides as PrintSides })}
        data={toOptions(SIDES_LABELS)}
        aria-label="Caras"
      />
      <Text fz={11} c="dimmed">
        Las copias aplican a cada archivo.
      </Text>
    </Stack>
  );
};

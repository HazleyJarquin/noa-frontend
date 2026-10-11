import { ActionIcon, Group, Text } from "@mantine/core";
import { IconMinus, IconPlus } from "@tabler/icons-react";

type QuantityStepperProps = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
};

export const QuantityStepper = ({
  value,
  onChange,
  min = 1,
  max = 99,
  disabled = false,
}: QuantityStepperProps) => {
  return (
    <Group
      gap={0}
      wrap="nowrap"
      className="shrink-0 rounded-lg border border-outline-variant/50"
    >
      <ActionIcon
        variant="subtle"
        className="data-disabled:bg-transparent"
        color="navy.9"
        size={22}
        aria-label="Quitar uno"
        disabled={disabled || value <= min}
        onClick={() => onChange(value - 1)}
      >
        <IconMinus size={12} stroke={2.5} />
      </ActionIcon>

      <Text size="xs" fw={600} className="w-4 text-center text-primary">
        {value}
      </Text>

      <ActionIcon
        variant="subtle"
        className="data-disabled:bg-transparent"
        color="navy.9"
        size={22}
        aria-label="Agregar uno"
        disabled={disabled || value >= max}
        onClick={() => onChange(value + 1)}
      >
        <IconPlus size={12} stroke={2.5} />
      </ActionIcon>
    </Group>
  );
};

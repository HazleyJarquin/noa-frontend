import { Paper, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import type { Icon } from "@tabler/icons-react";

type ServicePageIntroProps = {
  icon: Icon;
  title: string;
  description: string;
  steps: string[];
};

// Header block shared by /manualidades and /impresiones
export const ServicePageIntro = ({ icon: ServiceIcon, title, description, steps }: ServicePageIntroProps) => (
  <Stack gap="md">
    <Stack gap={6}>
      <ThemeIcon size={48} radius="xl" variant="light" color="navy">
        <ServiceIcon size={26} />
      </ThemeIcon>
      <Title order={1} fz={24} lh={1.2} className="text-primary">
        {title}
      </Title>
      <Text size="sm" c="dimmed">
        {description}
      </Text>
    </Stack>

    <Paper radius="lg" p="md" className="bg-surface-container-low">
      <Stack gap={6}>
        {steps.map((step, index) => (
          <Text key={step} size="sm" className="text-on-surface">
            <Text component="span" fw={700} className="text-primary">
              {index + 1}.{" "}
            </Text>
            {step}
          </Text>
        ))}
      </Stack>
    </Paper>
  </Stack>
);

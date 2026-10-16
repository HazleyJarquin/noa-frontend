import Link from "next/link";
import { Card, SimpleGrid, Text, ThemeIcon } from "@mantine/core";
import { IconArrowRight, IconPalette, IconPrinter, type Icon } from "@tabler/icons-react";

const SERVICES: { href: string; icon: Icon; title: string; text: string }[] = [
  {
    href: "/impresiones",
    icon: IconPrinter,
    title: "Impresiones",
    text: "Envía tus archivos y retira en tienda",
  },
  {
    href: "/manualidades",
    icon: IconPalette,
    title: "Manualidades",
    text: "Maquetas, carteles y proyectos escolares",
  },
];

// Home entry point to the custom request pages
export const ServicesShowcase = () => (
  <section className="flex flex-col gap-3">
    <Text component="h2" fw={700} fz={18} className="text-primary">
      Servicios
    </Text>
    <SimpleGrid cols={2} spacing="sm">
      {SERVICES.map((service) => (
        // Link wraps the Card: component={Link} can't be passed from a Server Component
        <Link key={service.href} href={service.href} className="block rounded-2xl">
          <Card
            radius="lg"
            padding="sm"
            className="h-full gap-2 border border-outline-variant/30 bg-surface-container-lowest transition-shadow hover:shadow-[0_4px_16px_rgba(19,20,81,0.08)]"
          >
            <ThemeIcon size={40} radius="xl" className="bg-surface-container-low text-primary">
              <service.icon size={22} />
            </ThemeIcon>
            <Text fw={700} size="sm" className="text-primary">
              {service.title}
            </Text>
            <Text fz={12} lh={1.35} c="dimmed" className="flex-1">
              {service.text}
            </Text>
            <Text fz={12} fw={600} className="flex items-center gap-1 text-secondary">
              Solicitar <IconArrowRight size={14} />
            </Text>
          </Card>
        </Link>
      ))}
    </SimpleGrid>
  </section>
);

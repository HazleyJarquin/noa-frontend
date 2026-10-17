import Image from "next/image";
import { Divider, Paper, SimpleGrid, Stack, Text } from "@mantine/core";
import { IconBrandWhatsapp, IconBuildingStore } from "@tabler/icons-react";
import { getCurrentYear } from "@/shared/lib/current-year";
import { NAV_LINKS, PAGE_CONTAINER } from "@/shared/lib/navigation";
import { WHATSAPP_NUMBER, getWhatsAppUrl } from "@/shared/lib/whatsapp";
import { AnchorLink } from "../AnchorLink";

const linkClass = "text-primary-fixed hover:text-on-primary";

// 50581615603 → +505 8161 5603
const formatPhone = (digits: string) =>
  digits.length === 11 ? `+${digits.slice(0, 3)} ${digits.slice(3, 7)} ${digits.slice(7)}` : `+${digits}`;

export const Footer = async () => {
  const year = await getCurrentYear();

  return (
    <footer className="w-full bg-primary px-5 py-8 lg:px-0 lg:py-14">
      <div className={PAGE_CONTAINER}>
        <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[1.6fr_1fr_1.2fr] lg:gap-12">
          <Stack gap="sm">
            {/* The logo's navy text disappears on the navy footer: render it white */}
            <Image
              src="/brand/noa-logo.png"
              alt="NOA Librería"
              width={70}
              height={80}
              className="brightness-0 invert"
            />
            <Text size="xs" lh={1.5} className="max-w-xs text-primary-fixed/80">
              Material escolar, papelería fina y suministros institucionales para Nicaragua.
            </Text>
          </Stack>

          {/* Mobile: compact two-column list */}
          <SimpleGrid cols={2} spacing="xs" verticalSpacing="xs" className="lg:hidden">
            {NAV_LINKS.map((link) => (
              <AnchorLink key={link.href} href={link.href} size="xs" className={linkClass}>
                {link.label}
              </AnchorLink>
            ))}
          </SimpleGrid>

          {/* Desktop: columns */}
          <Stack gap="xs" className="hidden lg:flex">
            <Text fw={700} size="sm" className="text-on-primary">
              Tienda
            </Text>
            {NAV_LINKS.map((link) => (
              <AnchorLink key={link.href} href={link.href} size="sm" className={linkClass}>
                {link.label}
              </AnchorLink>
            ))}
          </Stack>

          <Stack gap="sm" className="hidden lg:flex">
            <Text fw={700} size="sm" className="text-on-primary">
              Atención
            </Text>
            <Paper
              component="a"
              href={getWhatsAppUrl("Hola NOA Librería, quiero hacer una consulta.")}
              target="_blank"
              rel="noopener noreferrer"
              radius="md"
              p="sm"
              className="flex items-center gap-3 bg-on-primary/5 transition-colors hover:bg-on-primary/10"
            >
              <IconBrandWhatsapp size={22} className="shrink-0 text-emerald-400" />
              <span>
                <Text component="span" display="block" size="sm" fw={600} className="text-on-primary">
                  Escríbenos por WhatsApp
                </Text>
                <Text component="span" display="block" fz={12} className="text-primary-fixed/70">
                  {formatPhone(WHATSAPP_NUMBER)}
                </Text>
              </span>
            </Paper>
            <Text size="sm" className="flex items-center gap-2 text-primary-fixed/80">
              <IconBuildingStore size={18} /> Retiro en tienda
            </Text>
          </Stack>
        </div>

        <Divider className="my-6 border-primary-fixed/15 lg:my-8" />

        <Text fz={10} className="text-primary-fixed/60 lg:text-xs">
          © {year} NOA Librería Nicaragua. Todos los derechos reservados.
        </Text>
      </div>
    </footer>
  );
};

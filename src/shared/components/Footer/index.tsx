import Image from "next/image";
import { Divider, SimpleGrid, Stack, Text } from "@mantine/core";
import { getCurrentYear } from "@/shared/lib/current-year";
import { AnchorLink } from "../AnchorLink";

const FOOTER_LINKS = [
  { label: "Catálogo General", href: "/productos" },
  { label: "Manualidades", href: "/manualidades" },
  { label: "Impresiones", href: "/impresiones" },
];

export const Footer = async () => {
  const year = await getCurrentYear();

  return (
    <footer className="w-full bg-primary px-5 py-8">
      <Stack gap="md">
        <Stack gap="sm">
          {/* The logo's navy text disappears on the navy footer: render it white */}
          <Image
            src="/brand/noa-logo.png"
            alt="NOA Librería"
            width={70}
            height={80}
            className="brightness-0 invert"
          />
          <Text size="xs" lh={1.5} className="text-primary-fixed/80">
            Material escolar, papelería fina y suministros institucionales para
            Nicaragua.
          </Text>
        </Stack>

        <SimpleGrid cols={2} spacing="xs" verticalSpacing="xs">
          {FOOTER_LINKS.map((link) => (
            <AnchorLink
              key={link.href}
              href={link.href}
              size="xs"
              className="text-primary-fixed hover:text-on-primary"
            >
              {link.label}
            </AnchorLink>
          ))}
        </SimpleGrid>

        <Divider className="border-primary-fixed/15" />

        <Text fz={10} className="text-primary-fixed/60">
          © {year} NOA Librería Nicaragua. Todos los derechos reservados.
        </Text>
      </Stack>
    </footer>
  );
};

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ActionIcon, Button, Drawer, NavLink, Stack, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconBrandWhatsapp,
  IconHome,
  IconLayoutGrid,
  IconMenu2,
  IconPalette,
  IconPrinter,
  IconShoppingBag,
  type Icon,
} from "@tabler/icons-react";
import { getWhatsAppUrl } from "@/shared/lib/whatsapp";

const MENU_LINKS: { href: string; label: string; icon: Icon }[] = [
  { href: "/", label: "Inicio", icon: IconHome },
  { href: "/productos", label: "Catálogo", icon: IconLayoutGrid },
  { href: "/impresiones", label: "Impresiones", icon: IconPrinter },
  { href: "/manualidades", label: "Manualidades", icon: IconPalette },
  { href: "/carrito", label: "Mi carrito", icon: IconShoppingBag },
];

const isActive = (pathname: string, href: string) =>
  href === "/" ? pathname === "/" : pathname.startsWith(href);

export const MainMenu = () => {
  const [opened, { open, close }] = useDisclosure(false);
  const pathname = usePathname();

  return (
    <>
      <ActionIcon
        variant="subtle"
        color="navy.9"
        size={42}
        radius="xl"
        aria-label="Abrir menú"
        onClick={open}
      >
        <IconMenu2 size={24} />
      </ActionIcon>

      <Drawer
        opened={opened}
        onClose={close}
        position="right"
        size="xs"
        title={
          <Text fw={700} className="text-primary">
            NOA Librería
          </Text>
        }
      >
        <Stack gap="lg">
          <nav aria-label="Menú principal">
            {MENU_LINKS.map((link) => (
              <NavLink
                key={link.href}
                component={Link}
                href={link.href}
                label={link.label}
                leftSection={<link.icon size={20} />}
                active={isActive(pathname, link.href)}
                color="navy"
                variant="light"
                onClick={close}
                className="rounded-md"
              />
            ))}
          </nav>

          <Button
            component="a"
            href={getWhatsAppUrl("Hola NOA Librería, quiero hacer una consulta.")}
            target="_blank"
            rel="noopener noreferrer"
            color="navy.9"
            radius="md"
            leftSection={<IconBrandWhatsapp size={18} />}
          >
            Escríbenos por WhatsApp
          </Button>
        </Stack>
      </Drawer>
    </>
  );
};

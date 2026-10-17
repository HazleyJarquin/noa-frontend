"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Anchor, Group } from "@mantine/core";
import { NAV_LINKS } from "@/shared/lib/navigation";

const NavItems = ({ pathname }: { pathname: string | null }) => (
  <Group component="nav" gap="lg" wrap="nowrap" aria-label="Secciones">
    {NAV_LINKS.map((link) => {
      const active = !!pathname?.startsWith(link.href);
      return (
        <Anchor
          key={link.href}
          component={Link}
          href={link.href}
          size="sm"
          fw={active ? 700 : 500}
          underline="never"
          data-active={active || undefined}
          className="whitespace-nowrap border-b-2 border-transparent py-1 text-on-surface/70 hover:text-primary data-active:border-primary data-active:text-primary"
        >
          {link.label}
        </Anchor>
      );
    })}
  </Group>
);

// usePathname can't run during prerender of dynamic routes (/pedido/[id]):
// render it inside <Suspense fallback={<DesktopNavFallback />}>
const DesktopNavWithPath = () => <NavItems pathname={usePathname()} />;

export const DesktopNavFallback = () => <NavItems pathname={null} />;

export const DesktopNav = DesktopNavWithPath;

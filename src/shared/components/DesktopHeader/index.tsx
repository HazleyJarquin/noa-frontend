import Form from "next/form";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { ActionIcon, Group, Text, TextInput } from "@mantine/core";
import { IconBrandWhatsapp, IconSearch } from "@tabler/icons-react";
import { HeaderCartButton } from "@/features/cart/components/HeaderCartButton";
import { PAGE_CONTAINER } from "@/shared/lib/navigation";
import { getWhatsAppUrl } from "@/shared/lib/whatsapp";
import { DesktopNav, DesktopNavFallback } from "../DesktopNav";

// Desktop-only header (lg+). Mobile pages keep their own headers (lg:hidden).
export const DesktopHeader = () => (
  <header className="sticky top-0 z-100 hidden border-b border-outline-variant/30 bg-surface-container-lowest/95 backdrop-blur lg:block">
    <div className={`${PAGE_CONTAINER} flex h-18 items-center gap-8`}>
      <Link href="/" className="flex shrink-0 items-center gap-2.5">
        <Image src="/brand/noa-isotipo.png" alt="" width={34} height={34} />
        <Text fw={800} fz={20} className="text-primary">
          NOA Librería
        </Text>
      </Link>

      {/* Plain GET form: /productos reads ?q= and runs the search */}
      <Form action="/productos" className="max-w-md flex-1">
        <TextInput
          name="q"
          type="search"
          radius="xl"
          placeholder="Buscar cuadernos, lapiceros, foamy…"
          aria-label="Buscar productos"
          leftSection={<IconSearch size={16} />}
          classNames={{ input: "border-transparent bg-surface-container-low" }}
        />
      </Form>

      <div className="ml-auto flex items-center gap-6">
        <Suspense fallback={<DesktopNavFallback />}>
          <DesktopNav />
        </Suspense>

        <Group gap="sm" wrap="nowrap">
          <ActionIcon
            component="a"
            href={getWhatsAppUrl("Hola NOA Librería, quiero hacer una consulta.")}
            target="_blank"
            rel="noopener noreferrer"
            size={38}
            radius="xl"
            aria-label="Escribir por WhatsApp"
            className="border border-success-outline bg-success-container text-success-soft hover:bg-success-container-hover"
          >
            <IconBrandWhatsapp size={20} />
          </ActionIcon>
          <HeaderCartButton />
        </Group>
      </div>
    </div>
  </header>
);

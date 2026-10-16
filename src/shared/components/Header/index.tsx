import Image from "next/image";
import { ActionIcon, Group } from "@mantine/core";
import { IconMessageFilled, IconRosetteDiscountCheck } from "@tabler/icons-react";
import { getWhatsAppUrl } from "@/shared/lib/whatsapp";
import { MainMenu } from "../MainMenu";

export const Header = () => {
  return (
    <div className="w-full h-auto shadow px-10 py-5 flex flex-col gap-3">
      <div className="flex items-center w-full justify-between">
        <Group gap="sm" wrap="nowrap">
          <Image
            src="/brand/noa-isotipo.png"
            alt=""
            width={40}
            height={40}
            priority
            className="shrink-0"
          />
          <div className="flex flex-col">
            <h1 className="text-primary font-bold text-2xl">NOA Librería</h1>
            <div className="w-full flex items-center gap-1">
              <IconRosetteDiscountCheck
                stroke={2}
                className="text-secondary"
                size={15}
              />
              <p className="text-xs">Papelería & Útiles Escolares</p>
            </div>
          </div>
        </Group>

        <Group gap="xs" wrap="nowrap">
          <ActionIcon
            component="a"
            href={getWhatsAppUrl("Hola NOA Librería, quiero hacer una consulta.")}
            target="_blank"
            rel="noopener noreferrer"
            size={42}
            radius="100%"
            aria-label="Escribir por WhatsApp"
            className="bg-success-container text-success-soft border-[1.5px] border-success-outline hover:bg-success-container-hover"
          >
            <IconMessageFilled size={22} />
          </ActionIcon>
          <MainMenu />
        </Group>
      </div>
    </div>
  );
};

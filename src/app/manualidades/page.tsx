import type { Metadata } from "next";
import { DesktopHeader } from "@/shared/components/DesktopHeader";
import { IconPalette } from "@tabler/icons-react";
import { Footer } from "@/shared/components";
import { PageHeader } from "@/shared/components/PageHeader";
import { ServicePageIntro } from "@/features/service-requests/components/ServicePageIntro";
import { ServiceRequestForm } from "@/features/service-requests/components/ServiceRequestForm";

export const metadata: Metadata = {
  title: "Manualidades a pedido | NOA Librería",
  description:
    "Envíanos una foto de la manualidad o maqueta que necesitas y te cotizamos por WhatsApp.",
};

export default function CraftsPage() {
  return (
    <div className="min-h-screen w-full bg-surface flex flex-col gap-6">
      <DesktopHeader />
      <PageHeader subtitle="Manualidades" />

      <div className="mx-auto flex w-full max-w-xl flex-col gap-6 px-5 pb-10">
        <ServicePageIntro
          icon={IconPalette}
          title="Manualidades a pedido"
          description="Maquetas, carteles, proyectos escolares y decoraciones hechas por nuestro equipo."
          steps={[
            "Sube una o varias fotos de referencia de lo que necesitas.",
            "Cuéntanos los detalles: tamaño, colores y para cuándo.",
            "Te escribimos por WhatsApp con el precio y la fecha de entrega.",
          ]}
        />

        <ServiceRequestForm
          kind="crafts"
          filesLabel="Fotos de referencia"
          notesLabel="¿Qué necesitas?"
          notesPlaceholder="Ej: maqueta del sistema solar en foamy, tamaño mediano, para el viernes."
        />
      </div>

      <Footer />
    </div>
  );
}

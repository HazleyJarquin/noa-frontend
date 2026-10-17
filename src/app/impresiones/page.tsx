import type { Metadata } from "next";
import { DesktopHeader } from "@/shared/components/DesktopHeader";
import { IconPrinter } from "@tabler/icons-react";
import { Footer } from "@/shared/components";
import { PageHeader } from "@/shared/components/PageHeader";
import { ServicePageIntro } from "@/features/service-requests/components/ServicePageIntro";
import { ServiceRequestForm } from "@/features/service-requests/components/ServiceRequestForm";

export const metadata: Metadata = {
  title: "Impresiones | NOA Librería",
  description:
    "Envía tus documentos (PDF, Word, Excel, imágenes) y elige color o blanco y negro. Te confirmamos por WhatsApp.",
};

export default function PrintingPage() {
  return (
    <div className="min-h-screen w-full bg-surface flex flex-col gap-6">
      <DesktopHeader />
      <PageHeader subtitle="Impresiones" />

      <div className="mx-auto flex w-full max-w-xl flex-col gap-6 px-5 pb-10">
        <ServicePageIntro
          icon={IconPrinter}
          title="Impresiones"
          description="Tareas, trabajos, documentos y fotos. Retiras en tienda cuando estén listos."
          steps={[
            "Sube tus archivos (PDF, Word, Excel, PowerPoint o imágenes).",
            "Elige color o blanco y negro, copias, papel y caras.",
            "Te escribimos por WhatsApp con el total y cuándo pasar a recoger.",
          ]}
        />

        <ServiceRequestForm
          kind="printing"
          filesLabel="Archivos a imprimir"
          notesLabel="Notas (opcional)"
          notesPlaceholder="Ej: solo las páginas 3 a 10 del PDF, engargolado."
        />
      </div>

      <Footer />
    </div>
  );
}

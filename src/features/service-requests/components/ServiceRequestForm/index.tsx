"use client";

import { useState } from "react";
import {
  ActionIcon,
  Alert,
  Button,
  Group,
  Paper,
  Stack,
  Text,
  TextInput,
  Textarea,
  ThemeIcon,
} from "@mantine/core";
import { Dropzone, type FileRejection } from "@mantine/dropzone";
import { useForm } from "@mantine/form";
import {
  IconAlertCircle,
  IconBrandWhatsapp,
  IconCircleCheck,
  IconFile,
  IconUpload,
  IconX,
} from "@tabler/icons-react";
import { createClient } from "@/shared/lib/supabase/client";
import { getWhatsAppUrl } from "@/shared/lib/whatsapp";
import { prepareServiceRequestUploads, submitServiceRequest } from "../../actions";
import {
  ALLOWED_TYPES,
  ALLOWED_TYPES_HINT,
  DEFAULT_PRINT_OPTIONS,
  MAX_FILE_SIZE,
  MAX_FILES,
  MAX_NOTES_LENGTH,
  STORAGE_BUCKET,
  type PrintOptions,
  type ServiceKind,
} from "../../constants";
import { PrintOptionsFields } from "../PrintOptionsFields";

type Step = "idle" | "uploading" | "sending" | "done";

const formatSize = (bytes: number) =>
  bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.ceil(bytes / 1024)} KB`;

const rejectionMessage = (rejections: FileRejection[]) => {
  const code = rejections[0]?.errors[0]?.code;
  if (code === "file-too-large") return "Cada archivo puede pesar hasta 20 MB.";
  if (code === "file-invalid-type") return "Ese tipo de archivo no está permitido.";
  if (code === "too-many-files") return `Puedes subir hasta ${MAX_FILES} archivos.`;
  return "No pudimos agregar ese archivo.";
};

type ServiceRequestFormProps = {
  kind: ServiceKind;
  filesLabel: string;
  notesLabel: string;
  notesPlaceholder: string;
};

export const ServiceRequestForm = ({
  kind,
  filesLabel,
  notesLabel,
  notesPlaceholder,
}: ServiceRequestFormProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [printOptions, setPrintOptions] = useState<PrintOptions>(DEFAULT_PRINT_OPTIONS);
  const [step, setStep] = useState<Step>("idle");
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    mode: "uncontrolled",
    initialValues: { name: "", phone: "", notes: "", website: "" },
    validate: {
      name: (value) => (value.trim().length < 2 ? "Escribe tu nombre" : null),
      phone: (value) =>
        /^[+\d][\d\s-]{7,19}$/.test(value.trim()) ? null : "Escribe un teléfono válido",
    },
  });

  const addFiles = (accepted: File[]) => {
    setError(null);
    setFiles((current) => {
      const next = [...current, ...accepted];
      if (next.length > MAX_FILES) setError(`Puedes subir hasta ${MAX_FILES} archivos.`);
      return next.slice(0, MAX_FILES);
    });
  };

  const handleSubmit = form.onSubmit(async (values) => {
    if (files.length === 0) {
      setError("Agrega al menos un archivo.");
      return;
    }
    setError(null);

    try {
      // 1 · ask the server for one signed upload permission per file
      setStep("uploading");
      const prepared = await prepareServiceRequestUploads(
        kind,
        files.map((file) => ({ name: file.name, size: file.size, type: file.type })),
      );
      if (!prepared.ok) throw new Error(prepared.error);

      // 2 · upload straight to Supabase Storage (files never go through our server)
      const storage = createClient().storage.from(STORAGE_BUCKET);
      await Promise.all(
        prepared.uploads.map(async ({ path, token }, index) => {
          const { error: uploadError } = await storage.uploadToSignedUrl(path, token, files[index], {
            contentType: files[index].type,
          });
          if (uploadError) throw new Error(`No se pudo subir "${files[index].name}".`);
        }),
      );

      // 3 · save the request and notify the store
      setStep("sending");
      const result = await submitServiceRequest({
        requestId: prepared.requestId,
        kind,
        customer: { name: values.name, phone: values.phone, notes: values.notes },
        printOptions: kind === "printing" ? printOptions : undefined,
        website: values.website,
      });
      if (!result.ok) throw new Error(result.error);

      setStep("done");
    } catch (submitError) {
      setStep("idle");
      setError(
        submitError instanceof Error ? submitError.message : "Algo salió mal. Intenta de nuevo.",
      );
    }
  });

  const reset = () => {
    form.reset();
    setFiles([]);
    setPrintOptions(DEFAULT_PRINT_OPTIONS);
    setStep("idle");
  };

  if (step === "done") {
    return (
      <Stack align="center" gap="sm" ta="center" className="py-8">
        <ThemeIcon size={64} radius="xl" className="bg-success-container text-success">
          <IconCircleCheck size={36} />
        </ThemeIcon>
        <Text fw={700} fz={20} className="text-primary">
          ¡Recibimos tu solicitud!
        </Text>
        <Text size="sm" c="dimmed" className="max-w-sm">
          Te escribiremos por WhatsApp para confirmar los detalles y el precio.
        </Text>
        <Group gap="sm" className="mt-2">
          <Button variant="light" color="navy" radius="md" onClick={reset}>
            Enviar otra
          </Button>
          <Button
            component="a"
            href={getWhatsAppUrl("Hola NOA Librería, acabo de enviar una solicitud desde la web.")}
            target="_blank"
            rel="noopener noreferrer"
            color="navy.9"
            radius="md"
            leftSection={<IconBrandWhatsapp size={16} />}
          >
            Escribirnos
          </Button>
        </Group>
      </Stack>
    );
  }

  const busy = step !== "idle";

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Stack gap="md">
        <div>
          <Text size="sm" fw={600} className="mb-1 text-on-surface">
            {filesLabel}
          </Text>
          <Dropzone
            onDrop={addFiles}
            onReject={(rejections) => setError(rejectionMessage(rejections))}
            accept={ALLOWED_TYPES[kind]}
            maxSize={MAX_FILE_SIZE}
            maxFiles={MAX_FILES}
            disabled={busy || files.length >= MAX_FILES}
            radius="lg"
            className="border-outline-variant bg-surface-container-low"
          >
            <Stack align="center" gap={4} className="pointer-events-none py-4" ta="center">
              <Dropzone.Accept>
                <IconUpload size={36} className="text-primary" />
              </Dropzone.Accept>
              <Dropzone.Reject>
                <IconX size={36} className="text-error" />
              </Dropzone.Reject>
              <Dropzone.Idle>
                <IconUpload size={36} stroke={1.5} className="text-secondary" />
              </Dropzone.Idle>
              <Text size="sm" fw={600} className="text-primary">
                Toca para elegir o arrastra tus archivos
              </Text>
              <Text fz={12} c="dimmed">
                {ALLOWED_TYPES_HINT[kind]} · hasta {MAX_FILES} archivos de 20 MB
              </Text>
            </Stack>
          </Dropzone>

          {files.length > 0 && (
            <Stack gap={6} className="mt-2">
              {files.map((file, index) => (
                <Paper
                  key={`${file.name}-${index}`}
                  radius="md"
                  p="xs"
                  className="flex items-center gap-2 border border-outline-variant/30 bg-surface-container-lowest"
                >
                  <IconFile size={18} className="shrink-0 text-secondary" />
                  <Text size="sm" truncate="end" className="min-w-0 flex-1">
                    {file.name}
                  </Text>
                  <Text fz={11} c="dimmed" className="shrink-0">
                    {formatSize(file.size)}
                  </Text>
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    size="sm"
                    aria-label={`Quitar ${file.name}`}
                    disabled={busy}
                    onClick={() => setFiles((current) => current.filter((_, i) => i !== index))}
                  >
                    <IconX size={14} />
                  </ActionIcon>
                </Paper>
              ))}
            </Stack>
          )}
        </div>

        {kind === "printing" && (
          <PrintOptionsFields value={printOptions} onChange={setPrintOptions} />
        )}

        <TextInput
          label="Nombre completo"
          autoComplete="name"
          required
          disabled={busy}
          key={form.key("name")}
          {...form.getInputProps("name")}
        />
        <TextInput
          label="Teléfono / WhatsApp"
          type="tel"
          autoComplete="tel"
          placeholder="8161 5603"
          required
          disabled={busy}
          key={form.key("phone")}
          {...form.getInputProps("phone")}
        />
        <Textarea
          label={notesLabel}
          placeholder={notesPlaceholder}
          autosize
          minRows={3}
          maxLength={MAX_NOTES_LENGTH}
          disabled={busy}
          key={form.key("notes")}
          {...form.getInputProps("notes")}
        />

        {/* Honeypot: hidden from people, bots fill it */}
        <TextInput
          aria-hidden
          tabIndex={-1}
          autoComplete="off"
          className="absolute -left-[9999px] h-0 w-0 overflow-hidden"
          key={form.key("website")}
          {...form.getInputProps("website")}
        />

        {error && (
          <Alert color="crimson" variant="light" icon={<IconAlertCircle size={18} />}>
            {error}
          </Alert>
        )}

        <Button type="submit" color="navy.9" radius="md" size="md" fullWidth loading={busy}>
          Enviar solicitud
        </Button>
        {busy && (
          <Text fz={12} c="dimmed" ta="center">
            {step === "uploading" ? "Subiendo archivos…" : "Enviando tu solicitud…"}
          </Text>
        )}
      </Stack>
    </form>
  );
};

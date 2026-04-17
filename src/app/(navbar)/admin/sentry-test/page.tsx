"use client";

import Button from "@/components/base/Button";
import * as Sentry from "@sentry/nextjs";
import { useState } from "react";
import { toast } from "sonner";

export default function SentryTestPage() {
  const [loading, setLoading] = useState(false);

  async function sendControlledError() {
    setLoading(true);
    try {
      const eventId = Sentry.captureException(
        new Error("Sentry test controlado: error de prueba desde /admin/sentry-test"),
        {
          tags: {
            feature: "sentry-test",
            source: "manual-test-button",
          },
          extra: {
            note: "Evento de prueba generado manualmente por el equipo",
          },
        }
      );

      Sentry.captureMessage("Sentry test controlado: mensaje de prueba", "warning");

      // Esperar a que el SDK envíe la cola
      await Sentry.flush(4000);

      toast.success(
        eventId
          ? `Evento enviado a Sentry. Event ID: ${eventId}`
          : "Evento de prueba enviado a Sentry"
      );
    } catch {
      toast.error("No se pudo enviar el evento de prueba");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full p-4 sm:p-5 rounded-md border border-disabled flex flex-col gap-4">
      <h4 className="font-semibold text-lg sm:text-xl text-primary-900">
        Prueba de Sentry
      </h4>
      <p className="text-sm text-stone-600">
        Esta página permite enviar eventos controlados de prueba al panel de Sentry.
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button onClick={sendControlledError} loading={loading} className="w-full sm:w-auto">
          Enviar error de prueba
        </Button>
      </div>

      <p className="text-xs text-stone-500">
        Después de enviar, revisa Sentry en Issues del proyecto y filtra por los tags{" "}
        <b>feature:sentry-test</b> y <b>source:manual-test-button</b>.
      </p>
    </div>
  );
}


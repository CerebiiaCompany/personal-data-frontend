"use client";

import Button from "@/components/base/Button";
import { Icon } from "@iconify/react/dist/iconify.js";

interface ReauthSessionModalProps {
  isOpen: boolean;
}

export default function ReauthSessionModal({ isOpen }: ReauthSessionModalProps) {
  if (!isOpen) return null;

  const handleReauth = () => {
    if (typeof window === "undefined") return;
    const callbackUrl = `${window.location.pathname}${window.location.search}`;
    window.location.href = `/login?callback_url=${encodeURIComponent(callbackUrl)}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-start gap-3">
          <div className="rounded-full bg-amber-100 p-2">
            <Icon icon="tabler:alert-triangle" className="text-xl text-amber-700" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-primary-900">Sesion expirada</h3>
            <p className="mt-1 text-sm text-stone-700">
              Tu sesion expiro, inicia sesion de nuevo para continuar con el proceso.
            </p>
          </div>
        </div>

        <Button className="w-full" onClick={handleReauth}>
          Iniciar sesion
        </Button>
      </div>
    </div>
  );
}

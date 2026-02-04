"use client";

import Button from "@/components/base/Button";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import LogoSquaredLight from "@public/logo-squared-light.svg";

export default function SinAccesoPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-primary-900 via-primary-800 to-primary-950 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
        <div className="mb-6 flex justify-center">
          <Image
            src={LogoSquaredLight}
            alt="Logo Cerebiia"
            width={80}
            height={80}
            className="opacity-80"
          />
        </div>
        
        <div className="mb-6 flex justify-center">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center">
            <Icon 
              icon="tabler:lock-access" 
              className="text-5xl text-red-500"
            />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          Acceso Restringido
        </h1>
        
        <p className="text-gray-600 mb-6">
          No tienes los permisos necesarios para acceder a esta página. 
          Si crees que esto es un error, contacta al administrador de tu empresa.
        </p>

        <div className="flex flex-col gap-3">
          <Button 
            onClick={() => router.back()}
            hierarchy="secondary"
            className="w-full"
            startContent={<Icon icon="tabler:arrow-left" className="text-xl" />}
          >
            Volver atrás
          </Button>
          
          <Button 
            onClick={() => router.push("/admin")}
            className="w-full"
            startContent={<Icon icon="heroicons:home" className="text-xl" />}
          >
            Ir al inicio
          </Button>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            <Icon icon="tabler:info-circle" className="inline mr-1" />
            Para obtener más permisos, habla con tu administrador
          </p>
        </div>
      </div>
    </div>
  );
}

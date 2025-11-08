"use client";

import CreateCompanyAreaForm from "@/components/administration/CreateCompanyAreaForm";
import CreateCompanyUserForm from "@/components/administration/CreateCompanyUserForm";
import SectionHeader from "@/components/base/SectionHeader";
import CreateCompanyForm from "@/components/superadmin/companies/CreateCompanyForm";
import CreatePaymentForm from "@/components/superadmin/payments/CreatePaymentForm";
import { useSessionStore } from "@/store/useSessionStore";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CreatePaymentPage() {
  const user = useSessionStore((store) => store.user);
  const router = useRouter();

  return (
    <div className="flex flex-col relative">
      <SectionHeader />

      {/* Content */}
      <div className="px-8 py-6 flex flex-col gap-6 items-center">
        <header className="w-full flex gap-2 justify-between items-center">
          <div className="flex gap-2">
            <Link
              href={"/superadmin/pagos"}
              className="flex items-center gap-2 text-primary-900 font-medium text-sm"
            >
              <div className="w-fit bg-primary-900 rounded-md text-white p-1">
                <Icon icon={"tabler:chevron-left"} className="text-2xl" />
              </div>
              Volver
            </Link>
          </div>
          <h4 className="font-semibold text-xl text-primary-900 w-full text-center">
            Crear pago
          </h4>
        </header>
        <div className="w-full p-4 rounded-md border border-disabled flex flex-col gap-10 items-center">
          <CreatePaymentForm />
        </div>
      </div>
    </div>
  );
}

"use client";

import CreateCompanyUserForm from "@/components/administration/CreateCompanyUserForm";
import SectionHeader from "@/components/base/SectionHeader";
import LoadingCover from "@/components/layout/LoadingCover";
import { useSessionStore } from "@/store/useSessionStore";
import { Icon } from "@iconify/react";
import Link from "next/link";

export default function UpdateProfilePage() {
  const { loading, user, error } = useSessionStore();

  return (
    <div className="flex flex-col relative">
      <SectionHeader />

      {/* Content */}
      <div className="px-8 py-6 flex flex-col gap-6 h-full">
        <div className="w-full p-4 rounded-md border border-disabled flex flex-col gap-10 items-center relative">
          <header className="w-full flex gap-2 justify-between items-center">
            <div className="flex gap-2">
              <Link
                href={"/perfil"}
                className="flex items-center gap-2 text-primary-900 font-medium text-sm"
              >
                <div className="w-fit bg-primary-900 rounded-md text-white p-1">
                  <Icon icon={"tabler:chevron-left"} className="text-2xl" />
                </div>
                Volver
              </Link>
            </div>
            <h4 className="font-semibold text-xl text-primary-900 w-full text-center">
              Actualizar Perfil
            </h4>
          </header>

          {loading && (
            <div className="min-h-20 relative w-full">
              <LoadingCover />
            </div>
          )}
          {error && <p>{error}</p>}
          {user && (
            <CreateCompanyUserForm
              userId={user._id}
              callbackUrl="/perfil"
              initialValues={{
                ...user,
                companyUserData: {
                  ...user.companyUserData!,
                  companyAreaId: user.companyUserData!.companyArea._id,
                },
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

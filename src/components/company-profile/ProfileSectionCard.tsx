"use client";

import React from "react";
import { Icon } from "@iconify/react";
import Button from "@/components/base/Button";

interface Props {
  icon: string;
  title: string;
  description: string;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  children: React.ReactNode;
}

const ProfileSectionCard = ({
  icon,
  title,
  description,
  onSubmit,
  loading,
  children,
}: Props) => {
  return (
    <section className="rounded-2xl border border-[#E8EDF7] bg-white p-5 shadow-[0_2px_12px_rgba(15,35,70,0.04)] sm:p-6">
      <div className="flex items-start gap-3 mb-5">
        <div className="rounded-lg border border-[#E3EAF8] bg-[#F0F4FC] p-2 text-[#3357A5] shrink-0">
          <Icon icon={icon} className="text-xl" />
        </div>
        <div>
          <h2 className="text-[16px] font-bold text-[#1A2B5B]">{title}</h2>
          <p className="text-[13px] text-[#64748B] mt-0.5">{description}</p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        {children}
        <div className="flex justify-end pt-4 border-t border-[#E8EDF7]">
          <Button hierarchy="primary" type="submit" loading={loading}>
            Guardar cambios
          </Button>
        </div>
      </form>
    </section>
  );
};

export default ProfileSectionCard;

import AdministrationPageSelector from "@/components/administration/AdministrationPageSelector";
import CompanyUsersTable from "@/components/administration/CompanyUsersTable";
import Button from "@/components/base/Button";
import SectionHeader from "@/components/base/SectionHeader";
import CheckRole from "@/components/checkers/CheckRole";
import DashboardContent from "@/components/layout/DashboardContent";
import DashboardNavbar from "@/components/layout/DashboardNavbar";
import { Icon } from "@iconify/react/dist/iconify.js";
import { error } from "console";
import React from "react";

export default function AdministrationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col relative">
      <SectionHeader />

      {/* Content */}
      <div className="px-8 py-6 flex flex-col gap-6 h-full">
        <header className="w-full flex flex-col gap-2 items-start">
          <AdministrationPageSelector />
        </header>

        {children}
      </div>
    </div>
  );
}

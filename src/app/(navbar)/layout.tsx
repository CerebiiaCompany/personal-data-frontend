import CheckRole from "@/components/checkers/CheckRole";
import LoadCloudAppSettings from "@/components/checkers/LoadCloudAppSettings";
import DashboardContent from "@/components/layout/DashboardContent";
import DashboardNavbar from "@/components/layout/DashboardNavbar";
import React from "react";

export default function NavbarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <CheckRole />
      <LoadCloudAppSettings />
      <div className="flex min-h-0 min-w-0 flex-1 flex-row">
        <DashboardNavbar />
        <DashboardContent>{children}</DashboardContent>
      </div>
    </>
  );
}

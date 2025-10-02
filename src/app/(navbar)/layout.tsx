import CheckRole from "@/components/checkers/CheckRole";
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
      <DashboardNavbar />
      <DashboardContent>{children}</DashboardContent>
    </>
  );
}

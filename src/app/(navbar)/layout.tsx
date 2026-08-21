import CheckRole from "@/components/checkers/CheckRole";
import LoadCloudAppSettings from "@/components/checkers/LoadCloudAppSettings";
import DashboardContent from "@/components/layout/DashboardContent";
import DashboardNavbar from "@/components/layout/DashboardNavbar";
import InitialSetupGate from "@/components/onboarding/InitialSetupGate";
import OnboardingChecklistGate from "@/components/onboarding/OnboardingChecklistGate";
import { ModuleTourProvider } from "@/components/tour/ModuleTourContext";
import React from "react";

export default function NavbarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ModuleTourProvider>
      <CheckRole />
      <LoadCloudAppSettings />
      <InitialSetupGate>
        <OnboardingChecklistGate />
        <div className="flex min-h-0 min-w-0 flex-1 flex-row">
          <DashboardNavbar />
          <DashboardContent>{children}</DashboardContent>
        </div>
      </InitialSetupGate>
    </ModuleTourProvider>
  );
}

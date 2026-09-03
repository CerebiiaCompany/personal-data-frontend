import { WizardProvider } from "@/contexts/WizardContext";
import { ErrorProvider } from "@/contexts/ErrorContext";

export default function WizardLayout({ children }: { children: React.ReactNode }) {
  return (
    <WizardProvider>
      <ErrorProvider>{children}</ErrorProvider>
    </WizardProvider>
  );
}

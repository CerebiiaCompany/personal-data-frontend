import { WizardProvider } from "@/contexts/WizardContext";
import { ErrorProvider } from "@/contexts/ErrorContext";

export default function WizardLayout({ children }: { children: React.ReactNode }) {
  return (
    <WizardProvider>
      <ErrorProvider>
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">{children}</div>
      </ErrorProvider>
    </WizardProvider>
  );
}

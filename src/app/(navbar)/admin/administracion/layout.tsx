import AdministrationPageSelector from "@/components/administration/AdministrationPageSelector";
import SectionHeader from "@/components/base/SectionHeader";

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

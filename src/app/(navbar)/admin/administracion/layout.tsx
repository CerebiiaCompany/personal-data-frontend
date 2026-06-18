import AdministrationNavSlot from "./AdministrationNavSlot";
import AdministrationAnimatedContent from "./AdministrationAnimatedContent";

export default function AdministrationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col bg-[#F8FAFC]">
      <AdministrationNavSlot />
      <AdministrationAnimatedContent>{children}</AdministrationAnimatedContent>
    </div>
  );
}

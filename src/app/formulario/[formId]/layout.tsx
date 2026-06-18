import AnimatedRoute from "@/components/layout/AnimatedRoute";

export default function PublicFormLegacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AnimatedRoute className="flex min-h-0 min-w-0 flex-1 flex-col">
      {children}
    </AnimatedRoute>
  );
}

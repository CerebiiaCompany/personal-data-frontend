import AnimatedRoute from "@/components/layout/AnimatedRoute";

export default function PublicFormLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AnimatedRoute stagger={false} className="flex min-h-0 min-w-0 flex-1 flex-col">
      {children}
    </AnimatedRoute>
  );
}

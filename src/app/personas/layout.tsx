import type { Metadata } from "next";
import PersonasLayoutShell from "@/components/personas/PersonasLayoutShell";

export const metadata: Metadata = {
  title: "Portal del titular | Cerebiia",
  description:
    "Ejerce tus derechos ARCO sobre tus datos personales tratados por empresas afiliadas.",
};

export default function PersonasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PersonasLayoutShell>{children}</PersonasLayoutShell>;
}

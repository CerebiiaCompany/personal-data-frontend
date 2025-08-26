import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import DashboardNavbar from "@/components/layout/DashboardNavbar";
import DashboardContent from "@/components/layout/DashboardContent";
import GridWrapper from "@/components/layout/GridWrapper";

const interFont = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cerebiia Plataforma de Datos",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${interFont.variable} antialiased font-sans bg-white h-dvh`}
      >
        <GridWrapper>
          <DashboardNavbar />
          <DashboardContent>{children}</DashboardContent>
        </GridWrapper>
      </body>
    </html>
  );
}

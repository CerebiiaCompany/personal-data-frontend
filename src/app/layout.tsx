import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import GridWrapper from "@/components/layout/GridWrapper";
import { Toaster } from "sonner";
import CheckActiveSession from "@/components/checkers/CheckActiveSession";

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
        <Toaster />
        <GridWrapper>
          <CheckActiveSession />
          {children}
        </GridWrapper>
      </body>
    </html>
  );
}

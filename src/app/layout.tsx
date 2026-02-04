import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import GridWrapper from "@/components/layout/GridWrapper";
import { Toaster } from "sonner";
import CheckActiveSession from "@/components/checkers/CheckActiveSession";
import { ConfirmProvider } from "@/components/dialogs/ConfirmProvider";
import { AuthHydrator } from "@/providers/AuthHydrator";

const interFont = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cerebiia Plataforma de Datos",
  description: "",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
    ],
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
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
        <AuthHydrator />
        <GridWrapper>
          <CheckActiveSession />
          <ConfirmProvider>{children}</ConfirmProvider>
        </GridWrapper>
      </body>
    </html>
  );
}

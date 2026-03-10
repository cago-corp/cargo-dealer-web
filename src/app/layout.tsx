import type { Metadata } from "next";
import { QueryProvider } from "@/shared/lib/query/query-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cargo Dealer Web",
  description: "Dealer workflow shell for the Cargo web platform.",
};

type RootLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="ko">
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}

import localFont from "next/font/local";
import type { Metadata } from "next";
import { QueryProvider } from "@/shared/lib/query/query-provider";
import "./globals.css";

const pretendard = localFont({
  src: "./fonts/PretendardVariable.ttf",
  display: "swap",
  variable: "--font-pretendard",
  weight: "100 900",
});

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
      <body className={pretendard.variable}>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}

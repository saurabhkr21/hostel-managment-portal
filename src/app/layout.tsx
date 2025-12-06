import { Outfit } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import AIChatWidget from "@/components/common/AIChatWidget";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata = {
  title: "Hostel Management System",
  description: "Premium Hostel Management Solution",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={outfit.className}>
        <Providers>
          {children}
          <AIChatWidget />
        </Providers>
      </body>
    </html>
  );
}

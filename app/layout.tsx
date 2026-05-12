import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Admin — Creative Agency CMS",
  description: "Admin panel for creative agency portfolio",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-satoshi bg-bg-primary text-text-primary antialiased">
        {children}
      </body>
    </html>
  );
}

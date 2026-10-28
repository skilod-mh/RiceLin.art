import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RiceLin — Rice your Linux",
  description: "Linux rices, customization tutorials, dotfiles, and community help.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

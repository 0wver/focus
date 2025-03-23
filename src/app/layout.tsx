import type { Metadata } from "next";
import "./globals.css";
import { Providers } from './providers';
import StarBackground from "./components/ui/StarBackground";

export const metadata: Metadata = {
  title: "Focus",
  description: "Minimalist habit tracker for productivity",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen font-sans transition-colors duration-300 bg-background-light dark:bg-[#010101] text-text-light dark:text-text-dark">
        <div className="fixed inset-0 bg-gradient-mesh -z-10 dark:bg-black/20" />
        <div className="fixed inset-0 bg-pattern -z-10 opacity-20" />
        <StarBackground />
        <div className="fixed w-[500px] h-[500px] rounded-full bg-gradient-radial from-primary-500/15 to-transparent -top-40 -right-40 blur-3xl -z-10" />
        <div className="fixed w-[600px] h-[600px] rounded-full bg-gradient-radial from-primary-700/15 to-transparent -bottom-40 -left-40 blur-3xl -z-10" />
        <Providers>
          <div className="relative z-10">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}

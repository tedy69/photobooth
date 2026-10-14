import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { LanguageProvider } from "@/hooks/use-language";
import Header from "@/components/header";
import Footer from "@/components/footer";
export const metadata: Metadata = {
  title: {
    default: "Photo Booth | A little photo studio",
    template: "%s | Photo Booth",
  },
  description:
    "Take photos, arrange a photo strip, add stickers, backgrounds and frames, and download your composition. Photo editing stays in your browser.",
  metadataBase: new URL("https://photobooth.tedyfazrin.com"),
  openGraph: {
    title: "Photo Booth | A little photo studio",
    description: "Take photos and make a photo strip of your own.",
    url: "https://photobooth.tedyfazrin.com",
    siteName: "Photo Booth",
    type: "website",
    images: [{ url: "/og-image.svg", width: 1200, height: 630 }],
  },
  icons: { icon: "/favicon.svg", apple: "/apple-touch-icon.png" },
  manifest: "/manifest.json",
};
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f3ec" },
    { media: "(prefers-color-scheme: dark)", color: "#20231f" },
  ],
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <LanguageProvider>
            <Header />
            <main id="main-content">{children}</main>
            <Footer />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

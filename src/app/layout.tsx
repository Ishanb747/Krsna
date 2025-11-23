import type { Metadata } from "next";
import { Fredoka } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { TimerProvider } from "@/contexts/TimerContext";
import { SoundProvider } from "@/contexts/SoundContext";
import GlobalBackground from "@/components/GlobalBackground";

const fredoka = Fredoka({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"] });

export const metadata: Metadata = {
  title: "Krsna - Productivity App",
  description: "A comprehensive productivity system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={fredoka.className}>
        <ThemeProvider>
          <SoundProvider>
            <TimerProvider>
              <AuthProvider>
                <GlobalBackground />
                {children}
              </AuthProvider>
            </TimerProvider>
          </SoundProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../hooks/useAuth";
import { ToastProvider } from "../hooks/useToast";
import Toast from "../components/Toast";
import ErrorBoundary from "../components/ErrorBoundary";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Task Management App",
  description: "Manage your tasks effectively.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={inter.className} suppressHydrationWarning>
        <Script id="theme-script" strategy="beforeInteractive">
          {`
            try {
              if (localStorage.getItem('theme') === 'dark') {
                document.documentElement.classList.add('dark');
              } else {
                document.documentElement.classList.remove('dark');
              }
            } catch (_) {}
          `}
        </Script>
        <ErrorBoundary>
          <ToastProvider>
            <AuthProvider>
              {children}
              <Toast />
            </AuthProvider>
          </ToastProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}

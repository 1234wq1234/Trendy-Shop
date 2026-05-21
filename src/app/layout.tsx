"use client";

import { Toaster } from "react-hot-toast";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
import { AppStoreProvider } from "@/store/app-store";
import { useAppStore } from "@/store/app-store";
import { useHydrateAuth } from "@/hooks/use-hydrate-auth";
import { apiGetCart, apiGetFavorites } from "@/lib/api/client";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

function LayoutShell({ children }: { children: React.ReactNode }) {
  useHydrateAuth();
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen, token, setCartCount, setFavoriteCount } = useAppStore();
  const isAuthPage = pathname === "/login" || pathname === "/register" || pathname === "/forgot-password";

  useEffect(() => {
    if (isAuthPage) setSidebarOpen(false);
  }, [isAuthPage, setSidebarOpen]);

  useEffect(() => {
    if (!token) {
      setCartCount(0);
      setFavoriteCount(0);
      return;
    }
    apiGetCart(token).then((cart) => setCartCount((cart.products || []).length)).catch(() => setCartCount(0));
    apiGetFavorites(token).then((list) => setFavoriteCount((list || []).length)).catch(() => setFavoriteCount(0));
  }, [token, setCartCount, setFavoriteCount]);

  return (
    <>
      <Navbar />
      {!isAuthPage ? <Sidebar /> : null}
      <main className={`mx-auto w-full max-w-[1700px] px-3 pb-6 pt-20 ${!isAuthPage && sidebarOpen ? "md:pl-80" : "md:px-6"}`}>{children}</main>
      <Toaster position="top-right" />
    </>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body>
        <AppStoreProvider>
          <LayoutShell>{children}</LayoutShell>
        </AppStoreProvider>
      </body>
    </html>
  );
}

"use client";

import { createContext, useContext, useMemo, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { Role } from "@/lib/types";

interface AppStoreContextType {
  token: string | null;
  role: Role | null;
  setAuth: (token: string | null, role: Role | null) => void;
  sidebarOpen: boolean;
  setSidebarOpen: Dispatch<SetStateAction<boolean>>;
  search: string;
  setSearch: (value: string) => void;
  selectedBrand: string;
  setSelectedBrand: (brand: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  cartCount: number;
  setCartCount: Dispatch<SetStateAction<number>>;
  favoriteCount: number;
  setFavoriteCount: Dispatch<SetStateAction<number>>;
}

const AppStoreContext = createContext<AppStoreContextType | null>(null);

export function AppStoreProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("Tümü");
  const [cartCount, setCartCount] = useState(0);
  const [favoriteCount, setFavoriteCount] = useState(0);

  const setAuth = (nextToken: string | null, nextRole: Role | null) => {
    setToken(nextToken);
    setRole(nextRole);
    if (typeof window !== "undefined") {
      if (nextToken) localStorage.setItem("token", nextToken);
      else localStorage.removeItem("token");
      if (nextRole) localStorage.setItem("role", nextRole);
      else localStorage.removeItem("role");
    }
  };

  const value = useMemo(
    () => ({ token, role, setAuth, sidebarOpen, setSidebarOpen, search, setSearch, selectedBrand, setSelectedBrand, selectedCategory, setSelectedCategory }),
    [token, role, sidebarOpen, search, selectedBrand, selectedCategory]
  );
  const valueWithCounts = useMemo(() => ({ ...value, cartCount, setCartCount, favoriteCount, setFavoriteCount }), [value, cartCount, favoriteCount]);

  return <AppStoreContext.Provider value={valueWithCounts}>{children}</AppStoreContext.Provider>;
}

export function useAppStore() {
  const ctx = useContext(AppStoreContext);
  if (!ctx) throw new Error("useAppStore AppStoreProvider içinde kullanılmalı.");
  return ctx;
}

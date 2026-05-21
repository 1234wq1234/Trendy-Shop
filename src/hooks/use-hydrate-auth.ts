"use client";

import { useEffect } from "react";
import { useAppStore } from "@/store/app-store";

export function useHydrateAuth() {
  const { setAuth } = useAppStore();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role") as "ADMIN" | "USER" | null;
    if (token && role) setAuth(token, role);
  }, [setAuth]);
}
 
"use client";

import { Brush, House, Laptop, LogOut, Menu, ReceiptText, Shirt, ShoppingBag, Watch, X } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useAppStore } from "@/store/app-store";

const items = [
  { name: "Tümü", icon: Brush },
  { name: "Kozmetik", icon: Brush },
  { name: "Giyim", icon: Shirt },
  { name: "Çanta ve Ayakkabı", icon: ShoppingBag },
  { name: "Teknolojik", icon: Laptop },
  { name: "Ev Eşyası", icon: House },
  { name: "Saat ve Aksesuar", icon: Watch }
];

export function Sidebar() {
  const { sidebarOpen, selectedCategory, setSelectedCategory, setSidebarOpen, role, setAuth } = useAppStore();

  return (
    <>
      {!sidebarOpen ? (
        <button onClick={() => setSidebarOpen(true)} className="fixed left-1 top-[62px] z-40 p-1 text-black">
          <Menu className="h-5 w-5" />
        </button>
      ) : null}
      <aside className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} fixed left-0 top-0 z-40 h-screen w-72 border-r bg-white pt-20 transition-transform`}>
        <div className="mb-3 flex items-center justify-between px-4">
          <h2 className="text-sm font-bold text-blue-700">Kategoriler</h2>
          <button onClick={() => setSidebarOpen(false)} className="rounded-md border p-1 text-blue-700">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-2 px-3 pb-24">
          {items.map((item) => (
            <button
              key={item.name}
              onClick={() => setSelectedCategory(item.name)}
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm ${selectedCategory === item.name ? "bg-blue-100 text-blue-700" : "hover:bg-blue-50"}`}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </button>
          ))}
          {role === "ADMIN" ? (
            <>
              <Link href="/admin" className="mt-4 flex w-full items-center justify-center rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white">
                Panel
              </Link>
              <Link href="/admin/orders" className="mt-2 flex w-full items-center justify-center rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700">
                Sipariş Yönetimi
              </Link>
            </>
          ) : null}
          {role === "USER" ? (
            <Link
              href="/orders"
              onClick={() => setSidebarOpen(false)}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700"
            >
              <ReceiptText className="h-4 w-4" />
              Sipariş Geçmişi ve Takip
            </Link>
          ) : null}
        </div>
        <div className="absolute bottom-4 left-3 right-3">
          <button
            onClick={() => {
              setAuth(null, null);
              toast.success("Çıkış yapılmıştır.", { duration: 2000, style: { background: "#16a34a", color: "#fff" } });
            }}
            className="group flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 transition hover:-translate-y-0.5 hover:bg-red-100"
          >
            <LogOut className="h-4 w-4 transition group-hover:rotate-12" />
            Çıkış Yap
          </button>
        </div>
      </aside>
    </>
  );
}

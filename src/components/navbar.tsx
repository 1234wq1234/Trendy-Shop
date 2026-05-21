"use client";

import { ChevronDown, Heart, LogIn, Search, ShoppingCart, UserPlus, UserRound } from "lucide-react";
import Link from "next/link";
import { useAppStore } from "@/store/app-store";

export function Navbar() {
  const { search, setSearch, cartCount, favoriteCount } = useAppStore();

  return ( 
    <header className="fixed top-0 z-50 w-full border-b bg-white">
      <div className="flex items-center gap-3 px-3 py-3 md:px-4">
        <Link href="/" className="text-lg font-bold text-blue-700">Trendy Shop</Link>
        <div className="mx-3 flex-1">
          <div className="flex items-center rounded-full border border-blue-200 bg-slate-50 px-3 py-2">
            <Search className="mr-2 h-4 w-4 text-blue-700" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Ürün, marka ara..."
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>
        </div>
        <div className="group relative">
          <button className="flex items-center gap-1 rounded-xl border px-3 py-2 text-sm font-medium transition hover:bg-blue-50">
            <UserRound className="h-4 w-4 text-blue-700" /> Hesabım <ChevronDown className="h-3.5 w-3.5 text-slate-500 transition group-hover:rotate-180" />
          </button>
          <div className="invisible absolute right-0 top-11 z-50 w-56 translate-y-2 rounded-2xl border border-slate-200 bg-white p-2 opacity-0 shadow-xl transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
            <p className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Üyelik</p>
            <Link href="/login" className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-blue-50 hover:text-blue-700">
              <LogIn className="h-4 w-4" /> Giriş Yap
            </Link>
            <Link href="/register" className="mt-1 flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-blue-50 hover:text-blue-700">
              <UserPlus className="h-4 w-4" /> Üye Ol
            </Link>
            <div className="my-2 border-t" />
            <p className="px-3 pb-2 text-xs text-slate-500">Siparişlerin ve favorilerin için giriş yap.</p>
          </div>
        </div>
        <Link href="/favorites" className="relative rounded-xl border p-2 transition hover:scale-110">
          <Heart className="h-5 w-5 text-blue-700 hover:text-red-500" />
          {favoriteCount > 0 ? <span className="absolute -right-1 -top-1 min-w-4 rounded-full bg-blue-600 px-1 text-center text-[10px] text-white">{favoriteCount}</span> : null}
        </Link>
        <Link href="/cart" className="relative rounded-xl border p-2 transition hover:scale-110">
          <ShoppingCart className="h-5 w-5 text-blue-700" />
          {cartCount > 0 ? <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-blue-600 px-1 text-center text-xs text-white">{cartCount}</span> : null}
        </Link>
      </div>
    </header>
  );
}

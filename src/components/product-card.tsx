"use client";

import Image from "next/image";
import Link from "next/link";
import { Product } from "@/lib/types";

export function ProductCard({ product }: { product: Product }) {
  return (
    <div className="group rounded-2xl border bg-white p-4 shadow-sm">
      <div className="relative mb-3 h-56 overflow-hidden rounded-xl bg-slate-100">
        <Image src={product.image} alt={product.title} fill className="object-cover transition duration-300 group-hover:scale-105" />
      </div>
      <div className="space-y-2">
        <p className="text-xs text-blue-700">{product.brand}</p>
        <h3 className="line-clamp-2 font-semibold">{product.title}</h3>
        <p className="font-bold text-blue-700">{product.price} TL</p>
        <div className="flex gap-2">
          <Link href={`/product/${product.id}`} className="flex-1 rounded-lg border px-3 py-2 text-center text-sm transition hover:bg-blue-50">Detay</Link>
          <div className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-center text-sm font-semibold text-white">Sepete Ekle</div>
        </div>
      </div>
    </div>
  );
}

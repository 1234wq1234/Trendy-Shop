"use client";

import Image from "next/image";
import { Heart } from "lucide-react";
import { Product } from "@/lib/types";

const brands = [
  { value: "all", label: "Tümü" },
  { value: "nike", label: "Nike" },
  { value: "adidas", label: "Adidas" },
  { value: "apple", label: "Apple" },
  { value: "samsung", label: "Samsung" },
  { value: "zara", label: "Zara" },
  { value: "lcw", label: "LCW" },
  { value: "mango", label: "Mango" },
  { value: "casio", label: "Casio" },
  { value: "lenova", label: "Lenova" },
  { value: "altinbas", label: "Altınbaş" },
  { value: "rolex", label: "Rolex" },
  { value: "lancom", label: "Lancom" },
  { value: "bioderma", label: "Bioderma" },
  { value: "vogue", label: "Vogue" },
  { value: "tommy", label: "Tommy" }
];

export function BrandSlider({ selected, onSelect }: { selected: string; onSelect: (brand: string) => void }) {
  return (
    <div className="overflow-x-auto py-3">
      <div className="mx-auto flex min-w-max w-fit gap-3">
        {brands.map((brand) => (
          <button
            key={brand.value}
            onClick={() => onSelect(brand.value)}
            className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-full border px-2 text-center text-[11px] font-semibold leading-tight ${
              selected === brand.value ? "border-blue-600 bg-blue-50 text-blue-700" : "bg-white text-slate-700"
            }`}
          >
            {brand.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function ProductSlider({ products, onProductClick, onFavorite, favoriteIds, onAddCart }: {
  products: Product[];
  onProductClick: (id: string) => void;
  onFavorite: (id: string) => void;
  favoriteIds: string[];
  onAddCart: (id: string) => void;
}) {
  if (!products.length) return null;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {products.map((product) => (
        <div key={product.id} className="relative h-[430px] w-full rounded-2xl border border-slate-200 bg-white p-3">
          <button
            onClick={() => onFavorite(product.id)}
            className="absolute right-4 top-4 z-10 rounded-full border border-slate-200 bg-white p-2 shadow-sm transition hover:border-red-200 hover:bg-red-50"
          >
            <Heart className={`h-4 w-4 transition ${favoriteIds.includes(product.id) ? "fill-red-500 text-red-500" : "text-slate-500 hover:text-red-500"}`} />
          </button>
          <button onClick={() => onProductClick(product.id)} className="block w-full">
            <div className="relative h-60 w-full overflow-hidden rounded-xl border bg-slate-50">
              <div className="relative h-full w-full p-2">
                <Image src={product.image} alt={product.title} fill className="object-contain" />
              </div>
            </div>
          </button>
          <p className="mt-3 text-xs text-slate-500">{product.brand}</p>
          <h3 className="line-clamp-2 min-h-10 text-sm font-semibold">{product.title}</h3>
          <p className="mt-1 font-bold text-blue-700">{product.price} TL</p>
          <button onClick={() => onAddCart(product.id)} className="mt-2 w-full rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:scale-[1.02]">
            Sepete Ekle
          </button>
        </div>
      ))}
    </div>
  );
}

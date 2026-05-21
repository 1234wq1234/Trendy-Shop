"use client";

import Image from "next/image";
import { Heart, Star } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { apiAddCart, apiGetFavorites, apiGetProducts, apiToggleFavorite } from "@/lib/api/client";
import { Product } from "@/lib/types";
import { useAppStore } from "@/store/app-store";

function getProductRating(productId: string) {
  const hash = productId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const rating = 4 + (hash % 10) / 10; // 4.0 - 4.9 arasi
  const reviewCount = 40 + (hash % 360);
  return { rating, reviewCount };
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { token, setCartCount, setFavoriteCount } = useAppStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    apiGetProducts({}).then((all) => setProduct(all.filter((p) => p.image.startsWith("/images/")).find((p) => p.id === id) || null));
  }, [id]);

  useEffect(() => {
    if (!token || !id) {
      setIsFavorite(false);
      return;
    }

    apiGetFavorites(token)
      .then((list) => {
        const ids = list.map((f: { productId: string }) => f.productId);
        setIsFavorite(ids.includes(id));
        setFavoriteCount(ids.length);
      })
      .catch(() => {
        // Favori bilgisi alinamazsa sayfayi bozma.
      });
  }, [token, id, setFavoriteCount]);

  if (!product) return <p>Yükleniyor...</p>;
  const { rating, reviewCount } = getProductRating(product.id);

  return (
    <div className="grid gap-6 rounded-2xl border bg-white p-6 lg:grid-cols-2">
      <div className="relative h-96 overflow-hidden rounded-xl border bg-slate-50">
        <div className="relative h-full w-full p-2">
          <Image src={product.image} alt={product.title} fill className="object-contain transition hover:scale-[1.02]" />
        </div>
      </div>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">{product.title}</h1>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <div className="flex items-center gap-0.5 text-amber-400">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star
                key={index}
                className={`h-4 w-4 ${index < Math.round(rating) ? "fill-amber-400" : "fill-transparent"}`}
              />
            ))}
          </div>
          <span className="font-semibold text-slate-700">{rating.toFixed(1)}</span>
          <span>({reviewCount} Değerlendirme)</span>
        </div>
        <p className="text-slate-600">{product.description}</p>
        <p className="text-2xl font-bold text-blue-700">{product.price} TL</p>
        <p>Renk: {product.color || "-"}</p>
        <p>Beden: {product.size || "-"}</p>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={async () => {
              if (!token) {
                toast.error("Sepete eklemek için giriş yapın");
                return;
              }
              try {
                await apiAddCart(token, product.id, 1);
                setCartCount((c) => c + 1);
                toast.success("Sepete başarıyla eklendi", { duration: 2000, style: { background: "#16a34a", color: "#fff" } });
              } catch (error) {
                toast.error(error instanceof Error ? error.message : "Sepete eklenemedi");
              }
            }}
            className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:scale-105 hover:bg-blue-700"
          >
            Sepete Ekle
          </button>
          <button
            onClick={async () => {
              if (!token) {
                toast.error("Favoriye eklemek için giriş yapın");
                router.push("/login");
                return;
              }
              try {
                await apiToggleFavorite(token, product.id, isFavorite);
                setIsFavorite((prev) => !prev);
                setFavoriteCount((count) => (isFavorite ? Math.max(0, count - 1) : count + 1));
                toast.success(isFavorite ? "Favorilerden çıkarıldı" : "Favorilere eklendi");
              } catch (error) {
                toast.error(error instanceof Error ? error.message : "Favori güncellenemedi");
              }
            }}
            className={`flex items-center gap-2 rounded-lg border px-5 py-3 font-semibold transition ${
              isFavorite ? "border-red-200 bg-red-50 text-red-600 hover:bg-red-100" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            <Heart className={`h-4 w-4 ${isFavorite ? "fill-red-500 text-red-500" : "text-slate-500"}`} />
            {isFavorite ? "Favoriden Çıkar" : "Favorilere Ekle"}
          </button>
        </div>
      </div>
    </div>
  );
}

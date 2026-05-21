"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { apiRegister } from "@/lib/api/client";
import { useAppStore } from "@/store/app-store";

const schema = z.object({ email: z.string().email(), password: z.string().min(4), isAdmin: z.boolean().optional() });
type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAppStore();
  const { register, handleSubmit } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      const result = await apiRegister({ email: data.email, password: data.password, role: data.isAdmin ? "ADMIN" : "USER" });
      setAuth(result.token, result.user.role);
      router.push(result.user.role === "ADMIN" ? "/admin" : "/");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Kayıt başarısız");
    }
  };

  return (
    <section className="mx-auto grid max-w-5xl gap-6 rounded-3xl border bg-white p-4 shadow-sm md:grid-cols-2 md:p-8">
      <div className="hidden rounded-2xl bg-gradient-to-br from-sky-500 to-blue-700 p-8 text-white md:block">
        <h2 className="text-3xl font-bold">Yeni Hesap Olustur</h2>
        <p className="mt-3 text-sm text-blue-50">Bir dakikada kaydol, alisverise hemen basla.</p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-2xl border p-6">
        <h1 className="text-2xl font-bold text-blue-700">Kayit Ol</h1>
        <input {...register("email")} placeholder="Email" className="w-full rounded-xl border p-3" />
        <input {...register("password")} type="password" placeholder="Sifre" className="w-full rounded-xl border p-3" />
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" {...register("isAdmin")} /> Admin hesap</label>
        <button className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700">Kayit Olustur</button>
        <Link href="/login" className="block text-center text-sm text-blue-700">Zaten hesabim var</Link>
      </form>
    </section>
  );
}

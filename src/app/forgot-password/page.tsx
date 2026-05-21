"use client";

import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
  const { register, handleSubmit } = useForm<{ email: string }>();
  return (
    <section className="mx-auto max-w-xl min-h-[460px] rounded-3xl border bg-white p-6 shadow-sm">
      <form
        onSubmit={handleSubmit(() => toast.success("Sifre sifirlama linki gonderildi", { duration: 2000, style: { background: "#16a34a", color: "#fff" } }))}
        className="space-y-4"
      >
        <h1 className="text-2xl font-bold text-blue-700">Sifremi Unuttum</h1>
        <p className="text-sm text-slate-500">Kayitli email adresini gir, sifre sifirlama baglantisini gonderelim.</p>
        <input {...register("email")} placeholder="Email" className="w-full rounded-xl border p-3" />
        <button className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700">Gonder</button>
      </form>
    </section>
  );
}

"use client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUI } from "@/lib/store/ui";

const Schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  message: z.string().min(10),
});
type FormData = z.infer<typeof Schema>;

export default function ContactPage() {
  const lang = useUI((s) => s.lang);
  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<FormData>({ resolver: zodResolver(Schema) });

  return (
    <div className="max-w-lg mx-auto p-6 space-y-3">
      <h1 className="text-lg">{lang === "it" ? "Contatti" : "Contact"}</h1>
      <form
        onSubmit={handleSubmit(async (data) => {
          await new Promise((r) => setTimeout(r, 600));
          alert(JSON.stringify(data, null, 2));
        })}
        className="space-y-3"
      >
        <div>
          <label className="block text-xs mb-1" htmlFor="name">{lang === "it" ? "Nome" : "Name"}</label>
          <input id="name" className="w-full border border-mac-ink rounded px-2 py-1" {...register("name")} />
          {errors.name && <p className="text-red-600 text-xs">{errors.name.message}</p>}
        </div>
        <div>
          <label className="block text-xs mb-1" htmlFor="email">Email</label>
          <input id="email" type="email" className="w-full border border-mac-ink rounded px-2 py-1" {...register("email")} />
          {errors.email && <p className="text-red-600 text-xs">{errors.email.message}</p>}
        </div>
        <div>
          <label className="block text-xs mb-1" htmlFor="message">{lang === "it" ? "Messaggio" : "Message"}</label>
          <textarea id="message" rows={4} className="w-full border border-mac-ink rounded px-2 py-1" {...register("message")} />
          {errors.message && <p className="text-red-600 text-xs">{errors.message.message}</p>}
        </div>
        <button className="border border-mac-ink rounded px-3 py-1 bg-white" type="submit" disabled={isSubmitting}>
          {lang === "it" ? "Invia" : "Send"}
        </button>
      </form>
    </div>
  );
}

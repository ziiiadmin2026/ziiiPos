"use client";

import { useFormStatus } from "react-dom";
import { loginAction } from "@/app/login/actions";

type LoginFormProps = {
  error?: string;
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-14 w-full items-center justify-center rounded-[20px] bg-[#201c17] px-5 text-base font-semibold text-cloud transition hover:bg-[#2a241d] disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? "Ingresando..." : "Entrar al sistema"}
    </button>
  );
}

export function LoginForm({ error }: LoginFormProps) {
  return (
    <form action={loginAction} className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium text-ink/75">
          Correo
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="usuario@empresa.com"
          className="h-14 w-full rounded-[20px] border border-stone-300 bg-white px-4 text-base text-ink outline-none transition placeholder:text-ink/32 focus:border-[#9b6b2d] focus:ring-4 focus:ring-[#9b6b2d]/10"
          required
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <label htmlFor="password" className="text-sm font-medium text-ink/75">
            Contrasena
          </label>
          <span className="text-xs uppercase tracking-[0.2em] text-ink/35">Acceso personal</span>
        </div>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="Tu clave de trabajo"
          className="h-14 w-full rounded-[20px] border border-stone-300 bg-white px-4 text-base text-ink outline-none transition placeholder:text-ink/32 focus:border-[#9b6b2d] focus:ring-4 focus:ring-[#9b6b2d]/10"
          required
        />
      </div>

      {error ? (
        <div className="rounded-[18px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="rounded-[18px] border border-stone-200 bg-[#f7f3eb] px-4 py-3 text-sm text-ink/58">
        El sistema te redirige automaticamente segun tu rol y tus permisos.
      </div>

      <SubmitButton />
    </form>
  );
}
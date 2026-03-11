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
      className="inline-flex h-14 w-full items-center justify-center rounded-[22px] bg-ink px-5 text-base font-semibold text-cloud transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? "Ingresando..." : "Entrar al sistema"}
    </button>
  );
}

export function LoginForm({ error }: LoginFormProps) {
  return (
    <form action={loginAction} className="space-y-5">
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium text-ink/80">
          Correo
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="gerencia@ziiipos.com"
          className="h-14 w-full rounded-[22px] border border-ink/10 bg-white px-4 text-base outline-none transition placeholder:text-ink/35 focus:border-ink/30 focus:ring-2 focus:ring-ink/10"
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium text-ink/80">
          Contrasena
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="Tu acceso operativo"
          className="h-14 w-full rounded-[22px] border border-ink/10 bg-white px-4 text-base outline-none transition placeholder:text-ink/35 focus:border-ink/30 focus:ring-2 focus:ring-ink/10"
          required
        />
      </div>

      {error ? (
        <div className="rounded-[20px] border border-ember/20 bg-orange-50 px-4 py-3 text-sm text-ember">
          {error}
        </div>
      ) : null}

      <SubmitButton />
    </form>
  );
}
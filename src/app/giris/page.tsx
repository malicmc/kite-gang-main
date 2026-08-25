"use client";

import { useActionState } from "react";
import { login } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wind } from "lucide-react";

const initialState = { error: undefined, success: false };

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(login, initialState);

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left — branding panel */}
      <div className="relative hidden lg:flex w-[440px] flex-shrink-0 flex-col items-center justify-center bg-sidebar p-12 overflow-hidden">
        <div className="relative text-center">
          <div className="w-16 h-16 rounded-2xl bg-sidebar-primary flex items-center justify-center mx-auto mb-6">
            <Wind className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-heading font-semibold text-white tracking-tight">Kite Gang</h1>
          <p className="text-sidebar-primary font-semibold tracking-[0.2em] uppercase text-sm mt-1">Corner</p>
          <p className="text-sidebar-foreground/50 text-sm mt-6 leading-relaxed max-w-[240px] mx-auto">
            Kitesurf okulu yönetim sistemi. Müşteriler, eğitmenler ve finans tek yerden.
          </p>
        </div>

        <div className="relative mt-12 space-y-3 w-full max-w-[240px]">
          {[
            "Müşteri bakiye takibi",
            "Eğitmen hak ediş paneli",
            "Günlük takvim görünümü",
            "Kasa & finans raporları",
          ].map((feat) => (
            <div key={feat} className="flex items-center gap-2.5 text-sidebar-foreground/60 text-sm">
              <div className="w-4 h-4 rounded-full bg-sidebar-primary/20 border border-sidebar-primary/30 flex items-center justify-center flex-shrink-0">
                <div className="w-1.5 h-1.5 rounded-full bg-sidebar-primary" />
              </div>
              {feat}
            </div>
          ))}
        </div>
      </div>

      {/* Right — login form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <Wind className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-heading font-semibold text-foreground">Kite Gang Corner</p>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-8 shadow-sm">
            <div className="mb-6">
              <h2 className="text-xl font-heading font-semibold text-foreground">Giriş Yap</h2>
              <p className="text-sm text-muted-foreground mt-1">Hesap bilgilerinizi girin</p>
            </div>

            <form action={formAction} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-medium text-foreground/80">
                  E-posta
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="ornek@email.com"
                  required
                  autoComplete="email"
                  className="h-10 border-border bg-muted focus:bg-card"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm font-medium text-foreground/80">
                  Şifre
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="h-10 border-border bg-muted focus:bg-card"
                />
              </div>

              {state?.error && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive px-3 py-2.5 rounded-lg text-sm">
                  {state.error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold mt-1"
                disabled={isPending}
              >
                {isPending ? "Giriş yapılıyor..." : "Giriş Yap"}
              </Button>
            </form>
          </div>

          <p className="text-center text-xs text-muted-foreground/70 mt-6">
            Kite Gang Corner © {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
}

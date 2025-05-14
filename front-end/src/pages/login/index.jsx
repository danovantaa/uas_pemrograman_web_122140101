import { LoaderCircle } from "lucide-react";
import { Link } from "react-router-dom";

import TextLink from "@/components/text-link";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AuthLayout from "@/layouts/auth-layout";

export default function Login({ status, canResetPassword }) {
  const submit = (e) => {
    e.preventDefault();
    // Form logic will go here
    window.location.href = "/dashboard";
  };

  return (
    <AuthLayout title="Masuk ke RuangPulih">
      <div className="flex flex-col-reverse gap-8 w-full items-center">
        {/* Form */}
        <form
          onSubmit={submit}
          className="w-full space-y-6 bg-white p-6 rounded-lg shadow"
        >
          <div className="space-y-4">
            <div>
              <Label htmlFor="email" className="block mb-1">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <Label htmlFor="password" className="block mb-1">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
              />
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Checkbox id="remember" name="remember" />
                <Label htmlFor="remember">Ingat saya</Label>
              </div>

              {canResetPassword && (
                <TextLink href={route("password.request")} className="text-sm">
                  Lupa password?
                </TextLink>
              )}
            </div>
          </div>

          <Button type="submit" className="w-full">
            {/* loading && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> */}
            Masuk
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            Belum punya akun?{" "}
            <Link to="/register" className="underline">
              Daftar di sini
            </Link>
          </div>

          {status && (
            <div className="text-center text-green-600 text-sm font-medium">
              {status}
            </div>
          )}
        </form>

        {/* Illustration */}
        <div className="w-full flex justify-center">
          <img
            src="/hero-image.png"
            alt="Ilustrasi Login"
            className="max-w-sm w-full"
          />
        </div>
      </div>
    </AuthLayout>
  );
}

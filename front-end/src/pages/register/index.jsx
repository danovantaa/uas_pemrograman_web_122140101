import { Link } from "react-router-dom";
import { useState } from "react";

import TextLink from "@/components/text-link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AuthLayout from "@/layouts/auth-layout";

export default function Register() {
  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });

  const [processing, setProcessing] = useState(false);

  const errors = {
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setProcessing(true);

    setTimeout(() => {
      console.log("Form submitted:", data);
      setProcessing(false);
    }, 1000);
  };

  return (
    <AuthLayout title="Daftar ke RuangPulih">
      <div className="flex flex-col-reverse gap-8 w-full items-center">
        {/* Form Register */}
        <form
          onSubmit={handleSubmit}
          className="w-full space-y-6 bg-white p-6 rounded-lg shadow"
        >
          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="block mb-1">
                Nama Lengkap
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                required
                autoComplete="name"
                value={data.name}
                onChange={handleChange}
                disabled={processing}
                placeholder="Nama lengkap"
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            <div>
              <Label htmlFor="email" className="block mb-1">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                value={data.email}
                onChange={handleChange}
                disabled={processing}
                placeholder="you@example.com"
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            <div>
              <Label htmlFor="password" className="block mb-1">
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="new-password"
                value={data.password}
                onChange={handleChange}
                disabled={processing}
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password}</p>
              )}
            </div>

            <div>
              <Label htmlFor="password_confirmation" className="block mb-1">
                Konfirmasi Password
              </Label>
              <Input
                id="password_confirmation"
                name="password_confirmation"
                type="password"
                required
                autoComplete="new-password"
                value={data.password_confirmation}
                onChange={handleChange}
                disabled={processing}
                placeholder="Ulangi password"
              />
              {errors.password_confirmation && (
                <p className="text-sm text-red-500">
                  {errors.password_confirmation}
                </p>
              )}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={processing}>
            {processing && <span className="animate-spin mr-2">🔄</span>}
            Daftar Sekarang
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            Sudah punya akun?{" "}
            <Link to="/login" className="underline">
              Masuk di sini
            </Link>
          </div>
        </form>

        {/* Ilustrasi */}
        <div className="w-full flex justify-center">
          <img
            src="/hero-image.png"
            alt="Ilustrasi Pendaftaran"
            className="max-w-sm w-full"
          />
        </div>
      </div>
    </AuthLayout>
  );
}

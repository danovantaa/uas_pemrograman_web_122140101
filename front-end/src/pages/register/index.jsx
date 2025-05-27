import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";

import TextLink from "@/components/text-link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AuthLayout from "@/layouts/auth-layout";
import { useAuth } from "@/hooks/useAuth";

export default function Register() {
  const { register, error, loading } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState({
    username: "",
    email: "",
    password: "",
    password_confirmation: "",
  });

  const [formError, setFormError] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError({});

    if (data.password !== data.password_confirmation) {
      setFormError({ password_confirmation: "Password tidak cocok." });
      toast.error("Konfirmasi password tidak sesuai");
      return;
    }

    const success = await register(data.username, data.email, data.password);

    if (success) {
      toast.success("Pendaftaran berhasil! Silakan login.");
      navigate("/login");
    } else if (error) {
      toast.error(error);
    } else {
      toast.error("Terjadi kesalahan saat mendaftar.");
    }
  };

  return (
    <AuthLayout title="Daftar ke RuangPulih">
      <div className="flex flex-col md:flex-row gap-8 w-full items-stretch min-h-[450px]">
        {/* Ilustrasi */}
        <div className="w-full md:w-1/2 flex justify-center">
          <img
            src="/hero-image.png"
            alt="Ilustrasi Pendaftaran"
            className="max-w-sm w-full h-full object-cover rounded-lg"
          />
        </div>

        {/* Form Register */}
        <form
          onSubmit={handleSubmit}
          className="w-full md:w-1/2 space-y-6 flex flex-col justify-center bg-white p-6 rounded-lg shadow"
        >
          <div className="space-y-4">
            <div>
              <Label htmlFor="username" className="block mb-1">
                Nama Lengkap
              </Label>
              <Input
                id="username"
                name="username"
                type="text"
                required
                autoComplete="name"
                value={data.username}
                onChange={handleChange}
                disabled={loading}
                placeholder="Nama lengkap"
              />
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
                disabled={loading}
                placeholder="you@example.com"
              />
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
                disabled={loading}
                placeholder="••••••••"
              />
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
                disabled={loading}
                placeholder="Ulangi password"
              />
              {formError.password_confirmation && (
                <p className="text-sm text-red-500">
                  {formError.password_confirmation}
                </p>
              )}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <span className="animate-spin mr-2">🔄</span>}
            Daftar Sekarang
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            Sudah punya akun?{" "}
            <Link to="/login" className="underline">
              Masuk di sini
            </Link>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
}

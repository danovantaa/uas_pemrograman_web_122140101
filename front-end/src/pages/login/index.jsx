import { useState } from "react";
import { LoaderCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom"; // Import useNavigate
import { toast } from "sonner"; // Import toast dari sonner

import TextLink from "@/components/text-link";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AuthLayout from "@/layouts/auth-layout";

import { useAuth } from "@/hooks/useAuth"; // Import custom hook useAuth Anda

export default function Login({ status, canResetPassword }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { login, loading, error } = useAuth(); // Dapatkan fungsi dan state dari useAuth
  const navigate = useNavigate(); // Inisialisasi useNavigate

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await login(email, password); // Panggil fungsi login dari hook

    if (result.success) {
      toast.success("Berhasil masuk!", {
        description: `Selamat datang, ${result.user.username}!`,
      });
      // Gunakan setTimeout agar toast sempat terlihat sebelum navigasi
      setTimeout(() => {
        // Navigasi setelah login berdasarkan role
        if (result.user.role === "psychologist") {
          navigate("/dashboard"); // Untuk psikolog
        } else if (result.user.role === "client") {
          navigate("/client"); // Untuk klien
        } else {
          // Role tidak dikenal atau default, arahkan ke halaman default
          navigate("/");
        }
      }, 1000); // Tunggu 1 detik
    } else {
      // Gunakan error dari hook useAuth
      toast.error("Gagal masuk!", {
        description: result.error || "Terjadi kesalahan yang tidak diketahui.",
      });
    }
  };

  return (
    <AuthLayout title="Masuk ke RuangPulih">
      <div className="flex flex-col md:flex-row gap-8 w-full items-stretch min-h-[450px]">
        {/* Illustration */}
        <div className="w-full md:w-1/2 flex justify-center">
          <img
            src="/hero-image.png"
            alt="Ilustrasi Login"
            className="max-w-sm w-full h-full object-cover rounded-lg"
          />
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="w-full md:w-1/2 space-y-6 flex flex-col justify-center bg-white p-6 rounded-lg shadow"
        >
          {/* Tampilkan pesan status Laravel (jika ada) */}
          {status && (
            <div className="text-center text-green-600 text-sm font-medium">
              {status}
            </div>
          )}

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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="flex justify-between items-center">
              {/* Checkbox "Ingat saya" biasanya butuh implementasi di backend untuk persistent session. */}
              {/* <div className="flex items-center gap-2">
                <Checkbox id="remember" name="remember" />
                <Label htmlFor="remember">Ingat saya</Label>
              </div> */}

              {canResetPassword && (
                <TextLink to="/forgot-password" className="text-sm">
                  Lupa password?
                </TextLink>
              )}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
            Masuk
          </Button>

          {/* Tampilkan error dari hook useAuth (jika ada) */}
          {error && (
            <div className="text-center text-red-600 text-sm font-medium">
              {error}
            </div>
          )}

          <div className="text-center text-sm text-muted-foreground">
            Belum punya akun?{" "}
            <Link to="/register" className="underline">
              Daftar di sini
            </Link>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
}

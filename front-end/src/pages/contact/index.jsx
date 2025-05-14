import { useState } from "react";
import MainLayout from "@/components/main-layout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Keluhan dikirim:", form);
    setSubmitted(true);
    setForm({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <MainLayout>
      <section className="py-24 px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-6 text-center">
            Hubungi Layanan Bantuan
          </h1>
          <p className="text-muted-foreground text-center mb-12">
            Kirimkan pertanyaan, keluhan, atau saran kamu melalui form di bawah
            ini. Tim Customer Service RuangPulih akan membalas secepat mungkin.
          </p>

          <form
            onSubmit={handleSubmit}
            className="space-y-6 bg-primary/5 p-6 rounded-lg shadow"
          >
            <div>
              <Label htmlFor="name">Nama Lengkap</Label>
              <Input
                id="name"
                name="name"
                type="text"
                required
                value={form.name}
                onChange={handleChange}
                placeholder="Nama lengkap kamu"
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
              />
            </div>

            <div>
              <Label htmlFor="subject">Subjek Pesan</Label>
              <Input
                id="subject"
                name="subject"
                type="text"
                required
                value={form.subject}
                onChange={handleChange}
                placeholder="Contoh: Tidak bisa login"
              />
            </div>

            <div>
              <Label htmlFor="message">Isi Pesan / Keluhan</Label>
              <Textarea
                id="message"
                name="message"
                rows="5"
                required
                value={form.message}
                onChange={handleChange}
                placeholder="Tuliskan keluhan atau pesan kamu..."
              />
            </div>

            <Button type="submit" className="w-full">
              Kirim Pesan
            </Button>

            {submitted && (
              <p className="text-sm text-green-600 text-center">
                ✅ Pesan berhasil dikirim! Kami akan segera merespons.
              </p>
            )}
          </form>
        </div>
      </section>
    </MainLayout>
  );
}

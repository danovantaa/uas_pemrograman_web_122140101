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
    // Reset form after submission
    setForm({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <MainLayout>
      <section className="py-24 px-6 text-white">
        {" "}
        {/* Updated section background and text color */}
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-6 text-center">
            Hubungi Layanan Bantuan
          </h1>
          <p className="text-gray-300 text-center mb-12">
            {" "}
            {/* Adjusted text color for better contrast */}
            Kirimkan pertanyaan, keluhan, atau saran kamu melalui form di bawah
            ini. Tim Customer Service RuangPulih akan membalas secepat mungkin.
          </p>

          <form
            onSubmit={handleSubmit}
            className="space-y-6 bg-stone-900 p-6 rounded-lg shadow" // Updated form background
          >
            <div>
              <Label htmlFor="name" className="text-gray-200">
                Nama Lengkap
              </Label>{" "}
              {/* Adjusted label color */}
              <Input
                id="name"
                name="name"
                type="text"
                required
                value={form.name}
                onChange={handleChange}
                placeholder="Nama lengkap kamu"
                className="text-white border-white placeholder:text-gray-400"
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-gray-200">
                Email
              </Label>{" "}
              {/* Adjusted label color */}
              <Input
                id="email"
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="text-white border-white placeholder:text-gray-400"
              />
            </div>

            <div>
              <Label htmlFor="subject" className="text-gray-200">
                Subjek Pesan
              </Label>{" "}
              {/* Adjusted label color */}
              <Input
                id="subject"
                name="subject"
                type="text"
                required
                value={form.subject}
                onChange={handleChange}
                placeholder="Contoh: Tidak bisa login"
                className="text-white border-white placeholder:text-gray-400"
              />
            </div>

            <div>
              <Label htmlFor="message" className="text-gray-200">
                Isi Pesan / Keluhan
              </Label>{" "}
              {/* Adjusted label color */}
              <Textarea
                id="message"
                name="message"
                rows="5"
                required
                value={form.message}
                onChange={handleChange}
                placeholder="Tuliskan keluhan atau pesan kamu..."
                className="text-white border-white placeholder:text-gray-400"
              />
            </div>

            <Button type="submit" className="w-full">
              Kirim Pesan
            </Button>

            {submitted && (
              <p className="text-sm text-green-500 text-center">
                Pesan berhasil dikirim! Kami akan segera merespons.
              </p>
            )}
          </form>
        </div>
      </section>
    </MainLayout>
  );
}

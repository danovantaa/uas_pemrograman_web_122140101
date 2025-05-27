import { CheckCircle } from "lucide-react";

export default function HowItWorksSection() {
  const steps = [
    {
      title: "1. Daftar Akun",
      description:
        "Buat akun baru hanya dengan beberapa klik untuk mulai menggunakan RuangPulih.",
    },
    {
      title: "2. Temukan Psikolog",
      description:
        "Gunakan fitur pencarian untuk menemukan psikolog sesuai kebutuhan dan spesialisasi.",
    },
    {
      title: "3. Booking Sesi",
      description:
        "Pilih waktu yang tersedia dan lakukan pemesanan sesi dengan mudah melalui dashboard.",
    },
    {
      title: "4. Konsultasi Online",
      description:
        "Lakukan sesi konsultasi melalui platform kami dengan nyaman dan aman dari mana pun.",
    },
  ];

  return (
    <section className="w-full bg-black py-20 px-6">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
          Cara Kerja RuangPulih
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto mb-12">
          Dalam empat langkah sederhana, kamu bisa memulai perjalanan kesehatan
          mentalmu bersama psikolog profesional.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
          {steps.map((step, index) => (
            <div
              key={index}
              className="bg-stone-900 rounded-lg p-6 shadow-sm border-l-4 border-primary/70 transition hover:shadow-md"
            >
              <div className="flex items-start gap-4 mb-3">
                <CheckCircle className="text-primary w-6 h-6 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-primary mb-1">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

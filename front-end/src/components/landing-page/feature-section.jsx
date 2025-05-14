import {
  MonitorSmartphone,
  BadgeCheck,
  ShieldCheck,
  CalendarCheck,
} from "lucide-react";

export default function FeatureSection() {
  const features = [
    {
      title: "Konsultasi Online Fleksibel",
      description:
        "Akses psikolog profesional dari mana saja dan kapan saja sesuai kenyamananmu.",
      icon: <MonitorSmartphone className="w-8 h-8 text-primary" />,
    },
    {
      title: "Psikolog Terverifikasi",
      description:
        "Setiap psikolog telah melalui proses verifikasi dan menyertakan sertifikat profesional.",
      icon: <BadgeCheck className="w-8 h-8 text-primary" />,
    },
    {
      title: "Privasi dan Keamanan",
      description:
        "Kami menjamin kerahasiaan dan keamanan data konsultasimu secara end-to-end.",
      icon: <ShieldCheck className="w-8 h-8 text-primary" />,
    },
    {
      title: "Manajemen Jadwal Mudah",
      description:
        "Atur, ubah, dan kelola sesi dengan mudah melalui dashboard intuitif.",
      icon: <CalendarCheck className="w-8 h-8 text-primary" />,
    },
  ];

  return (
    <section className="w-full bg-white py-16 px-6">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
          Kenapa Memilih RuangPulih?
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto mb-12">
          Didesain untuk mendukung perjalanan kesehatan mentalmu secara aman,
          mudah, dan terpercaya.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-primary/5 rounded-lg p-6 text-left shadow-sm transition hover:shadow-md"
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-primary mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

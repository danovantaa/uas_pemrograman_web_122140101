export default function TestimonialSection() {
  const testimonials = [
    {
      name: "Alya N.",
      role: "Pengguna RuangPulih",
      quote:
        "Awalnya ragu konsultasi online, tapi ternyata nyaman dan sangat membantu. Psikolognya ramah dan profesional.",
    },
    {
      name: "Dr. Indra K.",
      role: "Psikolog Profesional",
      quote:
        "Platform ini mempermudah saya menjangkau klien baru dan mengatur jadwal secara efisien. Semuanya tertata rapi.",
    },
    {
      name: "Rico A.",
      role: "Mahasiswa",
      quote:
        "Fitur pencarian psikolog sesuai spesialisasi sangat membantu. Saya merasa lebih tenang setelah beberapa sesi.",
    },
  ];

  return (
    <section className="w-full bg-black py-20 px-6">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
          Apa Kata Mereka?
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto mb-12">
          Cerita nyata dari pengguna dan psikolog yang telah merasakan manfaat
          RuangPulih.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((item, index) => (
            <div
              key={index}
              className="bg-stone-900 rounded-lg p-6 text-left shadow hover:shadow-md transition"
            >
              <p className="italic text-muted-foreground mb-4">
                “{item.quote}”
              </p>
              <div className="font-semibold text-primary">{item.name}</div>
              <div className="text-sm text-muted-foreground">{item.role}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

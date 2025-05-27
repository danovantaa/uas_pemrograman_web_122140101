import MainLayout from "@/components/main-layout";

export default function TentangKami() {
  return (
    <MainLayout>
      <section className="py-24 px-6 text-white">
        {" "}
        {/* Changed background to black and text to white */}
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-6">
            Tentang RuangPulih
          </h1>
          <p className="text-gray-300 mb-12 text-lg">
            {" "}
            {/* Adjusted text color for better contrast */}
            Kami hadir untuk membangun ruang aman, mendukung, dan terpercaya
            bagi siapa pun yang ingin menjaga dan memulihkan kesehatan mental.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {/* Visi */}
            <div className="bg-stone-900 p-6 rounded-lg shadow hover:shadow-md transition">
              {" "}
              {/* Changed background to stone-900 */}
              <h3 className="text-xl font-semibold text-primary mb-2">Visi</h3>
              <p className="text-gray-400 text-sm">
                {" "}
                {/* Adjusted text color for better contrast */}
                Menjadi platform psikologi online terpercaya di Indonesia yang
                mampu menjangkau setiap individu untuk mendapatkan dukungan
                mental yang layak dan profesional.
              </p>
            </div>

            {/* Misi */}
            <div className="bg-stone-900 p-6 rounded-lg shadow hover:shadow-md transition">
              {" "}
              {/* Changed background to stone-900 */}
              <h3 className="text-xl font-semibold text-primary mb-2">Misi</h3>
              <ul className="list-disc list-inside text-gray-400 text-sm space-y-1">
                {" "}
                {/* Adjusted text color for better contrast */}
                <li>
                  Menyediakan akses konsultasi psikolog yang mudah dan aman
                </li>
                <li>Meningkatkan kesadaran pentingnya kesehatan mental</li>
                <li>Menjaga kerahasiaan dan privasi klien secara menyeluruh</li>
              </ul>
            </div>

            {/* Nilai Inti */}
            <div className="bg-stone-900 p-6 rounded-lg shadow hover:shadow-md transition">
              {" "}
              {/* Changed background to stone-900 */}
              <h3 className="text-xl font-semibold text-primary mb-2">
                Nilai-Nilai Kami
              </h3>
              <ul className="list-disc list-inside text-gray-400 text-sm space-y-1">
                {" "}
                {/* Adjusted text color for better contrast */}
                <li>Empati dan Kepedulian</li>
                <li>Profesionalisme</li>
                <li>Inklusivitas</li>
                <li>Keamanan dan Privasi</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}

// Ganti "LatestRecipes" jadi "LatestArticles" dengan konten terkait psikologi
export default function LatestArticles() {
  const articles = [
    {
      id: 1,
      title: "Mengelola Stres dengan Teknik Pernapasan",
      description:
        "Teknik sederhana yang terbukti membantu menenangkan pikiran.",
      image: "/images/breathing.png",
    },
    {
      id: 2,
      title: "Kenali Gejala Burnout Sejak Dini",
      description: "Ciri-ciri burnout dan cara mengatasinya.",
      image: "/images/burnout.png",
    },
    // ...
  ];

  return (
    <section className="py-12 bg-muted/30">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center text-gray-800">
          Artikel Terbaru
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <div key={article.id} className="bg-white rounded shadow p-4">
              <img
                src={article.image}
                alt={article.title}
                className="rounded mb-4"
              />
              <h3 className="text-lg font-semibold">{article.title}</h3>
              <p className="text-sm text-muted-foreground">
                {article.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

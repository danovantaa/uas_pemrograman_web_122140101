import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

export default function MainLayout({ children }) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-primary to-black relative mx-auto">
        {children}

        <Footer />
      </main>
    </>
  );
}

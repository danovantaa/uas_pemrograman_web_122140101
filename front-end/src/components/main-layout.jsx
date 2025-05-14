import Navbar from "../components/navbar";
import Footer from "../components/footer";

export default function MainLayout({ children }) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen relative mx-auto">{children}</main>
      <Footer />
    </>
  );
}

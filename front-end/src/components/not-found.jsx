import React from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { buttonVariants } from "./ui/button";
import { ArrowLeft } from "lucide-react";

function NotFound() {
  const navigate = useNavigate(); // Inisialisasi useNavigate

  // Handler untuk kembali ke halaman sebelumnya
  const handleGoBack = () => {
    navigate(-1); // Kembali ke halaman sebelumnya
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/5 text-primary p-4">
      <div className="text-center">
        <h1 className="text-6xl md:text-9xl font-extrabold mb-4">404</h1>
        <h2 className="text-3xl md:text-5xl font-bold mb-6">
          Halaman tidak ditemukan
        </h2>
        <p className="text-lg md:text-xl mb-8">
          Maaf, halaman yang Anda cari tidak ada.
        </p>
        {/* Mengubah Link menjadi Button yang memicu navigasi kembali */}
        <button
          onClick={handleGoBack}
          className={buttonVariants()} // Menggunakan buttonVariants untuk styling
        >
          <ArrowLeft className="mr-2" />
          Kembali
        </button>
      </div>
    </div>
  );
}

export default NotFound;

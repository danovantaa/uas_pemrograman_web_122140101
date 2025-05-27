import React from "react";
import { Link } from "react-router-dom";
import { buttonVariants } from "./ui/button";
import { ArrowLeft } from "lucide-react";

function NotFound() {
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
        <Link to="/" className={buttonVariants()}>
          <ArrowLeft className="mr-2" />
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}

export default NotFound;

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@/index.css";
import App from "@/App.jsx";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "@/pages/login/index.jsx";
import Register from "@/pages/register/index.jsx";
import PsychologistListPage from "./pages/psikolog";
import PsychologistDetailPage from "./pages/psikolog/show";
import Dashboard from "@/pages/dashboard";
import ContactPage from "./pages/contact";
import TentangKami from "./pages/tentang";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/psikolog" element={<PsychologistListPage />} />
        <Route path="/psikolog/:id" element={<PsychologistDetailPage />} />
        <Route path="/tentang" element={<TentangKami />} />
        <Route path="/kontak" element={<ContactPage />} />
        <Route path="*" element={<h1>Halaman tidak ditemukan</h1>} />

        {/* ADMIN AREAS */}
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);

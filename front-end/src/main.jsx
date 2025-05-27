import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";

import "@/index.css";
import App from "@/App.jsx";
import Login from "@/pages/login/index.jsx";
import Register from "@/pages/register/index.jsx";
import PsychologistListPage from "@/pages/client/psikolog/index.jsx";
import PsychologistDetailPage from "@/pages/client/psikolog/show.jsx";
import ContactPage from "@/pages/contact";
import TentangKami from "@/pages/tentang";

// Pages Dashboard Psikolog
import ManageSchedulesPage from "@/pages/dashboard/manage-schedules";
import PsychologistDashboardPage from "@/pages/dashboard";
import ManageBookingsPage from "@/pages/dashboard/manage-bookings";
import ManageReviewsPage from "@/pages/dashboard/manage-reviews";

// Pages Klien
import ClientDashboardPage from "@/pages/client/dashboard";
import ClientMyBookingsPage from "@/pages/client/my-bookings";
import ClientMyReviewsPage from "@/pages/client/my-reviews";
import NotFound from "@/components/not-found";

const container = document.getElementById("root");
const root = createRoot(container);

function MainApp() {
  return (
    <StrictMode>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<App />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/tentang" element={<TentangKami />} />
          <Route path="/kontak" element={<ContactPage />} />

          {/* Psychologist Dashboard Routes */}
          <Route path="/dashboard" element={<PsychologistDashboardPage />} />
          <Route
            path="/dashboard/manage-schedules"
            element={<ManageSchedulesPage />}
          />
          <Route
            path="/dashboard/manage-bookings"
            element={<ManageBookingsPage />}
          />
          <Route
            path="/dashboard/manage-reviews"
            element={<ManageReviewsPage />}
          />

          {/* Client Dashboard Routes */}
          <Route path="/client" element={<ClientDashboardPage />} />
          <Route
            path="/client/my-bookings"
            element={<ClientMyBookingsPage />}
          />
          <Route path="/client/my-reviews" element={<ClientMyReviewsPage />} />
          <Route path="/client/psikolog" element={<PsychologistListPage />} />
          <Route
            path="/client/psikolog/:id"
            element={<PsychologistDetailPage />}
          />

          {/* Catch-all for Not Found Page */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster richColors position="top-right" />
      </BrowserRouter>
    </StrictMode>
  );
}

export default MainApp;

root.render(<MainApp />);

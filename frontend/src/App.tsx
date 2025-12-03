import { Routes, Route } from "react-router-dom";
import { LandingPage } from "./pages/LandingPage";
import { AchadosPerdidosPro } from "./pages/AchadosPerdidosPro";
import { SecretaryDashboard } from "./pages/SecretaryDashboard";
import { Leaderboard } from "./pages/Leaderboard";
import { Heatmap } from "./pages/Heatmap";
import { AdminMetrics } from "./pages/AdminMetrics";
import { KioskMode } from "./pages/KioskMode";
import { AccessibilityControls } from "./components/AccessibilityControls";
import "./index.css";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/lost" element={<AchadosPerdidosPro />} />
        <Route path="/found" element={<AchadosPerdidosPro />} />
        <Route path="/secretary" element={<SecretaryDashboard />} />
        <Route path="/heroes" element={<Leaderboard />} />
        <Route path="/heatmap" element={<Heatmap />} />
        <Route path="/admin/metrics" element={<AdminMetrics />} />
        <Route path="/kiosk" element={<KioskMode />} />
      </Routes>
      <AccessibilityControls />
    </>
  );
}

export default App;

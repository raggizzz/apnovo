import { Routes, Route } from "react-router-dom";
import { LandingPage } from "./pages/LandingPage";
import { AchadosPerdidosPro } from "./pages/AchadosPerdidosPro";
import "./index.css";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/lost" element={<AchadosPerdidosPro />} />
      <Route path="/found" element={<AchadosPerdidosPro />} />
    </Routes>
  );
}

export default App;

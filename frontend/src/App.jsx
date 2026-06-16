import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Prediction from "./pages/Prediction";
import BatchUpload from "./pages/BatchUpload";
import MapPage from "./pages/MapPage";
import Monitoring from "./pages/Monitoring";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <main className="container">
        <Routes>
          <Route path="/" element={<Prediction />} />
          <Route path="/batch" element={<BatchUpload />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/monitoring" element={<Monitoring />} />
        </Routes>
      </main>

      <Footer />
    </BrowserRouter>
  );
}

export default App;

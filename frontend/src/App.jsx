import { BrowserRouter, Routes, Route } from "react-router-dom";

import Prediction from "./pages/Prediction";
import BatchUpload from "./pages/BatchUpload";
import MapPage from "./pages/MapPage";
import Monitoring from "./pages/Monitoring";

function App() {

  return (

    <BrowserRouter>

      <Routes>

        <Route path="/" element={<Prediction />} />

        <Route path="/batch" element={<BatchUpload />} />

        <Route path="/map" element={<MapPage />} />

        <Route path="/monitoring" element={<Monitoring />} />

      </Routes>

    </BrowserRouter>

  );
}

export default App;
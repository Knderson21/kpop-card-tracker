import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navbar } from "./components/layout/Navbar";
import { GalleryPage } from "./pages/GalleryPage";
import { AdminPage } from "./pages/AdminPage";
import { STATIC_MODE } from "./api/client";

function App() {
  const basename = import.meta.env.BASE_URL.replace(/\/$/, "") || "/";
  return (
    <BrowserRouter basename={basename}>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<GalleryPage />} />
            {!STATIC_MODE && <Route path="/admin" element={<AdminPage />} />}
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;

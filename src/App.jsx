import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import HomePage from "./pages/HomePage";
import AnimePage from "./pages/AnimePage";
import PlayerPage from "./pages/PlayerPage";
import RandomPage from "./pages/RandomPage";
import ErrorPage from "./pages/ErrorPage";
import ProfilePage from "./pages/ProfilePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import CatalogPage from "./pages/PageCatalog";
import DocumentationPage from "./pages/DocumentationPage";
import Footer from "./components/Footer";

function App() {
  return (
    <div className="app-container min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/anime/:id" element={<AnimePage />} />
          <Route path="/episode/:id" element={<PlayerPage />} />
          <Route path="/random" element={<RandomPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/error" element={<ErrorPage />} />
          <Route path="/api-docs" element={<DocumentationPage />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;
import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import HomePage from "./pages/HomePage";
import AnimePage from "./pages/AnimePage";
import PlayerPage from "./pages/PlayerPage";
import RandomPage from "./pages/RandomPage";
import ErrorPage from "./pages/ErrorPage";

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
          <Route path="/error" element={<ErrorPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
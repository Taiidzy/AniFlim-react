import { Routes, Route, Link } from "react-router-dom";
import HomePage from "./pages/HomePage";
import AnimePage from "./pages/AnimePage";

function App() {
  return (
    <div className="app-container">
      <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 shadow-lg">
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="text-4xl font-bold hover:text-indigo-300 transition-colors duration-200">
            <Link to="/">AniFlim</Link>
          </h1>
          <nav className="space-x-4">
            <Link to="/" className="text-lg hover:text-indigo-300 transition-colors duration-200">Расписание</Link>
            <Link to="/anime" className="text-lg hover:text-indigo-300 transition-colors duration-200">Случайный релиз</Link>
            <Link to="/profile" className="text-lg hover:text-indigo-300 transition-colors duration-200">Профиль</Link>
          </nav>
        </div>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/anime/:id" element={<AnimePage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;

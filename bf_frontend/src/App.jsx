import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import NamePage from "./pages/NamePage";
import QuizPage from "./pages/QuizPage";
import ValentinePage from "./pages/ValentinePage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<NamePage />} />
        <Route path="/quiz" element={<QuizPage />} />
        <Route path="/valentine" element={<ValentinePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

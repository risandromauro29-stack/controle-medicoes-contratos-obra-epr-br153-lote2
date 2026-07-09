import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "./lib/theme";
import { ObrasPage } from "./pages/ObrasPage";
import { DashboardPage } from "./pages/DashboardPage";

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ObrasPage />} />
          <Route path="/obra/:obraId" element={<DashboardPage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

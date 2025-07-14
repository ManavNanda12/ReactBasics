import { Outlet } from "react-router-dom";
import "./App.css";
import Header, { HeaderContext } from "./layout/Header";
import { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ScrollToTop from "./common/ScrollToTop";
import Footer from "./layout/Footer";
import ChatBoard from "./pages/ChatBoard";

function App() {
  const getInitialTheme = () => {
    return localStorage.getItem("theme") || "light";
  };
  const [currentTheme, setCurrentTheme] = useState(getInitialTheme);
  const [lang, setLang] = useState(localStorage.getItem("lang") || "en");
  useEffect(() => {
    document.documentElement.setAttribute("data-bs-theme", currentTheme);
    localStorage.setItem("theme", currentTheme);
  }, [currentTheme]);

  return (
    <HeaderContext.Provider
    value={{ currentTheme, setCurrentTheme, lang, setLang }}
  >
    <div className="app-wrapper">
      <div className="sticky-header">
        <Header />
      </div>

      <main className="main-content container main-content mt-2">
        <Outlet />
        <ToastContainer />
      </main>
      <div className="position-fixed bottom-0 start-0 p-3 z-3">
        <ChatBoard />
      </div>

      <Footer />
      <ScrollToTop />
    </div>
  </HeaderContext.Provider>
  );
}

export default App;

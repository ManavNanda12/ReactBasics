import { Outlet } from "react-router-dom";
import "./App.css";
import Header, { HeaderContext } from "./layout/Header";
import { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ScrollToTop from "./common/ScrollToTop";

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
      <div className="App">
        <div className="sticky-header">
          <Header />
        </div>

        <div className="container main-content mt-2">
          <Outlet />
          <ToastContainer />
        </div>
        <ScrollToTop />
      </div>
    </HeaderContext.Provider>
  );
}

export default App;

import { Outlet } from "react-router-dom";
import "./App.css";
import Header, { HeaderContext } from "./layout/Header";
import { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ScrollToTop from "./common/ScrollToTop";
import Footer from "./layout/Footer";
import ChatBoard from "./pages/ChatBoard";
import { v4 as uuidv4 } from 'uuid';

function App() {
  const getInitialTheme = () => {
    return localStorage.getItem("theme") || "light";
  };
  const [currentTheme, setCurrentTheme] = useState(getInitialTheme);
  const [lang, setLang] = useState(localStorage.getItem("lang") || "en");
  const getClientId = () => {
    const localKey = 'my_unique_user_id';
    let clientId = localStorage.getItem(localKey);
    if (!clientId) {
      clientId = uuidv4();
      localStorage.setItem(localKey, clientId);
    }
    return clientId;
  }
  useEffect(() => {
    document.documentElement.setAttribute("data-bs-theme", currentTheme);
    localStorage.setItem("theme", currentTheme);
  }, [currentTheme]);

  useEffect(() => {
    const clientId = getClientId();
  }, []);

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

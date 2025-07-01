import { Outlet } from 'react-router-dom';
import './App.css';
import Header, { HeaderContext } from './layout/Header';
import { useEffect, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const getInitialTheme = () => {
    return localStorage.getItem('theme') || 'light';
  };
  const [currentTheme, setCurrentTheme] = useState(getInitialTheme);
  const [lang, setLang] = useState(localStorage.getItem("lang") || "en");
  useEffect(() => {
    document.documentElement.setAttribute("data-bs-theme", currentTheme);
    localStorage.setItem("theme", currentTheme);
  }, [currentTheme]);


  return (
    <HeaderContext.Provider value={{currentTheme, setCurrentTheme, lang, setLang}}>
      <div className="App">
        <Header />
        <div className="container main-content">
          <Outlet />
          <ToastContainer />
        </div>
      </div>
    </HeaderContext.Provider>
  );
}

export default App;

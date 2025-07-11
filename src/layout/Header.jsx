import { ThemeProvider } from "@mui/material";
import { createContext, useContext, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import FormControl from "@mui/material/FormControl";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import { createTheme } from "@mui/material/styles";
import i18n from "../language/I18NConfig";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import "../assets/designfiles/Header.css";

export const HeaderContext = createContext();

export default function Header() {
  const currentRoute = useLocation();
  const currentPath = currentRoute.pathname;

  const { currentTheme, setCurrentTheme, lang, setLang } = useContext(HeaderContext);
  const { t, i18n } = useTranslation();

  const theme = createTheme({ palette: { mode: currentTheme } });

  const handleChange = (event) => {
    setLang(event.target.value);
    i18n.changeLanguage(event.target.value);
    localStorage.setItem("lang", event.target.value);
  };

  useEffect(() => {
    i18n.changeLanguage(lang);
  }, [lang]);

  return (
    <>
      {currentPath === "/login" ? null : (
        <ThemeProvider theme={theme}>
          <nav className={`navbar navbar-expand-lg ${currentTheme === "light" ? "navbar-light bg-light" : "navbar-dark bg-dark"} animated-navbar`}>
            <div className="container-fluid">
              <Link className="navbar-brand" to="/">
                {t("johndoe")}
              </Link>

              <button
                className="navbar-toggler"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#navbarSupportedContent"
                aria-controls="navbarSupportedContent"
                aria-expanded="false"
                aria-label="Toggle navigation"
              >
                <span className="navbar-toggler-icon"></span>
              </button>

              <div className="collapse navbar-collapse justify-content-between" id="navbarSupportedContent">
                {/* Left nav links */}
                <ul className="navbar-nav">
                  <li className="nav-item">
                    <Link className={`nav-link ${currentPath === "/" ? "active" : ""}`} to="/">
                      {t("home")}
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className={`nav-link ${currentPath === "/crud" ? "active" : ""}`} to="/crud">
                      {t("crud")}
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className={`nav-link ${currentPath === "/currencyconvertor" ? "active" : ""}`} to="/currencyconvertor">
                      {t("currencyConverter")}
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className={`nav-link ${currentPath === "/contactus" ? "active" : ""}`} to="/contactus">
                      {t("contactUs")}
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className={`nav-link ${currentPath === "/supportus" ? "active" : ""}`} to="/supportus">
                      {t("supportUs")}
                    </Link>
                  </li>
                </ul>

                {/* Right controls */}
                <div className="d-flex align-items-center">
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <Select
                      id="lang-select"
                      value={lang}
                      onChange={handleChange}
                      className="lang-animate"
                    >
                      <MenuItem value="en">English</MenuItem>
                      <MenuItem value="hi">हिंदी</MenuItem>
                      <MenuItem value="gu">ગુજરાતી</MenuItem>
                    </Select>
                  </FormControl>

                  <Tooltip title={t("toggleTheme")}>
                    <IconButton
                      sx={{ ml: 1 }}
                      onClick={() => {
                        const newTheme = currentTheme === "light" ? "dark" : "light";
                        setCurrentTheme(newTheme);
                        document.documentElement.setAttribute("data-bs-theme", newTheme);
                        localStorage.setItem("theme", newTheme);
                      }}
                      color="inherit"
                      className="theme-icon-animate"
                    >
                      {currentTheme === "light" ? (
                        <Brightness4Icon style={{ color: "black" }} />
                      ) : (
                        <Brightness7Icon style={{ color: "white" }} />
                      )}
                    </IconButton>
                  </Tooltip>
                </div>
              </div>
            </div>
          </nav>
        </ThemeProvider>
      )}
    </>
  );
}

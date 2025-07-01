import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Crud from "./pages/Crud";
import CurrencyConverter from "./pages/CurrencyConverter";
import PageNotFound from "./pages/PageNotFound";
import Login from "./pages/Login";
import { AuthProvider } from "./guard/AuthProvider";
import PrivateRoute from "./guard/PrivateRoute";
import PublicRoute from "./guard/PublicRoute";
import * as serviceWorkerRegistration from './serviceworker';
const root = ReactDOM.createRoot(document.getElementById("root"));
serviceWorkerRegistration.register();
root.render(
  <React.StrictMode>
    <AuthProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<PrivateRoute><CurrencyConverter /></PrivateRoute>} />
          <Route path="crud" element={<PrivateRoute><Crud /></PrivateRoute>} />
          <Route path="login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="*" element={<PublicRoute><PageNotFound /></PublicRoute>} />
        </Route>
      </Routes>
    </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

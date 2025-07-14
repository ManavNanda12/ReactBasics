import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { AuthProvider } from "./guard/AuthProvider";
import PrivateRoute from "./guard/PrivateRoute";
import PublicRoute from "./guard/PublicRoute";
import * as serviceWorkerRegistration from './serviceworker';
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISH_KEY);
const Crud = lazy(() => import("./pages/Crud"));
const CurrencyConverter = lazy(() => import("./pages/CurrencyConverter"));
const PageNotFound = lazy(() => import("./pages/PageNotFound"));
const Login = lazy(() => import("./pages/Login"));
const Home = lazy(() => import("./pages/Home"));
const ContactUs = lazy(() => import("./pages/ContactUs"));
const SupportUs = lazy(() => import("./pages/SupportUs"));
const root = ReactDOM.createRoot(document.getElementById("root"));
serviceWorkerRegistration.register();
root.render(
  <React.StrictMode>
    <AuthProvider>
    <BrowserRouter>
    <Elements stripe={stripePromise}>
      <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<PrivateRoute><Home /></PrivateRoute>} />
          <Route path="usermanagement" element={<PrivateRoute><Crud /></PrivateRoute>} />
          <Route path="login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="currencyconvertor" element={<PrivateRoute><CurrencyConverter /></PrivateRoute>} />
          <Route path="contactus" element={<PrivateRoute><ContactUs /></PrivateRoute>} />
          <Route path="supportus" element={<PrivateRoute><SupportUs /></PrivateRoute>} />
          <Route path="*" element={<PublicRoute><PageNotFound /></PublicRoute>} />
        </Route>
      </Routes>
      </Suspense>
    </Elements>
    </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import ValidatePage from './components/ValidatePage';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/validate/:token" element={<ValidateRoute />} />
        <Route path="*" element={<App />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

function ValidateRoute() {
  const token = window.location.pathname.split('/validate/')[1];
  return <ValidatePage token={token} />;
}

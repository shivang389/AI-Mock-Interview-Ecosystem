import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css'; // Or your custom Tailwind/CSS file import paths

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* CRITICAL FIX: Higher-order wrapper seeds context down through App hook subroutines */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
import React, { StrictMode } from "react";
import { createRoot } from 'react-dom/client';
import "./styles.css";

import App from "./App";

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  <StrictMode>
    <App />
    <div className="overlay">
      <h1>Morphogenesis</h1>
    </div>
  </StrictMode>
);

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./components/App";
import { BoardProvider } from "./context/BoardContext";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BoardProvider>
      <App />
    </BoardProvider>
  </StrictMode>
);

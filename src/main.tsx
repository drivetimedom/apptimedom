import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initializeCustomization } from "./lib/customization";

// Initialize customization on app start
initializeCustomization();

createRoot(document.getElementById("root")!).render(<App />);

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import BurlingOnboarding from "./BurlingOnboarding.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BurlingOnboarding />
  </StrictMode>
);

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./ui/App.jsx";
import "./ui/global-style.css";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<App />
	</StrictMode>,
);

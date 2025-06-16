import { createRoot } from "react-dom/client";
import App from "./App.jsx";

const storage = window.localStorage;

if (!storage.getItem("randomized_songs")) {
	storage.setItem("randomized_songs", false);
}

createRoot(document.getElementById("root")).render(
	// <StrictMode>
	<App />
	// </StrictMode>
);

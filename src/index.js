import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import store from "./app/store";
import { Provider } from "react-redux";
import { reportError } from "./helpers/errors/reportError";
import { notifyError } from "./helpers/notify";

// ── Global unhandled-error listeners ────────────────────────────────
// These catch errors that escape React's error boundary
// (e.g. async code, event handlers, third-party scripts).

/** Rate-limiter: show at most 1 generic toast per 3 seconds */
let lastGlobalToast = 0;
const TOAST_COOLDOWN = 2000;

function handleGlobalError(error) {
  reportError(error, { source: 'global-listener' });

  const now = Date.now();
  if (now - lastGlobalToast > TOAST_COOLDOWN) {
    lastGlobalToast = now;
    notifyError('Something went wrong. Please try again.');
  }
}

window.addEventListener('error', (event) => {
  // Ignore ResizeObserver errors (benign browser noise)
  if (event.message?.includes('ResizeObserver')) return;
  handleGlobalError(event.error || event);
});

window.addEventListener('unhandledrejection', (event) => {
  handleGlobalError(event.reason);
});

// ── Render ──────────────────────────────────────────────────────────
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);

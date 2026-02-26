import "./App.css";
import "./Styles/variables.css"; // Import design token CSS variables
import { BrowserRouter } from "react-router-dom";
import "react-date-range/dist/styles.css"; // main style file
import "react-date-range/dist/theme/default.css"; // theme css file
import AppLogout from "./components/logout/Logout";
import AppRoutes from "./routes";
import AppErrorBoundary from "./components/AppErrorBoundary";
import StyledToaster from "./components/StyledToaster";

function App() {
  return (
    <AppErrorBoundary>
      <AppLogout>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AppLogout>

      {/* Single app-wide Sonner Toaster – no page should render its own */}
      <StyledToaster />
    </AppErrorBoundary>
  );
}

export default App;




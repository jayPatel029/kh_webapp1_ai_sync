import "./App.css";
import "./Styles/variables.css"; // Import design token CSS variables
import { BrowserRouter } from "react-router-dom";
import "react-date-range/dist/styles.css"; // main style file
import "react-date-range/dist/theme/default.css"; // theme css file
import AppLogout from "./components/logout/Logout";
import AppRoutes from "./routes";

function App() {
  return (
    <AppLogout>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppLogout>
  );
}

export default App;




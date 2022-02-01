import "css/global/Global.css";

// Colors
import "css/global/colors/ColorVariables.css";
import "css/global/colors/BackgroundColorClasses.css";
import "css/global/colors/ColorClasses.css";

// Fonts
import "css/global/fonts/FontClasses.css";
import "css/global/fonts/FontVariables.css";

import Routes from "routes/Routes";
import { BrowserRouter } from "react-router-dom";
import Header from "components/header/Header";

function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes />
    </BrowserRouter>
  );
}

export default App;

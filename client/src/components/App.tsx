import { useState } from "react";
import "./App.css";
import { AppContext } from "./AppContext";
import { Heading } from "./Heading";
import { MainSection } from "./MainSection";

function App() {
  const [isSidebarOpen, setSidebarState] = useState(false);

  return (
    <AppContext.Provider value={{ isSidebarOpen, setSidebarState }}>
      <Heading />
      <MainSection isSidebarOpen={isSidebarOpen} />
    </AppContext.Provider>
  );
}

export default App;

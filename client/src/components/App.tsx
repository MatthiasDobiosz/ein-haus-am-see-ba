import { useState } from "react";
import "./App.css";
import { SidebarContext } from "./Sidebar/SidebarContext";
import { Heading } from "./Heading";
import { MainSection } from "./MainSection";
import { SnackbarContextProvider } from "./Snackbar/SnackbarContextProvider";

function App() {
  const [isSidebarOpen, setSidebarState] = useState(false);

  return (
    <SnackbarContextProvider>
      <SidebarContext.Provider value={{ isSidebarOpen, setSidebarState }}>
        <Heading />
        <MainSection isSidebarOpen={isSidebarOpen} />
      </SidebarContext.Provider>
    </SnackbarContextProvider>
  );
}

export default App;

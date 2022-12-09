import { useState } from "react";
import "./App.css";
import { SidebarContext } from "./Sidebar/SidebarContext";
import { Heading } from "./Heading";
import { MainSection } from "./MainSection";
import { SnackbarContextProvider } from "./Snackbar/SnackbarContextProvider";
import { MapContextProvider } from "./Map/MapProvider";
import { FiltersContextProvider } from "./Sidebar/Filter/FiltersContextProvider";

/**
 * Main App Component that wraps the MainSection and the Header in all context providers
 */
function App() {
  const [isSidebarOpen, setSidebarState] = useState(false);

  return (
    <MapContextProvider>
      <FiltersContextProvider>
        <SnackbarContextProvider>
          <SidebarContext.Provider value={{ isSidebarOpen, setSidebarState }}>
            <Heading />
            <MainSection isSidebarOpen={isSidebarOpen} />
          </SidebarContext.Provider>
        </SnackbarContextProvider>
      </FiltersContextProvider>
    </MapContextProvider>
  );
}

export default App;

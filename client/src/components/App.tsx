import { useState } from "react";
import "./App.css";
import { SidebarContext } from "./Sidebar/SidebarContext";
import { Heading } from "./Heading";
import { MainSection } from "./MainSection";
/**
 * Main App Component that wraps the MainSection and the Header in all context providers
 */
function App() {
  const [isSidebarOpen, setSidebarState] = useState(false);

  return (
    <SidebarContext.Provider value={{ isSidebarOpen, setSidebarState }}>
      <Heading />
      <MainSection isSidebarOpen={isSidebarOpen} />
    </SidebarContext.Provider>
  );
}

export default App;

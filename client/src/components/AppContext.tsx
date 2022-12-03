import { createContext } from "react";

interface AppContextState {
  isSidebarOpen: boolean;
  setSidebarState: (isOpen: boolean) => void;
}

export const AppContext = createContext({} as AppContextState);

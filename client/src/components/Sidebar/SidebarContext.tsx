import { createContext } from "react";

interface SidebarContextState {
  /** current state of the sidebar */
  isSidebarOpen: boolean;
  /** setter function to toggle sidebarState */
  setSidebarState: (isOpen: boolean) => void;
}

/**
 * Context for the whole Application to toggle Sidebar and fetch the current state
 */
export const SidebarContext = createContext({} as SidebarContextState);

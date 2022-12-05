import { Sidebar } from "./Sidebar/Sidebar";
import { MapOverlay } from "./Map/MapOverlay";
import { useContext } from "react";
import { SnackbarContext } from "./Snackbar/SnackbarContext";
import { Snackbar } from "./Snackbar/Snackbar";

interface MainSectionProps {
  isSidebarOpen: boolean;
}

/**
 * MainSection component that render Map, Sidebar and conditional Snackbar
 */
export const MainSection = (props: MainSectionProps) => {
  const { isSidebarOpen } = props;
  const snackbarContext = useContext(SnackbarContext);
  console.log(snackbarContext.isDisplayed);

  return (
    <div className="h-[calc(100vh-50px)] w-[100vw] flex justify-end items-center">
      <Sidebar isSidebarOpen={isSidebarOpen} />
      <MapOverlay isSidebarOpen={isSidebarOpen} />
      {snackbarContext.isDisplayed && <Snackbar />}
    </div>
  );
};

import { Sidebar } from "./Sidebar/Sidebar";
import { MapOverlay } from "./Map/MapOverlay";
import { Snackbar } from "./Snackbar/Snackbar";
import { useSnackbar } from "./Snackbar/SnackbarContextProvider";

interface MainSectionProps {
  isSidebarOpen: boolean;
}

/**
 * MainSection component that render Map, Sidebar and conditional Snackbar
 */
export const MainSection = (props: MainSectionProps) => {
  const { isSidebarOpen } = props;
  const { isDisplayed } = useSnackbar();

  return (
    <div className="h-[calc(100vh-50px)] w-[100vw] flex justify-end items-center">
      <Sidebar isSidebarOpen={isSidebarOpen} />
      <MapOverlay isSidebarOpen={isSidebarOpen} />
      {isDisplayed && <Snackbar />}
    </div>
  );
};

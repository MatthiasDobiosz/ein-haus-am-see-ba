import { Sidebar } from "./Sidebar/Sidebar";
import { MapOverlay } from "./Map/MapOverlay";
import { Snackbar } from "./Snackbar/Snackbar";
import { observer } from "mobx-react";
import rootStore from "../stores/RootStore";
import { Legend } from "./Map/Legend";

interface MainSectionProps {
  isSidebarOpen: boolean;
}

/**
 * MainSection component that render Map, Sidebar and conditional Snackbar
 */
export const MainSection = observer((props: MainSectionProps) => {
  const { isSidebarOpen } = props;

  return (
    <div className="h-[calc(100vh-50px)] w-[100vw] flex justify-end items-center">
      <Sidebar isSidebarOpen={isSidebarOpen} />
      <MapOverlay isSidebarOpen={isSidebarOpen} />
      {rootStore.snackbarStore.isDisplayed && <Snackbar />}
      {rootStore.legendStore.isLegendActive && <Legend />}
    </div>
  );
});

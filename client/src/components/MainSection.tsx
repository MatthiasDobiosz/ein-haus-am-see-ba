import { Sidebar } from "./Sidebar/Sidebar";
import { MapOverlay } from "./Map/MapOverlay";
import { Snackbar } from "./Snackbar/Snackbar";
import { observer } from "mobx-react";
import rootStore from "../stores/RootStore";
import { Legend } from "./Map/Legend/Legend";
import { OverlayLegend } from "./Map/Legend/OverlayLegend";

interface MainSectionProps {
  isSidebarOpen: boolean;
}

/**
 * MainSection component that renders Map, Sidebar and conditional Snackbar and Legends
 */
export const MainSection = observer((props: MainSectionProps) => {
  const { isSidebarOpen } = props;

  return (
    <div className="h-[100vh] w-[100vw] flex justify-end items-center">
      <Sidebar isSidebarOpen={isSidebarOpen} />
      <MapOverlay />
      {rootStore.snackbarStore.isDisplayed && <Snackbar />}
      {rootStore.legendStore.isOverlayLegendActive && (
        <OverlayLegend left={rootStore.legendStore.isLegendActive} />
      )}
      {rootStore.legendStore.isLegendActive && <Legend />}
    </div>
  );
});

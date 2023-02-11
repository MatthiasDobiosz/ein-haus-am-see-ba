import { Sidebar } from "./Sidebar/Sidebar";
import { MapOverlay } from "./Map/MapOverlay";
import { Snackbar } from "./Snackbar/Snackbar";
import { observer } from "mobx-react";
import rootStore from "../stores/RootStore";
import { Legend } from "./Map/Legend/Legend";
import { PerformanceChart } from "./PerformanceChart";
import { OverlayLegend } from "./Map/Legend/OverlayLegend";

interface MainSectionProps {
  isSidebarOpen: boolean;
}

/**
 * MainSection component that render Map, Sidebar and conditional Snackbar
 */
export const MainSection = observer((props: MainSectionProps) => {
  const { isSidebarOpen } = props;

  if (rootStore.mapStore.performanceViewActive) {
    return (
      <div className="h-[100vh] w-[100vw] flex justify-center items-center">
        <PerformanceChart />
      </div>
    );
  }

  return (
    <div className="h-[100vh] w-[100vw] flex justify-end items-center">
      <Sidebar isSidebarOpen={isSidebarOpen} />
      <MapOverlay isSidebarOpen={isSidebarOpen} />
      {rootStore.snackbarStore.isDisplayed && <Snackbar />}
      {rootStore.legendStore.isOverlayLegendActive && (
        <OverlayLegend left={rootStore.legendStore.isLegendActive} />
      )}
      {rootStore.legendStore.isLegendActive && <Legend />}
    </div>
  );
});

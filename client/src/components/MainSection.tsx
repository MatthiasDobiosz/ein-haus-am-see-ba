import { Sidebar } from "./Sidebar/Sidebar";
import { MapOverlay } from "./Map/MapOverlay";

interface MainSectionProps {
  isSidebarOpen: boolean;
}

export const MainSection = (props: MainSectionProps) => {
  const { isSidebarOpen } = props;
  return (
    <div className="h-[calc(100vh-50px)] w-[100vw] flex justify-end items-center">
      <Sidebar isSidebarOpen={isSidebarOpen} />
      <MapOverlay isSidebarOpen={isSidebarOpen} />
    </div>
  );
};

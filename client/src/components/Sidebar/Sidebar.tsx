import { HiOutlineArrowNarrowLeft } from "react-icons/hi";
import { SidebarContext } from "./SidebarContext";
import { useContext } from "react";
import { observer } from "mobx-react";
import { SidebarPanelFilters } from "./SidebarPanelFilters";

interface SidebarProps {
  /** determines whether sidebar is currently active */
  isSidebarOpen: boolean;
}

/**
 * Sidebar Component that renders categories and controls all category and filter states
 */
export const Sidebar = observer((props: SidebarProps): JSX.Element => {
  const { setSidebarState } = useContext(SidebarContext);
  const { isSidebarOpen } = props;

  const toggleSidebar = () => {
    setSidebarState(!isSidebarOpen);
  };

  return (
    <div
      className="h-[calc(100vh-50px)] border-r-[1px] border-solid border-[#00000040] transition-width ease-in-out duration-500 bg-[#FFFAF0] overflow-y-auto"
      style={{ width: isSidebarOpen ? "30%" : "0px" }}
    >
      <div className="flex flex-row items-center bg-[#5cb85c] border-b-[1px] border-solid border-[#eee] min-h-[60px] leading-[60px]">
        <HiOutlineArrowNarrowLeft
          size={40}
          className="text-[#fff] hover:text-[#cccccc] cursor-pointer"
          onClick={() => toggleSidebar()}
        />
        <h2 className="text-[22px] m-0 font-normal pl-6  text-[#fff]">
          Filterauswahl
        </h2>
      </div>
      <SidebarPanelFilters toggleSidebar={toggleSidebar} />
    </div>
  );
});

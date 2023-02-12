import { BsArrowLeft, BsFillHouseFill } from "react-icons/bs";
import { SidebarContext } from "./SidebarContext";
import { useContext, useState } from "react";
import { observer } from "mobx-react";
import { SidebarPanelFilters } from "./SidebarPanelFilters";
import { Filters } from "./Filter/Filters";
import { HelpSection } from "./HelpSection";

export enum ViewPanels {
  MainPanel = "MainPanel",
  FilterPanel = "FilterPanel",
  HelpPanel = "HelpPanel",
}
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
  const [activePanel, setActivePanel] = useState(ViewPanels.MainPanel);

  const toggleSidebar = () => {
    setSidebarState(!isSidebarOpen);
  };

  console.log(activePanel);

  return (
    <>
      <div
        className="h-[100vh] border-r-[1px] border-solid border-[#00000040] transition-width ease-in-out duration-500 bg-[#FFFAF0] overflow-y-auto absolute left-0 z-[200]"
        style={{ width: isSidebarOpen ? "28%" : "0%" }}
      >
        <div className="flex flex-row items-center bg-lavender border-b-[1px] border-solid border-[#eee] min-h-[60px] leading-[60px] text-[1.9em] justify-around">
          <div className="flex flex-row items-center pl-[4rem]">
            <BsFillHouseFill color="#CD853F" />
            <h2 className="m-0 font-normal pl-6  text-[#000000]">
              Ein Haus am See
            </h2>
          </div>
          <div
            className="justify-self-end cursor-pointer text-[1em]"
            onClick={() => toggleSidebar()}
          >
            <BsArrowLeft />
          </div>
        </div>
        <div className="flex flex-row  justify-evenly bg-[#5cb85c] border-b-[1px] border-solid border-[#eee] h-[3em] leading-[3em] text-center align-middle ">
          <h2
            className={`text-[1.3em] m-0 font-normal  text-[#fff] cursor-pointer w-[33%]  ${
              activePanel === ViewPanels.MainPanel ? " bg-[#3b7c3b]" : ""
            }`}
            onClick={() => setActivePanel(ViewPanels.MainPanel)}
          >
            Filterauswahl
          </h2>
          <h2
            className={`text-[1.3em] m-0 font-normal  text-[#fff] cursor-pointer w-[33%]  ${
              activePanel === ViewPanels.FilterPanel ? " bg-[#3b7c3b]" : ""
            }`}
            onClick={() => setActivePanel(ViewPanels.FilterPanel)}
          >
            Meine Filter
          </h2>
          <h2
            className={`text-[1.3em] m-0 font-normal  text-[#fff] cursor-pointer w-[33%]   ${
              activePanel === ViewPanels.HelpPanel ? " bg-[#3b7c3b]" : ""
            }`}
            onClick={() => setActivePanel(ViewPanels.HelpPanel)}
          >
            Hilfe
          </h2>
        </div>
        {activePanel === ViewPanels.MainPanel ? (
          <SidebarPanelFilters toggleSidebar={toggleSidebar} />
        ) : activePanel === ViewPanels.FilterPanel ? (
          <Filters />
        ) : (
          <HelpSection />
        )}
      </div>
    </>
  );
});

import { useContext } from "react";
import { SidebarContext } from "./Sidebar/SidebarContext";
import { observer } from "mobx-react";

import { VisualType } from "../stores/MapStore";
import rootStore from "../stores/RootStore";
import { toggleDbTypeForBenchmark } from "../../../shared/benchmarking";
import { clearAllMeasures } from "./../../../shared/benchmarking";

/**
 * Heading Component that render Navbar with buttons
 */
export const Heading = observer((): JSX.Element => {
  const { isSidebarOpen, setSidebarState } = useContext(SidebarContext);

  const handleSidebarOpen = () => {
    setSidebarState(!isSidebarOpen);
  };

  const openSnackbar = () => {
    rootStore.mapStore.resetMapData();
  };

  const toggleDbType = () => {
    rootStore.mapStore.setOverpassActive();
    toggleDbTypeForBenchmark();
  };

  const togglePerformanceView = () => {
    rootStore.mapStore.setPerformanceViewActive();
  };

  return (
    <nav
      role="navigation"
      aria-label="Main"
      className="bg-lavender z-2 h-navHeight shadow flex justify-around items-center"
    >
      <h1 className="font-normal text-[2em]"> Ein Haus am See </h1>
      <button
        type="button"
        onClick={() => handleSidebarOpen()}
        className=" p-[0.6em] cursor-pointer overflow-hidden border-0 rounded-[2px] outline-none shadow bg-lightgreen text-whitesmoke hover:bg-darkgreen active:bg-darkgreen"
      >
        Wähle Filter
      </button>
      <div className=" flex flex-row gap-2">
        <button
          type="button"
          onClick={() => toggleDbType()}
          className=" p-[0.6em] cursor-pointer overflow-hidden border-0 rounded-[2px] outline-none shadow bg-lightorange text-whitesmoke hover:bg-darkorange active:bg-darkorange"
        >
          {rootStore.mapStore.overpassActive ? "Overpass" : "PostGIS"}
        </button>
        <button
          type="button"
          onClick={() => togglePerformanceView()}
          className=" p-[0.6em] cursor-pointer overflow-hidden border-0 rounded-[2px] outline-none shadow bg-lightorange text-whitesmoke hover:bg-darkorange active:bg-darkorange"
        >
          {rootStore.mapStore.performanceViewActive
            ? "View Map"
            : "View Performance"}
        </button>
        <button
          type="button"
          onClick={() => clearAllMeasures()}
          className=" p-[0.6em] cursor-pointer overflow-hidden border-0 rounded-[2px] outline-none shadow bg-lightorange text-whitesmoke hover:bg-darkorange active:bg-darkorange"
        >
          Clear
        </button>
      </div>
      <div className=" inline-flex relative items-center">
        <label className="inline text-[16px] ml-[10px] mr-[10px]">
          Darstellungsart:
        </label>
        <select
          className="italic opacity-[0.7] leading-[24px] pl-[2px] pr-[2px] pt-[3px] pb-[3px] cursor-pointer rounded-[4px] inline w-[100%]"
          defaultValue={"Overlay"}
          onChange={(e) =>
            rootStore.mapStore.setVisualType(
              e.target.value === "Overlay"
                ? VisualType.OVERLAY
                : VisualType.NORMAL
            )
          }
        >
          <option value="Overlay">Gebiete</option>
          <option value="Normal">Orte</option>
        </select>
      </div>
      <button
        type="button"
        className={`p-[0.6em] cursor-pointer overflow-hidden border-0 rounded-[2px] shadow bg-lightgreen text-whitesmoke hover:bg-darkgreen active:bg-darkgreen ${
          rootStore.filterStore.activeFilters.size > 0 ? "" : "button-disabled"
        }`}
      >
        Lade Daten manuell
      </button>
      <button
        type="button"
        className=" p-[0.6em] cursor-pointer overflow-hidden border-0 rounded-[6px]  bg-[#be150f] text-whitesmoke focus:ring-transparent hover:bg-[#a30d08] active:bg-[#a30d08]"
        onClick={() => openSnackbar()}
      >
        Karte zurücksetzen
      </button>
    </nav>
  );
});

import { useContext } from "react";
import { SidebarContext } from "./Sidebar/SidebarContext";
import { observer } from "mobx-react";

import { VisualType } from "../stores/MapStore";
import rootStore from "../stores/RootStore";
import {
  toggleDbTypeForBenchmark,
  toggleMeasuring,
} from "../../../shared/benchmarking";
import { clearAllMeasures } from "./../../../shared/benchmarking";
import axios from "../network/axiosInterceptor";

/**
 * Heading Component that render Navbar with buttons
 */
export const Heading = observer((): JSX.Element => {
  const { isSidebarOpen, setSidebarState } = useContext(SidebarContext);

  const handleSidebarOpen = () => {
    setSidebarState(!isSidebarOpen);
  };

  const resetMap = () => {
    rootStore.mapStore.resetMapData();
  };

  const toggleDbType = () => {
    rootStore.mapStore.toggleDbType();
    toggleDbTypeForBenchmark();
  };

  const togglePerformanceView = () => {
    rootStore.mapStore.setPerformanceViewActive();
  };

  const clearMeasures = async () => {
    clearAllMeasures();
    await axios.get("/backendLogs?clear=true");
  };

  const toggleMeasuringOn = async () => {
    toggleMeasuring(true);
    await axios.get("/backendLogs?on=true");
  };

  const toggleMeasuringOff = async () => {
    toggleMeasuring(false);
    await axios.get("/backendLogs?off=true");
  };

  const repeatLoad = () => {
    rootStore.mapStore.loadMapData();
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
          {rootStore.mapStore.dbType}
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
          onClick={() => clearMeasures()}
          className=" p-[0.6em] cursor-pointer overflow-hidden border-0 rounded-[2px] outline-none shadow bg-lightorange text-whitesmoke hover:bg-darkorange active:bg-darkorange"
        >
          Clear
        </button>
        <button
          type="button"
          onClick={() => toggleMeasuringOn()}
          className=" p-[0.6em] cursor-pointer overflow-hidden border-0 rounded-[2px] outline-none shadow bg-lightorange text-whitesmoke hover:bg-darkorange active:bg-darkorange"
        >
          On
        </button>
        <button
          type="button"
          onClick={() => toggleMeasuringOff()}
          className=" p-[0.6em] cursor-pointer overflow-hidden border-0 rounded-[2px] outline-none shadow bg-lightorange text-whitesmoke hover:bg-darkorange active:bg-darkorange"
        >
          Off
        </button>
        <button
          type="button"
          onClick={() => repeatLoad()}
          className=" p-[0.6em] cursor-pointer overflow-hidden border-0 rounded-[2px] outline-none shadow bg-lightorange text-whitesmoke hover:bg-darkorange active:bg-darkorange"
        >
          rep
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
                : e.target.value === "Normal"
                ? VisualType.NORMAL
                : VisualType.BOTH
            )
          }
        >
          <option value="Overlay">Gebiete</option>
          <option value="Normal">Orte</option>
          <option value="Both">Beides</option>
        </select>
      </div>
      <button
        type="button"
        className={`p-[0.6em] cursor-pointer overflow-hidden border-0 rounded-[2px] shadow bg-lightgreen text-whitesmoke hover:bg-darkgreen active:bg-darkgreen ${
          rootStore.filterStore.filtergroupsActive() ? "" : "button-disabled"
        }`}
      >
        Lade Daten manuell
      </button>
      <button
        type="button"
        className=" p-[0.6em] cursor-pointer overflow-hidden border-0 rounded-[6px]  bg-[#be150f] text-whitesmoke focus:ring-transparent hover:bg-[#a30d08] active:bg-[#a30d08]"
        onClick={() => resetMap()}
      >
        Karte zurücksetzen
      </button>
    </nav>
  );
});

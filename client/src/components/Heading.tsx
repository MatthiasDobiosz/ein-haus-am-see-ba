import { useContext } from "react";
import { SidebarContext } from "./Sidebar/SidebarContext";
import { observer } from "mobx-react";

import { VisualType } from "../stores/MapStore";
import rootStore from "../stores/RootStore";

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

  const setVisualType = (value: string) => {
    if (value === "Overlay") {
      rootStore.mapStore.setVisualType(VisualType.OVERLAY);
      rootStore.legendStore.showOverlayLegend();
    } else if (value === "Normal") {
      rootStore.mapStore.setVisualType(VisualType.NORMAL);
      rootStore.legendStore.hideOverlayLegend();
    } else {
      rootStore.mapStore.setVisualType(VisualType.BOTH);
      rootStore.legendStore.showOverlayLegend();
    }
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
      <div className=" inline-flex relative items-center">
        <label className="inline text-[16px] ml-[10px] mr-[10px]">
          Darstellungsart:
        </label>
        <select
          className="italic opacity-[0.7] leading-[24px] pl-[2px] pr-[2px] pt-[3px] pb-[3px] cursor-pointer rounded-[4px] inline w-[100%]"
          defaultValue={"Overlay"}
          onChange={(e) => setVisualType(e.target.value)}
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

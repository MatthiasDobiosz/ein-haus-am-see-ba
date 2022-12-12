import { useContext } from "react";
import { SidebarContext } from "./Sidebar/SidebarContext";
import { SnackbarType } from "./Snackbar/Snackbar";
import { useSnackbar } from "./Snackbar/SnackbarContextProvider";
import { VisualType, useMap } from "./Map/MapProvider";
import { useFilterLayers } from "./Sidebar/Filter/FiltersContextProvider";

/**
 * Heading Component that render Navbar with buttons
 */
export const Heading = (): JSX.Element => {
  const { setSelectedVisualType } = useMap();
  const { isSidebarOpen, setSidebarState } = useContext(SidebarContext);
  const { activeFilters } = useFilterLayers();
  const { displayMessage } = useSnackbar();

  const handleSidebarOpen = () => {
    setSidebarState(!isSidebarOpen);
  };

  const openSnackbar = () => {
    displayMessage("TestSnackbar", 10000, SnackbarType.SUCCESS);
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
          onChange={(e) =>
            setSelectedVisualType(
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
          activeFilters.size > 0 ? "" : "button-disabled"
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
};

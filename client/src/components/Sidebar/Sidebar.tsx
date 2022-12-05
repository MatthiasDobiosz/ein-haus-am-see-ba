import { HiOutlineArrowNarrowLeft } from "react-icons/hi";
import { SidebarContext } from "./SidebarContext";
import { useContext, useState } from "react";
import { SidebarCategory } from "./SidebarCategory";
import { Filter, Filters } from "./Filter/Filters";

interface SidebarProps {
  /** determines whether sidebar is currently active */
  isSidebarOpen: boolean;
}

/**
 * Sidebar Component that renders categories and controls all category and filter states
 */
export const Sidebar = (props: SidebarProps): JSX.Element => {
  const { setSidebarState } = useContext(SidebarContext);
  const { isSidebarOpen } = props;
  const [activeFilters, setActiveFilters] = useState<Filter[]>([]);

  const toggleSidebar = () => {
    setSidebarState(!isSidebarOpen);
  };

  /**
   * updates the filter array
   * @param filterValue - single filter to add to array
   */
  const handleFilterUpdate = (filterValue: Filter) => {
    setActiveFilters((prevActiveFilters) => [
      filterValue,
      ...prevActiveFilters,
    ]);
  };

  /**
   * updates the filter array
   * @param filterValue - single filter to remove from array
   */
  const removeFilter = (filterValue: Filter) => {
    setActiveFilters((prevActiveFilters) =>
      prevActiveFilters.filter((filter) => {
        return filter != filterValue;
      })
    );
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
      <div>
        <SidebarCategory
          title={"Natur"}
          items={["Parks und Grünflächen", "Wald", "Fluss"]}
          addFilterFunction={handleFilterUpdate}
        />
        <SidebarCategory
          title={"Gastronomie"}
          items={["Restaurant", "Cafe", "Bar"]}
          addFilterFunction={handleFilterUpdate}
        />
        <SidebarCategory
          title={"Öffentliche Verkehrsmittel"}
          items={["Bushaltestelle", "Bahnhof"]}
          addFilterFunction={handleFilterUpdate}
        />
        <SidebarCategory
          title={"Einkaufsmöglichkeiten"}
          items={["Supermarkt", "Einkaufszentrum"]}
          addFilterFunction={handleFilterUpdate}
        />

        <SidebarCategory
          title={"Bildung"}
          items={["Universtität und Hochschule", "Schule"]}
          addFilterFunction={handleFilterUpdate}
        />

        <SidebarCategory
          title={"Sonstiges"}
          items={["Autobahn", "Parkplatz"]}
          addFilterFunction={handleFilterUpdate}
        />
      </div>
      <hr className="border-t-[3px] border-solid border-[#bbb]" />
      <Filters activeFilters={activeFilters} removeFilter={removeFilter} />
    </div>
  );
};

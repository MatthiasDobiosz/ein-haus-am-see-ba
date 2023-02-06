import { SidebarCategory } from "./SidebarCategory";
import { Filters } from "./Filter/Filters";
import { observer } from "mobx-react";

interface SidebarPanelFiltersProps {
  toggleSidebar: () => void;
}

export const SidebarPanelFilters = observer(
  (props: SidebarPanelFiltersProps) => {
    return (
      <>
        <div>
          <SidebarCategory
            title={"Natur"}
            items={["Parks und Grünflächen", "Wald", "Fluss"]}
          />
          <SidebarCategory
            title={"Gastronomie"}
            items={["Restaurant", "Cafe", "Bar"]}
          />
          <SidebarCategory
            title={"Öffentliche Verkehrsmittel"}
            items={["Bushaltestelle", "Bahnhof"]}
          />
          <SidebarCategory
            title={"Einkaufsmöglichkeiten"}
            items={["Supermarkt", "Einkaufszentrum"]}
          />

          <SidebarCategory
            title={"Bildung"}
            items={["Universität und Hochschule", "Schule"]}
          />

          <SidebarCategory
            title={"Sonstiges"}
            items={["Autobahn", "Parkplatz"]}
          />
        </div>
        <hr className="border-t-[3px] border-solid border-[#bbb]" />
        <Filters />
      </>
    );
  }
);

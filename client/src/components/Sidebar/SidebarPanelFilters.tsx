import { SidebarCategory } from "./SidebarCategory";
import { observer } from "mobx-react";
import { ViewSettings } from "./ViewSettings";
import { FilterGroup } from "./Filter/Filters";
import {
  CustomSidebarCategory,
  mockFilterGroup,
} from "./CustomSidebarCategory";

interface SidebarPanelFiltersProps {
  toggleSidebar: () => void;
}

const ExampleFiltergroups: mockFilterGroup[] = [
  {
    groupName: "Restaurant am See",
    filters: [
      { tagName: "See", distance: 300, wanted: true },
      { tagName: "Restaurant", distance: 300, wanted: true },
    ],
    groupRelevance: 0.5,
  },
  {
    groupName: "Park am Fluss",
    filters: [
      { tagName: "Parks und Grünflächen", distance: 500, wanted: true },
      { tagName: "Fluss", distance: 300, wanted: true },
    ],
    groupRelevance: 0.5,
  },
];

export const SidebarPanelFilters = observer(
  (props: SidebarPanelFiltersProps) => {
    return (
      <>
        <div>
          <SidebarCategory
            title={"Natur"}
            items={["Parks und Grünflächen", "Wald", "Fluss", "See"]}
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
            items={["Universität und Hochschule", "Schule", "Kindergarten"]}
          />

          <SidebarCategory
            title={"Gesundheitswesen"}
            items={["Krankenhaus", "Klinik", "Apotheke"]}
          />

          <SidebarCategory title={"Freizeit"} items={["Kino", "Theater"]} />

          <SidebarCategory
            title={"Sonstiges"}
            items={["Autobahn", "Parkplatz"]}
          />

          <CustomSidebarCategory
            title="Beispiel-Filtergruppen"
            filtergroups={ExampleFiltergroups}
          />
        </div>
        <hr className="border-t-[3px] border-solid border-[#bbb]" />
        <ViewSettings />
      </>
    );
  }
);

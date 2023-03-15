import { observer } from "mobx-react";
import rootStore from "../../stores/RootStore";
import { SnackbarType } from "../../stores/SnackbarStore";
import { mockFilterGroup } from "./CustomSidebarCategory";
import { Filter } from "./Filter/FilterGroups";

interface CustomSidebarItemProps {
  /** name of single sidebar-Subcategory */
  filtergroup: mockFilterGroup;
}

/**
 * CustomSidebarItem Component that renders a single example subcategory
 */
export const CustomSidebarItem = observer(
  (props: CustomSidebarItemProps): JSX.Element => {
    const { filtergroup } = props;

    function performOsmQuery(): void {
      if (rootStore.filterStore.activeFilters.size === 0) {
        rootStore.snackbarStore.displayHandler(
          "Es können keine Daten geladen werden, da keine Filter aktiv sind",
          2500,
          SnackbarType.WARNING
        );
      } else {
        rootStore.mapStore.loadMapData();
      }
    }

    const addCustomFilterGroup = () => {
      //Check if groupname already exists
      if (!rootStore.filterStore.validateGroupName(filtergroup.groupName)) {
        //FIXME: display error
      } else {
        for (let i = 0; i < filtergroup.filters.length; i++) {
          const newFilter: Filter = {
            layername: rootStore.filterStore.getUniqueLayerName(
              filtergroup.filters[i].tagName,
              filtergroup.groupName
            ),
            tagName: filtergroup.filters[i].tagName,
            distance: filtergroup.filters[i].distance,
            measurement: "m",
            wanted: filtergroup.filters[i].wanted,
            points: [],
            features: [],
            originalData: null,
            group: filtergroup.groupName,
          };
          rootStore.filterStore.addNewFilterToGroup(
            newFilter,
            i === 0,
            filtergroup.groupName,
            filtergroup.groupRelevance
          );
          // rootStore.filterStore.addFilter(newFilter);

          // load map data automatically after 800ms (timeout so the snackbars wont overlap)
          setTimeout(() => {
            performOsmQuery();
          }, 800);
        }
      }
    };

    return (
      <>
        <a
          className={`block w-[100%] bg-[#f8f0e0] text-[#000000] py-[12px] px-[16px] no-underline hover:bg-[#ece6da] cursor-pointer`}
          onClick={() => addCustomFilterGroup()}
        >
          {filtergroup.groupName}
        </a>
      </>
    );
  }
);

import { observer } from "mobx-react";
import { FilterItem } from "./FilterItem";
import { FilterGroup, FilterRelevance } from "./FilterGroups";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { useState } from "react";
import rootStore from "../../../stores/RootStore";
import { SnackbarType } from "../../../stores/SnackbarStore";
import { BsTrash } from "react-icons/bs";
import { DeleteModal } from "./DeleteModal";

interface FilterGroupProps {
  filtergroup: FilterGroup;
}

export const FilterGroupItem = observer(
  (props: FilterGroupProps): JSX.Element => {
    const { filtergroup } = props;
    // boolean to display delete modal
    const [deleteFilterGroup, setDeleteFilterGroup] = useState(false);
    // toggle to disable or enable the view of the filter group
    const [filtergroupActive, setFiltergroupActive] = useState(
      filtergroup.active
    );

    // removes filter from map and store
    function removeFiltersAndUpdateMap() {
      rootStore.mapStore.removeGroupData(filtergroup);
      rootStore.snackbarStore.displayHandler(
        `Filtergruppe "${filtergroup.groupName}" wurde entfernt.`,
        1200,
        SnackbarType.SUCCESS
      );
    }

    // sets the view of the filergroup to active
    function toggleFiltergroupActive() {
      setFiltergroupActive(!filtergroupActive);
      rootStore.filterStore.toggleFiltergroupActive(filtergroup.groupName);
      rootStore.mapStore.updateData(filtergroup);
    }

    // loads osm data for filtergroup
    async function performOsmQuery(): Promise<void> {
      if (rootStore.filterStore.activeFilters.size === 0) {
        rootStore.snackbarStore.displayHandler(
          "Es können keine Daten geladen werden, da keine Filter aktiv sind",
          2500,
          SnackbarType.WARNING
        );
        return;
      }
      rootStore.mapStore.loadMapData();
    }

    // edits the group relevance
    function changeGroupRelevance(value: string) {
      let relevance = 0.2;
      if (value === "wenig") {
        relevance = FilterRelevance.notVeryImportant;
      } else if (value === "normal") {
        relevance = FilterRelevance.important;
      } else {
        relevance = FilterRelevance.veryImportant;
      }
      rootStore.filterStore.changeGroupRelevance(
        filtergroup.groupName,
        relevance
      );

      rootStore.snackbarStore.displayHandler(
        "Filtergruppe wurde erfolgreich bearbeitet!",
        1000,
        SnackbarType.SUCCESS
      );

      setTimeout(() => {
        performOsmQuery();
      }, 200);
    }

    return (
      <>
        <div className="flex flex-col mt-[1em] ml-2 mr-2 align-middle justify-center border-[1px] border-[#e9e3e3] bg-[lavender] rounded-[2%] relative">
          <div className="mt-3 mb-3">
            <div className="flex flex-row justify-center">
              <p className="2xl:text-[1.3em] text-[1em] font-bold">
                {filtergroup.groupName}
              </p>
            </div>
            <div className="flex flex-row justify-center pt-2">
              <div className="flex flex-row text-[1.1em] mt-1">
                <span className="mr-2">Gruppengewichtung: </span>
                <select
                  defaultValue={
                    filtergroup.groupRelevance === 0.2
                      ? "wenig"
                      : filtergroup.groupRelevance === 0.5
                      ? "normal"
                      : "viel"
                  }
                  onChange={(e) => changeGroupRelevance(e.target.value)}
                  className="border-[1px] border-solid border-[#000000] h-[2.5vh]"
                >
                  <option value="wenig">wenig</option>
                  <option value="normal">normal</option>
                  <option value="viel">viel</option>
                </select>
              </div>
            </div>
            <div className="absolute top-3 right-2 text-[1.8em]">
              <button
                onClick={() => toggleFiltergroupActive()}
                className="pr-2"
              >
                {filtergroupActive ? <AiFillEyeInvisible /> : <AiFillEye />}
              </button>
              <button onClick={() => setDeleteFilterGroup(true)}>
                <BsTrash color={"#EE4B2B"} />
              </button>
            </div>
          </div>
          <ul className="text-m list-none pt-0 pr-[5px] pb-[10px] pl-[5px]">
            {filtergroup.filters.map((filterLayer) => {
              return (
                <FilterItem key={filterLayer.layername} filter={filterLayer} />
              );
            })}
          </ul>
        </div>
        {deleteFilterGroup && (
          <DeleteModal
            value={
              <>
                Möchtest du die Filtergruppe{" "}
                <span className="font-bold">{filtergroup.groupName}</span>{" "}
                löschen?
              </>
            }
            onClose={setDeleteFilterGroup}
            onDelete={removeFiltersAndUpdateMap}
            group
          />
        )}
      </>
    );
  }
);

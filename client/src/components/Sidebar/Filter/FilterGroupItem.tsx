import { observer } from "mobx-react";
import { FilterItem } from "./FilterItem";
import { FilterGroup, FilterRelevance } from "./Filters";
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
    const [isDeleting, setIsDeleting] = useState(false);
    const [filtergroupActive, setFiltergroupActive] = useState(
      filtergroup.active
    );

    function removeFiltersAndUpdateMap() {
      rootStore.mapStore.removeGroupData(filtergroup);
      rootStore.snackbarStore.displayHandler(
        `Filtergruppe "${filtergroup.groupName}" wurde entfernt.`,
        1200,
        SnackbarType.SUCCESS
      );
    }

    function toggleFiltergroupActive() {
      setFiltergroupActive(!filtergroupActive);
      rootStore.filterStore.toggleFiltergroupActive(filtergroup.groupName);
      rootStore.mapStore.updateData(filtergroup);
    }

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

    function changeGroupRelevance(value: string) {
      let relevance = 0.2;
      if (value === "optional") {
        relevance = FilterRelevance.notVeryImportant;
      } else if (value === "wichtig") {
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
        <div className="flex flex-col mt-[1em] ml-2 mr-2 align-middle justify-center border-2 bg-[#fff] border-none relative">
          <div className="mt-3 mb-3">
            <div className="flex flex-row justify-center">
              <p className="2xl:text-[1.3em] xl:text-[1em] lg:text-[0.8em] md:text-[0.7em] sm:text-[0.6em] font-bold">
                {filtergroup.groupName}
              </p>
            </div>
            <div className="flex flex-row justify-center pt-2">
              <div className="flex flex-row 2xl:text-[1.1em] xl:text-[0.8em] lg:text-[0.7em] md:text-[0.6em] sm:text-[0.5em] mt-1">
                <span className="mr-2">Gruppenrelevanz: </span>
                <select
                  defaultValue={filtergroup.groupRelevance}
                  onChange={(e) => changeGroupRelevance(e.target.value)}
                  className="border-[1px] border-solid border-[#000000] h-[2vh]"
                >
                  <option value="optional">optional</option>
                  <option value="wichtig">wichtig</option>
                  <option value="sehr wichtig">sehr wichtig</option>
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
              <button onClick={() => setIsDeleting(true)}>
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
        {isDeleting && (
          <DeleteModal
            value={
              <>
                Möchtest du die Filtergruppe{" "}
                <span className="font-bold">{filtergroup.groupName}</span>{" "}
                löschen?
              </>
            }
            onClose={setIsDeleting}
            onDelete={removeFiltersAndUpdateMap}
            group
          />
        )}
      </>
    );
  }
);

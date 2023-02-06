import { observer } from "mobx-react";
import { useState } from "react";
import rootStore from "../../../stores/RootStore";
import { SnackbarType } from "../../../stores/SnackbarStore";
import { FilterModal } from "./FilterModal";
import { Filter } from "./Filters";

interface FilterItemProps {
  /** filter object that contains relevant filter properties */
  filter: Filter;
}
//FIXME: wird evtl. durch Gruppe ersetzt

/**
 * FilterItem Component that shows a single filter
 */
export const FilterItem = observer((props: FilterItemProps) => {
  const { filter } = props;
  const [showFilterModal, setShowFilterModal] = useState(false);

  const getRelevanceString = () => {
    const relevanceValue = rootStore.filterStore.getRelevanceValue(filter);
    return relevanceValue === 0.2
      ? "optional"
      : relevanceValue === 0.5
      ? "wichtig"
      : "sehr wichtig";
  };

  // removes the filter from the store and also from the map
  const onFilterRemoved = () => {
    rootStore.mapStore.removeData(filter);
    rootStore.snackbarStore.displayHandler(
      `Filter "${filter.tagName}" wurde entfernt.`,
      1200,
      SnackbarType.SUCCESS
    );
  };

  const getCorrectDistance = () => {
    if (filter.measurement === "km") {
      return (filter.distance / 1000).toString();
    } else {
      return filter.distance.toString();
    }
  };

  return (
    <>
      <li className="relative p-[6px] my-[3px] mx-0 transition-[0.2s] border-[1px] border-solid border-[#d3d3d3] hover:bg-[#f7f2df]">
        <h4 className="my-[4px] mx-0">{filter.tagName}</h4>
        <button
          className=" py-[0.2] px-[0.4em] mt-0 mr-[6px] mb-[1px] ml-[2px] cursor-pointer overflow-hidden border-0 outline-none float-right rounded-[15px] bg-[#e20f00] text-[#fff]"
          onClick={() => onFilterRemoved()}
        >
          Löschen
        </button>
        <button
          className=" py-[0.2] px-[0.4em] mt-0 mr-[6px] mb-[1px] ml-[2px] cursor-pointer overflow-hidden border-0 outline-none float-right rounded-[15px] bg-[#34bb46] text-[#fff]"
          onClick={() => setShowFilterModal(true)}
        >
          Bearbeiten
        </button>
        Entfernung: {getCorrectDistance() + filter.measurement}, Relevanz:{" "}
        {getRelevanceString()},{" "}
        {filter.wanted ? "erwünscht" : "nicht erwünscht"}
      </li>
      {showFilterModal && (
        <FilterModal
          value={`Filter ${filter.tagName} bearbeiten`}
          open
          onClose={() => setShowFilterModal(false)}
          editing={true}
          filter={filter}
        />
      )}
    </>
  );
});

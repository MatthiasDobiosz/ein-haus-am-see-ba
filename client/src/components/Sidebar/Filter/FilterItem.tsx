import { observer } from "mobx-react";
import rootStore from "../../../stores/RootStore";
import { SnackbarType } from "../../../stores/SnackbarStore";
import { Filter } from "./Filters";

interface FilterItemProps {
  /** filter object that contains relevant filter properties */
  filter: Filter;
}

/**
 * FilterItem Component that shows a single filter
 */
export const FilterItem = observer((props: FilterItemProps) => {
  const { filter } = props;

  const getRelevanceString = (relevanceValue: number) => {
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
      `Filter "${filter.layername}" wurde entfernt.`,
      1200,
      SnackbarType.SUCCESS
    );
  };

  return (
    <li className="relative p-[6px] my-[3px] mx-0 transition-[0.2s] border-[1px] border-solid border-[#d3d3d3] hover:bg-[#f7f2df]">
      <h4 className="my-[4px] mx-0">{filter.layername}</h4>
      <button
        className=" py-[0.2] px-[0.4em] mt-0 mr-[6px] mb-[1px] ml-[2px] cursor-pointer overflow-hidden border-0 outline-none float-right rounded-[15px] bg-[#e20f00] text-[#fff]"
        onClick={() => onFilterRemoved()}
      >
        Löschen
      </button>
      Entfernung: {filter.distance.toString() + filter.measurement}, Relevanz:{" "}
      {getRelevanceString(filter.relevanceValue)},{" "}
      {filter.wanted ? "erwünscht" : "nicht erwünscht"}
    </li>
  );
});

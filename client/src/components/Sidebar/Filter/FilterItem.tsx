import { Filter } from "./Filters";

interface FilterItemProps {
  /** filter object that contains relevant filter properties */
  filter: Filter;
  /** Function to remove a filter from the array of currently active filters*/
  removeFilter: (filterValue: Filter) => void;
}

/**
 * FilterItem Component that shows a single filter
 */
export const FilterItem = (props: FilterItemProps) => {
  const { filter, removeFilter } = props;

  return (
    <li className="relative p-[6px] my-[3px] mx-0 transition-[0.2s] border-[1px] border-solid border-[#d3d3d3] hover:bg-[#f7f2df]">
      <h4 className="my-[4px] mx-0">{filter.name}</h4>
      <button
        className=" py-[0.2] px-[0.4em] mt-0 mr-[6px] mb-[1px] ml-[2px] cursor-pointer overflow-hidden border-0 outline-none float-right rounded-[15px] bg-[#e20f00] text-[#fff]"
        onClick={() => removeFilter(filter)}
      >
        Löschen
      </button>
      Entfernung: {filter.distance}, Relevanz: {filter.relevance},{" "}
      {filter.polarity}
    </li>
  );
};

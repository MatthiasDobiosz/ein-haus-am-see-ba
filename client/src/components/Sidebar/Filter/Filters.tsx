import { FilterItem } from "./FilterItem";

/**
 * Filter Interface
 *
 * @interface Filter
 * @param name - category of the filter
 * @param distance - specified distance (m/km) of the filter
 * @param relevance - importance of the filter
 * @param polarity - whether the filter is to exclude or include nodes
 */
export interface Filter {
  name: string;
  distance: string;
  relevance: string;
  polarity: string;
}

interface FiltersProps {
  /** filterArray of currently active filters */
  activeFilters: Filter[];
  /** Function to remove a filter from the array of currently active filters*/
  removeFilter: (filterValue: Filter) => void;
}

/**
 * Filters Component that maps the list of currently active filters
 */
export const Filters = (props: FiltersProps): JSX.Element => {
  const { activeFilters, removeFilter } = props;

  return (
    <div>
      {activeFilters.length > 0 ? (
        <ul className="text-[0.9em] list-none pt-0 pr-[5px] pb-[10px] pl-[5px]">
          {activeFilters.map((filter) => {
            return <FilterItem filter={filter} removeFilter={removeFilter} />;
          })}
        </ul>
      ) : (
        <div className="p-[20px]">
          <p className="m-[14px]">Keine Filter sind im Moment aktiv.</p>
          <p className="m-[14px]">
            Klicke auf eine der Kategorien oben, um Filter auszuwählen.
          </p>
        </div>
      )}
    </div>
  );
};

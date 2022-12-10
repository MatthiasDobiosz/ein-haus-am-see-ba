import { ReactNode, useContext, useState } from "react";
import { Filter } from "./Filters";
import { FiltersContext } from "./FiltersContext";

interface FiltersContextProviderProps {
  children: ReactNode;
}

/**
 * custom FilterContextProvider Component that allows the rest of the application to see and change current FilterLayers
 */
export const FiltersContextProvider = (props: FiltersContextProviderProps) => {
  const [allFilterLayers, setAllFilterLayers] = useState<Filter[]>([]);
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set());

  const addFilter = (filterLayer: Filter): void => {
    //dont add if filter with that name already exists
    //TODO: show error message to user that he cant create more than one filter of the same category
    if (!activeFilters.has(filterLayer.layername)) {
      setAllFilterLayers((prevFilterLayers) => [
        filterLayer,
        ...prevFilterLayers,
      ]);
      const newActiveFilters = activeFilters;
      newActiveFilters.add(filterLayer.layername);
      setActiveFilters(newActiveFilters);
    }
  };

  const removeFilter = (filterLayer: Filter): void => {
    setAllFilterLayers((prevFilterLayers) =>
      prevFilterLayers.filter((prevFilterLayer) => {
        !(prevFilterLayer.layername === filterLayer.layername);
      })
    );
    const newActiveFilters = activeFilters;
    newActiveFilters.delete(filterLayer.layername);
    setActiveFilters(newActiveFilters);
  };

  const getFilterLayer = (name: string): Filter | null => {
    const filter = allFilterLayers.find((filterLayer) => {
      return filterLayer.layername === name;
    });
    if (filter) {
      return filter;
    }
    return null;
  };

  const clearAllFilters = (): void => {
    setAllFilterLayers([]);
    setActiveFilters(new Set());
  };
  return (
    <FiltersContext.Provider
      value={{
        allFilterLayers,
        activeFilters,
        addFilter: addFilter,
        removeFilter: removeFilter,
        getFilterLayer: getFilterLayer,
        clearAllFilters: clearAllFilters,
      }}
    >
      {props.children}
    </FiltersContext.Provider>
  );
};

// expose a helper hook to easily grab the state anywhere in your app
// wary of how you can optimise it:
// https://kentcdodds.com/blog/how-to-optimize-your-context-value
export function useFilterLayers() {
  const context = useContext(FiltersContext);
  if (context === undefined)
    throw Error("You forgot to wrap your app with <FiltersContextProvider />");
  return context;
}

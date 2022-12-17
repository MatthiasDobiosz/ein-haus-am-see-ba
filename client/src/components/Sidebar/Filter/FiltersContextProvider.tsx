import { ReactNode, useContext, useState } from "react";
import { MapboxMap } from "react-map-gl";
import {
  endPerformanceMeasure,
  evaluateMeasure,
  startPerformanceMeasure,
} from "../../../../../shared/benchmarking";
import { convertPolygonCoordsToPixelCoords } from "../../Map/mapUtils";
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
    console.log("filter:");
    console.log(filterLayer);
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

  function getFilterLayer(name: string): Filter | null {
    console.log("get: ", name);
    console.log(allFilterLayers);
    const filter = allFilterLayers.find((filterLayer) => {
      return filterLayer.layername === name;
    });
    if (filter) {
      return filter;
    }
    return null;
  }

  const clearAllFilters = (): void => {
    setAllFilterLayers([]);
    setActiveFilters(new Set());
  };

  /**
   * ! Has to be called on every overlay update to recalculate the geojson polygons in point/screen coords.
   * ! Otherwise they would not be in sync with the map!!
   */
  const recalculateScreenCoords = (map: MapboxMap): void => {
    startPerformanceMeasure("recalculateAllScreenCoords");
    allFilterLayers.forEach((filterLayer) => {
      calculatePointCoordsForFeatures(filterLayer, map);
    });
    endPerformanceMeasure("recalculateAllScreenCoords");
    evaluateMeasure();
  };

  const calculatePointCoordsForFeatures = (
    filterLayer: Filter,
    map: MapboxMap
  ): void => {
    filterLayer.points.length = 0;
    for (let i = 0; i < filterLayer.features.length; i++) {
      convertPolygonCoordsToPixelCoords(
        map,
        filterLayer.features[i],
        filterLayer
      );
    }
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
        recalculateScreenCoords: recalculateScreenCoords,
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

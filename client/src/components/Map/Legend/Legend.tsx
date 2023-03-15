import { observer } from "mobx-react";
import rootStore from "../../../stores/RootStore";
import { LegendItem } from "./LegendItem";

/**
 * Legend component for POI-View
 */

export const Legend = observer((): JSX.Element => {
  return (
    <div className="absolute bottom-[10em]  bg-[#ffffffcc] mr-[1em] overflow-auto rounded-[3px] p-[10px] shadow-sm leading-[18px] h-[220px] mb-[50px] w-[150px] ">
      {rootStore.legendStore.legendItems.map((legendItem) => {
        return (
          <LegendItem legendItem={legendItem} key={legendItem.layerName} />
        );
      })}
    </div>
  );
});

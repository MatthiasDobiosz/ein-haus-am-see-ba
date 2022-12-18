import { observer } from "mobx-react";
import rootStore from "../../stores/RootStore";
import { LegendItem } from "./LegendItem";

export const Legend = observer((): JSX.Element => {
  return (
    <div className="absolute bottom-[10px] right-[-10px] bg-[#ffffffcc] mr-[20px] overflow-auto rounded-[3px] p-[10px] shadow-sm leading-[18px] h-[220px] mb-[50px] w-[150px] ">
      {rootStore.legendStore.legendItems.map((legendItem) => {
        return <LegendItem legendItem={legendItem} />;
      })}
    </div>
  );
});

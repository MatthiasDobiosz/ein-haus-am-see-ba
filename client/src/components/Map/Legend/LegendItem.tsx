import { observer } from "mobx-react";
import { LegendObject } from "../../../stores/LegendStore";

interface LegendItemProps {
  legendItem: LegendObject;
}

export const LegendItem = observer((props: LegendItemProps): JSX.Element => {
  const { layerName, color } = props.legendItem;

  const getId = () => {
    const firstWordIndex = layerName.indexOf(" ");
    if (firstWordIndex !== -1) {
      return layerName.substring(0, firstWordIndex);
    } else {
      return layerName;
    }
  };
  return (
    <div id={getId()}>
      <span
        className=" inline-block rounded-[20%] w-[10px] h-[10px] mr-[5px]"
        style={{ backgroundColor: color }}
      ></span>
      <span>{layerName}</span>
    </div>
  );
});

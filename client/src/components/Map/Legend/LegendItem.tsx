import { observer } from "mobx-react";
import { LegendObject } from "../../../stores/LegendStore";

interface LegendItemProps {
  legendItem: LegendObject;
}

/**
 * Single Legend Item Component
 */
export const LegendItem = observer((props: LegendItemProps): JSX.Element => {
  const { layerName, color } = props.legendItem;

  /**
   * gets Id of specific layer/category
   */
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

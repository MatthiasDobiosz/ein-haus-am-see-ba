import { observer } from "mobx-react";
import rootStore from "../../stores/RootStore";
import { GrayscaleGradient } from "./GrayscaleGradient";

interface OverlayLegendProps {
  left: boolean;
}

export const OverlayLegend = observer(
  (props: OverlayLegendProps): JSX.Element => {
    if (rootStore.filterStore.getAllActiveLayers().length === 0) {
      return <></>;
    }
    return (
      <div
        className={`absolute bottom-[10px] right-[-10px] text-[0.8em] bg-[#ffffffcc] mr-[20px] overflow-auto rounded-[3px] p-[10px] shadow-sm leading-[18px] h-[150px] mb-[50px] w-[5em] ${
          props.left ? "mr-[18em]" : "mr-[20px]"
        }`}
      >
        <div className="flex flex-col text-center">
          <span>Gut</span>
          <div className="mt-2 ml-2">
            <GrayscaleGradient width="20" height="80" />
          </div>
          <span>Schlecht</span>
        </div>
      </div>
    );
  }
);

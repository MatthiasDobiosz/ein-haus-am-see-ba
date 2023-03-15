import { observer } from "mobx-react";
import rootStore from "../../../stores/RootStore";
import { GrayscaleGradient } from "./GrayscaleGradient";

interface OverlayLegendProps {
  left: boolean;
}

/**
 * OverlayLegend-Component that wraps the gradient
 */
export const OverlayLegend = observer(
  (props: OverlayLegendProps): JSX.Element => {
    if (rootStore.filterStore.getAllActiveLayers().length === 0) {
      return <></>;
    }
    return (
      <div
        className={`absolute bottom-[10px]  text-[0.8em] bg-[#85bce0] mr-[1em] overflow-auto rounded-[3px] p-[1em] shadow-sm leading-[18px] h-[auto] mb-[50px] w-[auto]`}
      >
        <div className="flex flex-col p-[0.4em]">
          <span className="self-center font-bold text-[1.2em]">
            {" "}
            Übereinstimmung{" "}
          </span>
          <div className="mt-2 self-center">
            <GrayscaleGradient width="120" height="30" />
          </div>
          <div className="flex flex-row justify-between text-[1em] w-[90%] self-center mt-1">
            <span>Hoch</span>
            <span>Wenig</span>
          </div>
        </div>
      </div>
    );
  }
);

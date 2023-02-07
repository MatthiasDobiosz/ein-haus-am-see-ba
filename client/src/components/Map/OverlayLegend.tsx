import { observer } from "mobx-react";

interface OverlayLegendProps {
  left: boolean;
}

export const OverlayLegend = observer(
  (props: OverlayLegendProps): JSX.Element => {
    return (
      <div
        className={`absolute bottom-[10px] right-[-10px] bg-[#ffffffcc] mr-[20px] overflow-auto rounded-[3px] p-[10px] shadow-sm leading-[18px] h-[150px] mb-[50px] w-[150px] ${
          props.left ? "mr-[15em]" : "mr-[20px]"
        }`}
      >
        <div>
          <span>Übereinstimmung</span>
        </div>
        <div className="mt-2 ml-2">
          <div>
            <span className=" inline-block rounded-[20%] w-[10px] h-[10px] mr-[5px] bg-[#fff]"></span>
            <span>Sehr gut</span>
          </div>
          <div>
            <span className=" inline-block rounded-[20%] w-[10px] h-[10px] mr-[5px] bg-[#CCCCCC]"></span>
            <span>Gut</span>
          </div>
          <div>
            <span className=" inline-block rounded-[20%] w-[10px] h-[10px] mr-[5px] bg-[#999999]"></span>
            <span>Teilweise</span>
          </div>
          <div>
            <span className=" inline-block rounded-[20%] w-[10px] h-[10px] mr-[5px] bg-[#333333]"></span>
            <span>Kaum</span>
          </div>
        </div>
      </div>
    );
  }
);

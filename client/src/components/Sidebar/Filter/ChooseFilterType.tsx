import { observer } from "mobx-react";
import { Dispatch, SetStateAction } from "react";

interface ChooseFilterTypeProps {
  setNewGroup: Dispatch<SetStateAction<boolean | null>>;
  onClose: Dispatch<SetStateAction<boolean>>;
}

export const ChooseFilterType = observer(
  (props: ChooseFilterTypeProps): JSX.Element => {
    return (
      <div className="bg-[#fff] my-[15%] mx-auto p-0 relative rounded-[8px] w-[40vw] modal-content">
        <h2 className="flex justify-center py-[12px] px-0 bg-[#5cb85c] text-[#fff] text-[1.5em] font-bold rounded-t-[8px] rounded-r-[8px]">
          Filtertyp wählen
        </h2>
        <div className="mt-[25px] flex justify-evenly items-center">
          <button
            type="button"
            className="mb-[1em] p-[0.8em] w-[10vw] cursor-pointer overflow-hidden border-0 outline-none rounded-[4px] bg-[#e8e8e8] text-[#000000] hover:bg-[#e2dede] active:bg-[#e2dede]"
            onClick={() => props.onClose(true)}
          >
            Abbrechen
          </button>
          <button
            type="button"
            className="mb-[1em] p-[0.8em] w-[10vw] cursor-pointer overflow-hidden border-0 outline-none rounded-[4px] bg-[#14bd5a] text-[#f5f5f5] hover:bg-[#11a74f] active:bg-[#11a74f]"
            onClick={() => props.setNewGroup(true)}
          >
            Neue Gruppe
          </button>
          <button
            type="button"
            className="mb-[1em] p-[0.8em] w-[10vw] cursor-pointer overflow-hidden border-0 outline-none rounded-[4px] bg-[#14bd5a] text-[#f5f5f5] hover:bg-[#11a74f] active:bg-[#11a74f]"
            onClick={() => props.setNewGroup(false)}
          >
            Zu Gruppe hinzufügen
          </button>
        </div>
      </div>
    );
  }
);

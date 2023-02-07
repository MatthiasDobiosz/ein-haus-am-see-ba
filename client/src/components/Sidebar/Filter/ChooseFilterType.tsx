import { observer } from "mobx-react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import rootStore from "../../../stores/RootStore";
import { SnackbarType } from "../../../stores/SnackbarStore";
import { AiOutlineClose } from "react-icons/ai";

interface ChooseFilterTypeProps {
  setNewGroup: Dispatch<SetStateAction<boolean | null>>;
  onClose: Dispatch<SetStateAction<boolean>>;
}

export const ChooseFilterType = observer(
  (props: ChooseFilterTypeProps): JSX.Element => {
    const [canAddToGroup, setCanAddToGroup] = useState(true);

    useEffect(() => {
      if (rootStore.filterStore.allFilterGroups.length === 0) {
        setCanAddToGroup(false);
      }
    }, []);

    function addToGroup() {
      if (canAddToGroup) {
        props.setNewGroup(false);
      } else {
        rootStore.snackbarStore.displayHandler(
          "Es existieren noch keine Gruppen",
          2000,
          SnackbarType.ERROR
        );
      }
    }
    return (
      <div className="bg-[#fff] my-[15%] mx-auto p-0 relative rounded-[8px] w-[30vw] modal-content">
        <div className="relative">
          <h2 className="flex justify-center py-[12px] px-0 bg-[#5cb85c] text-[#fff] text-[1.5em] font-bold rounded-t-[8px] rounded-r-[8px]">
            Filtertyp wählen
          </h2>
          <button
            className="absolute top-[20%] right-4 text-[24px]"
            onClick={() => props.onClose(true)}
          >
            <AiOutlineClose color="#fff" />
          </button>
        </div>
        <div className="w-[30vw] mt-[25px] px-[3em] text-center">
          <span className="text-[1.1em]">
            Wähle aus ob du eine neue Filtergruppe erstellen möchtest oder den
            Filter einer vorhandenen Gruppe hinzufügen willst.
          </span>
        </div>
        <div className="mt-[25px] flex justify-evenly items-center">
          <button
            type="button"
            className="mb-[1em] p-[0.8em] w-[9vw] text-[1em] cursor-pointer overflow-hidden border-0 outline-none rounded-[4px] bg-[#14bd5a] text-[#f5f5f5] hover:bg-[#11a74f] active:bg-[#11a74f]"
            onClick={() => props.setNewGroup(true)}
          >
            Neue Gruppe
          </button>
          <button
            type="button"
            className={`mb-[1em] p-[0.8em] w-[9vw] text-[1em] cursor-pointer overflow-hidden border-0 outline-none rounded-[4px] bg-[#14bd5a] text-[#f5f5f5] hover:bg-[#11a74f] active:bg-[#11a74f] ${
              canAddToGroup ? "" : "button-disabled"
            }`}
            onClick={() => addToGroup()}
          >
            Zu Gruppe hinzufügen
          </button>
        </div>
      </div>
    );
  }
);

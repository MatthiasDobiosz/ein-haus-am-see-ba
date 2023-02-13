import { observer } from "mobx-react";
import { Dispatch, ReactNode, SetStateAction } from "react";
import { createPortal } from "react-dom";

interface FilterModalProps {
  /** name of the filter/filtergroup to show modal for */
  value: ReactNode;
  /** function to trigger closing of the modal */
  onClose: Dispatch<SetStateAction<boolean>>;
  onDelete: () => void;
  group?: boolean;
}

export const DeleteModal = observer(
  (props: FilterModalProps): JSX.Element | null => {
    const { value, onClose, onDelete } = props;

    const portalDiv = document.getElementById("portal");

    const getErrorMessage = () => {
      return value;
    };

    if (!portalDiv) {
      return null;
    }

    return createPortal(
      <div className="fixed z-[1000] left-0 top-0 w-[100%] h-[100%] overflow-auto bg-[#00000066] block">
        <div className="bg-[#fff] my-[15%] mx-auto p-0 relative rounded-[8px] w-[20vw]">
          <h2 className="flex justify-center py-[12px] px-0 bg-red text-[#fff] text-[1.5em] font-bold rounded-t-[8px] rounded-r-[8px]">
            {props.group ? "Filtergruppe " : "Filter "} Löschen
          </h2>
          <div className="mt-[25px] flex justify-evenly items-center">
            <p>{getErrorMessage()}</p>
          </div>
          <div className="mt-[25px] flex justify-evenly items-center">
            <button
              type="button"
              className="mb-[1em] p-[0.8em] w-[9vw] text-[1em] cursor-pointer overflow-hidden border-0 outline-none rounded-[4px] bg-[#6c6d6c] text-[#f5f5f5] "
              onClick={() => onClose(false)}
            >
              Abbrechen
            </button>
            <button
              type="button"
              className="mb-[1em] p-[0.8em] w-[9vw] text-[1em] cursor-pointer overflow-hidden border-0 outline-none rounded-[4px] bg-red text-[#f5f5f5]"
              onClick={() => onDelete()}
            >
              Löschen
            </button>
          </div>
        </div>
      </div>,

      portalDiv
    );
  }
);

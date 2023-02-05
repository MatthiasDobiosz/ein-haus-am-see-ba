import { observer } from "mobx-react";
import { Dispatch, SetStateAction } from "react";

interface ChooseFilterTypeProps {
  errorMessage: string;
  closeError: Dispatch<SetStateAction<boolean>>;
}

export const ErrorModal = observer(
  (props: ChooseFilterTypeProps): JSX.Element => {
    return (
      <div className="bg-[#fff] my-[15%] mx-auto p-0 relative rounded-[8px] w-[40vw] modal-content">
        <h2 className="flex justify-center py-[12px] px-0 bg-red text-[#fff] text-[1.5em] font-bold rounded-t-[8px] rounded-r-[8px]">
          Error
        </h2>
        <div className="mt-[25px] flex justify-evenly items-center">
          <p>{props.errorMessage}</p>
        </div>
        <div className="mt-[25px] flex justify-evenly items-center">
          <button
            type="button"
            className="mb-[1em] p-[0.8em] w-[10vw] cursor-pointer overflow-hidden border-0 outline-none rounded-[4px] bg-[#e8e8e8] text-[#000000] hover:bg-[#e2dede] active:bg-[#e2dede]"
            onClick={() => props.closeError(true)}
          >
            Ok
          </button>
        </div>
      </div>
    );
  }
);

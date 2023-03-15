import { observer } from "mobx-react";
import { Dispatch, SetStateAction } from "react";

interface ChooseFilterTypeProps {
  errorMessage: string;
  closeError: Dispatch<SetStateAction<boolean>>;
}

/**
 * Simple component to display error message
 */
export const ErrorModal = observer(
  (props: ChooseFilterTypeProps): JSX.Element => {
    return (
      <div className="bg-[#fff] my-[15%] mx-auto p-0 relative rounded-[0.55em] w-[20vw]">
        <h2 className="flex justify-center py-[0.6em] px-0 bg-red text-[#fff] text-[1.5em] font-bold rounded-t-[0.4em] rounded-r-[0.4em]">
          Error
        </h2>
        <div className="mt-[1.8em] text-center">
          <p>{props.errorMessage}</p>
        </div>
        <div className="mt-[1.8em] flex justify-evenly items-center">
          <button
            type="button"
            className="mb-[1em] p-[0.8em] w-[8vw] cursor-pointer overflow-hidden border-0 outline-none rounded-[4px] bg-[#e8e8e8] text-[#000000] hover:bg-[#e2dede] active:bg-[#e2dede]"
            onClick={() => props.closeError(true)}
          >
            Ok
          </button>
        </div>
      </div>
    );
  }
);

import { observer } from "mobx-react";
import { Dispatch, SetStateAction, useState } from "react";
import { createPortal } from "react-dom";
import { ChooseFilterType } from "./ChooseFilterType";
import { ErrorModal } from "./ErrorModal";
import { Filter } from "./Filters";
import { FilterSettings } from "./FilterSettings";

interface FilterModalProps {
  /** name of the category to show modal for */
  value: string;
  /** determines if modal is still active */
  open: boolean;
  /** function to trigger closing of the modal */
  onClose: Dispatch<SetStateAction<boolean>>;
  filter?: Filter;
}

export const FilterModal = observer(
  (props: FilterModalProps): JSX.Element | null => {
    const { value, open, onClose } = props;
    const [newGroup, setNewGroup] = useState<boolean | null>(null);
    const [error, setError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const portalDiv = document.getElementById("portal");

    const showError = (errorMessage: string) => {
      setError(true);
      setErrorMessage(errorMessage);
    };

    const goBack = () => {
      setNewGroup(null);
    };

    const hideError = () => {
      setError(false);
      setErrorMessage("");
    };

    if (!portalDiv) {
      return null;
    }

    if (!open) {
      return null;
    }

    if (newGroup == null) {
      return createPortal(
        <div className="fixed z-[1000] left-0 top-0 w-[100%] h-[100%] overflow-auto bg-[#00000066] block">
          <ChooseFilterType setNewGroup={setNewGroup} onClose={onClose} />
        </div>,
        portalDiv
      );
    }

    return createPortal(
      <>
        <div className="fixed z-[1000] left-0 top-0 w-[100%] h-[100%] overflow-auto bg-[#00000066] block">
          <FilterSettings
            value={value}
            open={open}
            onClose={onClose}
            newGroup={newGroup}
            setError={showError}
            goBack={goBack}
          />
        </div>
        {error && (
          <div className="fixed z-[1000] left-0 top-0 w-[100%] h-[100%] overflow-auto bg-[#00000066] block">
            <ErrorModal errorMessage={errorMessage} closeError={hideError} />
          </div>
        )}
      </>,
      portalDiv
    );
  }
);

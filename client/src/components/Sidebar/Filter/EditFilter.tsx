import { observer } from "mobx-react";
import { Dispatch, SetStateAction, useState } from "react";
import rootStore from "../../../stores/RootStore";
import { SnackbarType } from "../../../stores/SnackbarStore";

import { Filter } from "./Filters";

interface FilterSettingsProps {
  /** name of the category to show modal for */
  value: string;
  /** determines if modal is still active */
  open: boolean;
  /** function to trigger closing of the modal */
  onClose: Dispatch<SetStateAction<boolean>>;
  setError: (errorMessage: string) => void;
  filter: Filter;
}

export const EditFilter = observer(
  (props: FilterSettingsProps): JSX.Element | null => {
    const { value, open, onClose } = props;
    const [distance, setDistance] = useState(500);
    const [measure, setMeasure] = useState("m");
    const [wanted, setWanted] = useState(true);

    async function performOsmQuery(): Promise<void> {
      if (rootStore.filterStore.activeFilters.size === 0) {
        rootStore.snackbarStore.displayHandler(
          "Es können keine Daten geladen werden, da keine Filter aktiv sind",
          2500,
          SnackbarType.WARNING
        );
        return;
      }
      rootStore.mapStore.loadMapData();
    }

    /**
     * handles changing the values of the filter
     */
    const handleEditFilter = () => {
      rootStore.filterStore.changeSingleFilter(
        props.filter.layername,
        distance,
        measure,
        wanted
      );

      rootStore.snackbarStore.displayHandler(
        "Filter wurde erfolgreich hinzugefügt!",
        1000,
        SnackbarType.SUCCESS
      );

      //closes Modal
      onClose(false);

      // load map data automatically after 800ms (timeout so the snackbars wont overlap)
      setTimeout(() => {
        performOsmQuery();
      }, 800);
    };

    const setMeasureAndDistance = (value: string) => {
      if (value === "km") {
        setDistance((prevDistance) => prevDistance * 1000);
        setMeasure(value);
      } else {
        setDistance((prevDistance) => prevDistance / 1000);
        setMeasure(value);
      }
    };

    if (!open) {
      return null;
    }

    return (
      <div className="bg-[#fff] my-[15%] mx-auto p-0 relative rounded-[8px] w-[40vw] modal-content">
        <h2 className="flex justify-center py-[12px] px-0 bg-[#5cb85c] text-[#fff] text-[1.5em] font-bold rounded-t-[8px] rounded-r-[8px]">
          {value}
        </h2>
        <div className="pt-[16px] pb-[2px] px-[16px] flex justify-center">
          <form>
            <div className="flex items-center">
              <p className="my-[16px] text-[16px] pr-[12px]">Entfernung: </p>
              <input
                type="text"
                defaultValue={props.filter.distance}
                pattern="\d"
                onChange={(e) => setDistance(Number(e.target.value))}
                className="p-[6px] mr-[8px] w-[8vw] h-[4vh] border-[1px] border-solid border-[#808080] rounded-[2px]"
              />
              <div>
                <select
                  defaultValue={props.filter.measurement}
                  onChange={(e) => setMeasureAndDistance(e.target.value)}
                  className="border-[1px] border-solid border-[#000000]"
                >
                  <option value="m">m</option>
                  <option value="km">km</option>
                </select>
              </div>
            </div>
            <div className="my-[16px]">
              <p className="text-[16px] mr-[12px] my-[16px]">
                Dieses Kriterium soll:{" "}
              </p>
              <label className="block relative pl-[30px] mb-[16px] cursor-pointer text-[14px] radiocontainer">
                möglichst nah sein
                <input
                  type="radio"
                  defaultChecked={props.filter.wanted ? true : false}
                  name="polarity"
                  defaultValue="true"
                  className="absolute opacity-0 cursor-pointer"
                  onChange={() => setWanted(true)}
                />
                <span className="absolute top-0 left-0 h-[18px] w-[18px] bg-[#eee] rounded-[50%] checkmark"></span>
              </label>
              <label className="block relative pl-[30px] mb-[16px] cursor-pointer text-[14px] radiocontainer">
                möglichst weit entfernt sein
                <input
                  type="radio"
                  defaultChecked={props.filter.wanted ? false : true}
                  name="polarity"
                  defaultValue="false"
                  className="absolute opacity-0 cursor-pointer"
                  onChange={() => setWanted(false)}
                />
                <span className="absolute top-0 left-0 h-[18px] w-[18px] bg-[#eee] rounded-[50%] checkmark"></span>
              </label>
            </div>
          </form>
        </div>
        <div className="mt-[25px] flex justify-evenly items-center">
          <button
            type="button"
            className="mb-[1em] p-[0.8em] w-[10vw] cursor-pointer overflow-hidden border-0 outline-none rounded-[4px] bg-[#e8e8e8] text-[#000000] hover:bg-[#e2dede] active:bg-[#e2dede]"
            onClick={() => onClose(false)}
          >
            Abbrechen
          </button>
          <button
            type="button"
            className="mb-[1em] p-[0.8em] w-[10vw] cursor-pointer overflow-hidden border-0 outline-none rounded-[4px] bg-[#14bd5a] text-[#f5f5f5] hover:bg-[#11a74f] active:bg-[#11a74f]"
            onClick={() => handleEditFilter()}
          >
            Hinzufügen
          </button>
        </div>
      </div>
    );
  }
);

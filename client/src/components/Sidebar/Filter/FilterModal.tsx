import { Dispatch, SetStateAction, useState } from "react";
import { createPortal } from "react-dom";
import { Filter } from "./Filters";

interface FilterModalProps {
  /** name of the category to show modal for */
  value: string;
  /** determines if modal is still active */
  open: boolean;
  /** function to trigger closing of the modal */
  onClose: Dispatch<SetStateAction<boolean>>;
  /** function to add single Filter to active filters and close modal */
  addFilter: (filterValue: Filter) => void;
}

export const FilterModal = (props: FilterModalProps): JSX.Element | null => {
  const { value, open, onClose, addFilter } = props;
  const [distance, setDistance] = useState("500");
  const [measure, setMeasure] = useState("m");
  const [relevance, setRelevance] = useState("wichtig");
  const [polarity, setPolarity] = useState("erwünscht");
  const portalDiv = document.getElementById("portal");

  const handleAddFilter = () => {
    addFilter({
      name: value,
      distance: distance + " " + measure,
      relevance: relevance,
      polarity: polarity,
    });
    onClose(false);
  };

  if (!portalDiv) {
    return null;
  }

  if (!open) {
    return null;
  }

  return createPortal(
    <div className="fixed z-[1000] left-0 top-0 w-[100%] h-[100%] overflow-auto bg-[#00000066] block">
      <div className="bg-[#fff] my-[5%] mx-auto p-0 relative rounded-[8px] w-[35vw] modal-content">
        <h2 className="flex justify-center py-[12px] px-0 bg-[#5cb85c] text-[#fff] text-[1.5em] font-bold rounded-t-[8px] rounded-r-[8px]">
          {value}
        </h2>
        <div className="pt-[16px] pb-[2px] px-[16px] flex justify-center">
          <form>
            <div className="flex items-center">
              <p className="my-[16px] text-[16px] pr-[12px]">Entfernung: </p>
              <input
                type="text"
                defaultValue="500"
                pattern="\d"
                onChange={(e) => setDistance(e.target.value)}
                className="p-[6px] mr-[8px] w-[8vw] h-[4vh] border-[1px] border-solid border-[#808080] rounded-[2px]"
              />
              <div>
                <select
                  defaultValue={"m"}
                  onChange={(e) => setMeasure(e.target.value)}
                  className="border-[1px] border-solid border-[#000000]"
                >
                  <option value="m">m</option>
                  <option value="km">km</option>
                </select>
              </div>
            </div>
            <div className="hidden">
              Die Entfernung kann leider im Moment höchstens 700 m sein!
            </div>
            <div className="flex items-center">
              <p className="my-[16px] text-[16px] pr-[12px]">Relevanz</p>
              <div>
                <select
                  defaultValue={"optional"}
                  onChange={(e) => setRelevance(e.target.value)}
                  className="border-[1px] border-solid border-[#000000]"
                >
                  <option value="optional">optional</option>
                  <option value="wichtig">wichtig</option>
                  <option value="sehr wichtig">sehr wichtig</option>
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
                  defaultChecked={true}
                  name="polarity"
                  defaultValue="true"
                  className="absolute opacity-0 cursor-pointer"
                  onChange={() => setPolarity("erwünscht")}
                />
                <span className="absolute top-0 left-0 h-[18px] w-[18px] bg-[#eee] rounded-[50%] checkmark"></span>
              </label>
              <label className="block relative pl-[30px] mb-[16px] cursor-pointer text-[14px] radiocontainer">
                möglichst weit entfernt sein
                <input
                  type="radio"
                  defaultChecked={false}
                  name="polarity"
                  defaultValue="false"
                  className="absolute opacity-0 cursor-pointer"
                  onChange={() => setPolarity("nicht erwünscht")}
                />
                <span className="absolute top-0 left-0 h-[18px] w-[18px] bg-[#eee] rounded-[50%] checkmark"></span>
              </label>
            </div>
          </form>
        </div>
        <div className="mt-[25px] flex justify-evenly items-center">
          <button
            type="button"
            className="mb-[1em] p-[0.8em] w-[15vw] cursor-pointer overflow-hidden border-0 outline-none rounded-[4px] bg-[#e8e8e8] text-[#000000] hover:bg-[#e2dede] active:bg-[#e2dede]"
            onClick={() => onClose(false)}
          >
            Abbrechen
          </button>
          <button
            type="button"
            className="mb-[1em] p-[0.8em] w-[15vw] cursor-pointer overflow-hidden border-0 outline-none rounded-[4px] bg-[#14bd5a] text-[#f5f5f5] hover:bg-[#11a74f] active:bg-[#11a74f]"
            onClick={() => handleAddFilter()}
          >
            Hinzufügen
          </button>
        </div>
      </div>
    </div>,
    portalDiv
  );
};

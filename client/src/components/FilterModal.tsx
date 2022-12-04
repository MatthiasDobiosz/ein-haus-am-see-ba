import { Dispatch, SetStateAction, useState } from "react";
import { createPortal } from "react-dom";
import { Filter } from "./Sidebar/Filters";

interface FilterModalProps {
  value: string;
  open: boolean;
  onClose: Dispatch<SetStateAction<boolean>>;
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
    <div className="fixed z-[1000] left-0 top-0 w-[100%] h-[100%] overflow-auto bg-[#00000066]">
      <div className="bg-[#fff] my-[5%] mx-auto p-0 relative rounded-[8px] w-[35vw]">
        <h2>{value}</h2>
        <div>
          <form action="javascript:void(0);">
            <div>
              <p>Entfernung: </p>
              <input
                type="text"
                defaultValue="500"
                pattern="\d"
                onChange={(e) => setDistance(e.target.value)}
              />
              <div>
                <select
                  defaultValue={"m"}
                  onChange={(e) => setMeasure(e.target.value)}
                >
                  <option value="m">m</option>
                  <option value="km">km</option>
                </select>
              </div>
            </div>
            <div className="hidden">
              Die Entfernung kann leider im Moment höchstens 700 m sein!
            </div>
            <div>
              <p>Relevanz</p>
              <div>
                <select
                  defaultValue={"optional"}
                  onChange={(e) => setRelevance(e.target.value)}
                >
                  <option value="optional">optional</option>
                  <option value="wichtig">wichtig</option>
                  <option value="sehr wichtig">sehr wichtig</option>
                </select>
              </div>
            </div>
            <div>
              <p>Dieses Kriterium soll: </p>
              <label>
                möglichst nah sein
                <input
                  type="radio"
                  defaultChecked={true}
                  name="polarity"
                  defaultValue="true"
                  onChange={() => setPolarity("erwünscht")}
                />
              </label>
              <label>
                möglichst weit entfernt sein
                <input
                  type="radio"
                  defaultChecked={false}
                  name="polarity"
                  defaultValue="false"
                  onChange={() => setPolarity("nicht erwünscht")}
                />
              </label>
            </div>
          </form>
        </div>
        <div>
          <button type="button" onClick={() => onClose(false)}>
            Abbrechen
          </button>
          <button type="button" onClick={() => handleAddFilter()}>
            Hinzufügen
          </button>
        </div>
      </div>
    </div>,
    portalDiv
  );
};

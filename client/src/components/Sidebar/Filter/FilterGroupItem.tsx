import { observer } from "mobx-react";
import { FilterItem } from "./FilterItem";
import { FilterGroup } from "./Filters";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisVertical } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import rootStore from "../../../stores/RootStore";
import { SnackbarType } from "../../../stores/SnackbarStore";

interface FilterGroupProps {
  filtergroup: FilterGroup;
}

export const FilterGroupItem = observer(
  (props: FilterGroupProps): JSX.Element => {
    const [editingOpen, setEditingOpen] = useState(false);

    function removeFiltersAndUpdateMap() {
      props.filtergroup.filters.forEach((filter) => {
        rootStore.mapStore.removeData(filter);
      });
      rootStore.snackbarStore.displayHandler(
        `Filtergruppe "${props.filtergroup.groupName}" wurde entfernt.`,
        1200,
        SnackbarType.SUCCESS
      );
    }

    return (
      <div className="flex flex-col mt-[1em] ml-2 mr-2 align-middle justify-center border-2 bg-[#fff] border-none relative">
        <div className="flex flex-row justify-center mt-2">
          <p>Filtergruppe {props.filtergroup.groupName}</p>
        </div>
        <button
          className="absolute top-2 right-2"
          onClick={() => setEditingOpen(!editingOpen)}
        >
          <FontAwesomeIcon icon={faEllipsisVertical} />
        </button>
        <ul className="text-[0.9em] list-none pt-0 pr-[5px] pb-[10px] pl-[5px]">
          {props.filtergroup.filters.map((filterLayer) => {
            return (
              <FilterItem key={filterLayer.layername} filter={filterLayer} />
            );
          })}
        </ul>
        {editingOpen && (
          <div className="absolute top-8 right-2 bg-gray rounded-[5%]">
            <div className="hover:bg-whitesmoke p-2 cursor-pointer">
              Filtergruppe bearbeiten
            </div>
            <div
              className="hover:bg-whitesmoke p-2 cursor-pointer"
              onClick={() => removeFiltersAndUpdateMap()}
            >
              Filtergruppe löschen
            </div>
          </div>
        )}
      </div>
    );
  }
);

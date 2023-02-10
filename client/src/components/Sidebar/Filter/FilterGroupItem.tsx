import { observer } from "mobx-react";
import { FilterItem } from "./FilterItem";
import { FilterGroup } from "./Filters";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { useState } from "react";
import rootStore from "../../../stores/RootStore";
import { SnackbarType } from "../../../stores/SnackbarStore";
import { BsTrash } from "react-icons/bs";
import { DeleteModal } from "./DeleteModal";

interface FilterGroupProps {
  filtergroup: FilterGroup;
}

export const FilterGroupItem = observer(
  (props: FilterGroupProps): JSX.Element => {
    const { filtergroup } = props;
    const [isDeleting, setIsDeleting] = useState(false);
    const [filtergroupActive, setFiltergroupActive] = useState(
      filtergroup.active
    );

    function removeFiltersAndUpdateMap() {
      rootStore.mapStore.removeGroupData(filtergroup);
      rootStore.snackbarStore.displayHandler(
        `Filtergruppe "${filtergroup.groupName}" wurde entfernt.`,
        1200,
        SnackbarType.SUCCESS
      );
    }

    function toggleFiltergroupActive() {
      setFiltergroupActive(!filtergroupActive);
      rootStore.filterStore.toggleFiltergroupActive(filtergroup.groupName);
      rootStore.mapStore.updateData(filtergroup);
    }

    return (
      <>
        <div className="flex flex-col mt-[1em] ml-2 mr-2 align-middle justify-center border-2 bg-[#fff] border-none relative">
          <div className="mt-3 mb-3">
            <div className="flex flex-row justify-center">
              <p className="2xl:text-[1.3em] xl:text-[1em] lg:text-[0.8em] md:text-[0.7em] sm:text-[0.6em]">
                Filtergruppe {filtergroup.groupName}
              </p>
            </div>
            <div className="absolute top-3 right-2 text-[1.8em]">
              <button
                onClick={() => toggleFiltergroupActive()}
                className="pr-2"
              >
                {filtergroupActive ? <AiFillEyeInvisible /> : <AiFillEye />}
              </button>
              <button onClick={() => setIsDeleting(true)}>
                <BsTrash color={"#EE4B2B"} />
              </button>
            </div>
          </div>
          <ul className="text-m list-none pt-0 pr-[5px] pb-[10px] pl-[5px]">
            {filtergroup.filters.map((filterLayer) => {
              return (
                <FilterItem key={filterLayer.layername} filter={filterLayer} />
              );
            })}
          </ul>
        </div>
        {isDeleting && (
          <DeleteModal
            value={filtergroup.groupName}
            onClose={setIsDeleting}
            onDelete={removeFiltersAndUpdateMap}
            group
          />
        )}
      </>
    );
  }
);

import { useState } from "react";
import { FilterModal } from "./Filter/FilterModal";
import { Filter } from "./Filter/Filters";

interface SidebarItemProps {
  /** name of single sidebar-Subcategory */
  name: string;
  /** function to add a filter of specified category */
  addFilterFunction: (filterValue: Filter) => void;
}

/**
 * SidebarItem Component that renders a single subcategory
 */
export const SidebarItem = (props: SidebarItemProps): JSX.Element => {
  const { name, addFilterFunction } = props;
  const [showFilterModal, setShowFilterModal] = useState(false);

  return (
    <>
      <a
        className={`block w-[100%] bg-[#f8f0e0] text-[#000000] py-[12px] px-[16px] no-underline hover:bg-[#ece6da] cursor-pointer`}
        onClick={() => setShowFilterModal(true)}
      >
        {name}
      </a>
      {console.log(showFilterModal)}
      {showFilterModal && (
        <FilterModal
          value={name}
          open
          onClose={() => setShowFilterModal(false)}
          addFilter={addFilterFunction}
        />
      )}
    </>
  );
};

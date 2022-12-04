import { useState } from "react";
import { FilterModal } from "../FilterModal";
import { Filter } from "./Filters";

interface SidebarItemProps {
  name: string;

  addFilterFunction: (filterValue: Filter) => void;
}

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

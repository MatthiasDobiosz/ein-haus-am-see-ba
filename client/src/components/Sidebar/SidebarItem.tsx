import { useState } from "react";
import { FilterModal } from "./Filter/FilterModal";

interface SidebarItemProps {
  /** name of single sidebar-Subcategory */
  name: string;
}

/**
 * SidebarItem Component that renders a single subcategory
 */
export const SidebarItem = (props: SidebarItemProps): JSX.Element => {
  const { name } = props;
  const [showFilterModal, setShowFilterModal] = useState(false);

  return (
    <>
      <a
        className={`block w-[100%] bg-[#f8f0e0] text-[#000000] py-[12px] px-[16px] no-underline hover:bg-[#ece6da] cursor-pointer`}
        onClick={() => setShowFilterModal(true)}
      >
        {name}
      </a>
      {showFilterModal && (
        <FilterModal
          value={name}
          open
          onClose={() => setShowFilterModal(false)}
        />
      )}
    </>
  );
};

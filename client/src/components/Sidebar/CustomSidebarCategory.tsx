import { observer } from "mobx-react";
import { useState } from "react";
import { AiFillCaretDown, AiFillCaretUp } from "react-icons/ai";
import { CustomSidebarItem } from "./CustomSidebarItem";

// mocked Filtergroup to add "Beispiel-Filtergruppen"
export interface mockFilterGroup {
  groupName: string;
  groupRelevance: number;
  filters: mockFilter[];
}

// mocked Filter
export interface mockFilter {
  tagName: string;
  distance: number;
  wanted: boolean;
}

interface CustomSidebarCategoryProps {
  /** title of a node category */
  title: string;
  /** array of subcategories */
  filtergroups: mockFilterGroup[];
}

/**
 * CustomSidebarCategory Component for complex custom categories
 */
export const CustomSidebarCategory = observer(
  (props: CustomSidebarCategoryProps): JSX.Element => {
    const { title, filtergroups } = props;
    const [isActive, setIsActive] = useState(false);

    const handleOpen = () => {
      setIsActive((isActive) => !isActive);
    };

    return (
      <>
        <button
          className={`pt-[0.3em] pr-[0.4em] pb-[0.8em] pl-[0.9em] no-underline text-[1.3em] block border-none bg-none w-[100%] text-left cursor-pointer outline-none text-[#707070] ${
            isActive ? "bg-[#ACBA13]" : "bg-[#FFFAF0] hover:text-[#8a8686]"
          }`}
          onClick={() => handleOpen()}
        >
          <div className="flex flex-row justify-between">
            <p
              className={`${
                isActive
                  ? "text-[#fff] hover:text-[#707070]"
                  : "text-[#707070]}"
              }`}
            >
              {title}
            </p>
            {isActive ? <AiFillCaretUp /> : <AiFillCaretDown />}
          </div>
        </button>
        {isActive && (
          <div>
            {filtergroups.map((filtergroup, i) => {
              return <CustomSidebarItem filtergroup={filtergroup} key={i} />;
            })}
          </div>
        )}
      </>
    );
  }
);

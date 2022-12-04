import { useState } from "react";
import { AiFillCaretDown, AiFillCaretUp } from "react-icons/ai";
import { Filter } from "./Filters";
import { SidebarItem } from "./SidebarItem";

interface SidebarCategoryProps {
  title: string;
  items: string[];
  addFilterFunction: (filterValue: Filter) => void;
}

export const SidebarCategory = (props: SidebarCategoryProps): JSX.Element => {
  const { title, items, addFilterFunction } = props;
  const [isActive, setIsActive] = useState(false);

  const handleOpen = () => {
    setIsActive((isActive) => !isActive);
  };

  return (
    <>
      <button
        className={`pt-[6px] pr-[8px] pb-[14px] pl-[16px] no-underline text-[18px] block border-none bg-none w-[100%] text-left cursor-pointer outline-none text-[#707070] ${
          isActive ? "bg-[#ACBA13]" : "bg-[#FFFAF0] hover:text-[#8a8686]"
        }`}
        onClick={() => handleOpen()}
      >
        <div className="flex flex-row justify-between">
          <p
            className={`${
              isActive ? "text-[#fff] hover:text-[#707070]" : "text-[#707070]}"
            }`}
          >
            {title}
          </p>
          {isActive ? <AiFillCaretUp /> : <AiFillCaretDown />}
        </div>
      </button>
      {isActive && (
        <div>
          {items.map((item) => {
            return (
              <SidebarItem
                name={item}
                addFilterFunction={addFilterFunction}
                key={item}
              />
            );
          })}
        </div>
      )}
    </>
  );
};
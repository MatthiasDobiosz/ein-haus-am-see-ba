import { observer } from "mobx-react";
import { useState } from "react";
import { AiFillCaretDown, AiFillCaretUp } from "react-icons/ai";
import { SidebarItem } from "./SidebarItem";

interface SidebarCategoryProps {
  /** title of a node category */
  title: string;
  /** array of subcategories */
  items: string[];
}

/**
 * SidebarCategory Component that handles the visibility of subcategories
 */
export const SidebarCategory = observer(
  (props: SidebarCategoryProps): JSX.Element => {
    const { title, items } = props;
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
            {items.map((item) => {
              return <SidebarItem name={item} key={item} />;
            })}
          </div>
        )}
      </>
    );
  }
);

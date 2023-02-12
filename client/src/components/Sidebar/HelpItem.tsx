import { observer } from "mobx-react";
import { useState } from "react";
import { AiFillCaretDown, AiFillCaretUp } from "react-icons/ai";

interface HelpItemProps {
  title: string;
  text: string;
}

export const HelpItem = observer((props: HelpItemProps) => {
  const { title, text } = props;
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
          <span
            className={`block w-[100%] bg-[#f8f0e0] text-[#000000] py-[12px] px-[16px] no-underline hover:bg-[#ece6da] cursor-pointer`}
          >
            {text}
          </span>
        </div>
      )}
    </>
  );
});

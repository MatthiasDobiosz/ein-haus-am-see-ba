import { HiOutlineArrowNarrowLeft } from "react-icons/hi";
import { AppContext } from "../AppContext";
import { useContext } from "react";

interface SidebarProps {
  isSidebarOpen: boolean;
}

export const Sidebar = (props: SidebarProps): JSX.Element => {
  const { setSidebarState } = useContext(AppContext);
  const { isSidebarOpen } = props;

  const handleSidebarOpen = () => {
    setSidebarState(!isSidebarOpen);
  };

  return (
    <div
      className="h-[calc(100vh-50px)] border-r-[1px] border-solid border-[#00000040] transition-width ease-in-out duration-500"
      style={{ width: isSidebarOpen ? "30%" : "0px" }}
    >
      <div>
        <div className="flex flex-row items-center bg-[#5cb85c] border-b-[1px] border-solid border-[#eee] min-h-[60px] leading-[60px]">
          <HiOutlineArrowNarrowLeft
            size={40}
            className="text-[#fff] hover:text-[#cccccc] cursor-pointer"
            onClick={() => handleSidebarOpen()}
          />
          <h2 className="text-[22px] m-0 font-normal pl-6  text-[#fff]">
            Filterauswahl
          </h2>
        </div>
      </div>
    </div>
  );
};

import { useContext } from "react";
import { SnackbarContext } from "./SnackbarContext";

/**
 * specifies differnt Snackbar Colors
 */
export const enum SnackbarType {
  SUCCESS = "#14bd5a",
  ERROR = "#b61919",
  WARNING = "#f5a81b",
  INFO = "cornflowerblue",
  DEFAULT = "darkviolet",
}

/**
 * SnackbarComponent that specifies visual properties of the snackbar
 */
export const Snackbar = (): JSX.Element => {
  const snackbarContext = useContext(SnackbarContext);

  return (
    <div
      className={`min-w-[250px] bg-[${snackbarContext.snackbarColor}] text-[#fff] text-center rounded-[2px] p-[16px] fixed z-3 left-[15px] bottom-[30px] text-[17px] snackbarActive`}
    >
      {snackbarContext.message}
    </div>
  );
};

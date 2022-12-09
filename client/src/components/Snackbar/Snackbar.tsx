import { useSnackbar } from "./SnackbarContextProvider";

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
console.log("rerender snackbar");

/**
 * SnackbarComponent that specifies visual properties of the snackbar
 */
export const Snackbar = (): JSX.Element => {
  const { snackbarColor, message } = useSnackbar();
  return (
    <div
      className={`min-w-[250px] bg-[${snackbarColor}] text-[#fff] text-center rounded-[2px] p-[16px] fixed z-3 left-[15px] bottom-[30px] text-[17px] snackbarActive`}
    >
      {message}
    </div>
  );
};

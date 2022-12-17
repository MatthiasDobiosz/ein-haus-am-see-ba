import { observer } from "mobx-react";
import rootStore from "../../stores/RootStore";

/**
 * SnackbarComponent that specifies visual properties of the snackbar
 */
export const Snackbar = observer((): JSX.Element => {
  return (
    <div
      className={`min-w-[250px] text-[#fff] text-center rounded-[2px] p-[16px] fixed z-3 left-[15px] bottom-[30px] text-[17px] snackbarActive`}
      style={{ backgroundColor: rootStore.snackbarStore.snackbarColor }}
    >
      {rootStore.snackbarStore.message}
    </div>
  );
});

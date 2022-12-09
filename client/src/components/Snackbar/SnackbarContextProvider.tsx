import { ReactNode, useContext, useState } from "react";
import { SnackbarType } from "./Snackbar";
import { SnackbarContext } from "./SnackbarContext";

interface SnackbarContextProviderProps {
  children: ReactNode;
}

/**
 * custom SnackbarContextProvider that enables control and visiblity of snackbarState in other components
 */
export const SnackbarContextProvider = (
  props: SnackbarContextProviderProps
) => {
  const [message, setMessage] = useState("");
  const [snackbarColor, setSnackbarColor] = useState(SnackbarType.DEFAULT);
  const [isDisplayed, setIsDisplayed] = useState(false);
  let timer: NodeJS.Timeout;

  /**
   * trigger Function to show snackbar with specified properties
   * @param message - Message to show in the snackbar
   * @param displayTime - amount of time that snackbar should be shown for
   * @param snackbarColor - color of the snackbar
   */
  const displayHandler = (
    message: string,
    displayTime: number,
    snackbarColor: SnackbarType
  ) => {
    setMessage(message);
    setSnackbarColor(snackbarColor);
    setIsDisplayed(true);
    timer = setTimeout(() => {
      closeHandler();
    }, displayTime);
  };

  /** clears SnackbarTimer and removes visiblity */
  const closeHandler = () => {
    clearTimeout(timer);
    setIsDisplayed(false);
  };

  return (
    <SnackbarContext.Provider
      value={{
        message,
        snackbarColor,
        isDisplayed,
        displayMessage: displayHandler,
        onClose: closeHandler,
      }}
    >
      {props.children}
    </SnackbarContext.Provider>
  );
};

// expose a helper hook to easily grab the state anywhere in your app
// wary of how you can optimise it:
// https://kentcdodds.com/blog/how-to-optimize-your-context-value
export function useSnackbar() {
  const context = useContext(SnackbarContext);
  if (context === undefined)
    throw Error("You forgot to wrap your app with <SnackbarContextProvider />");
  return context;
}

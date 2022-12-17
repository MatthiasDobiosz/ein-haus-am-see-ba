import { createContext } from "react";
import { SnackbarType } from "../../stores/SnackbarStore";

interface SnackbarContextState {
  /** message to display */
  message: string;
  /** Color to display */
  snackbarColor: SnackbarType;
  /** returns the current visibility state of the snackbar */
  isDisplayed: boolean;
  /** trigger Function to show snackbar with specified properties */
  displayMessage: (
    msg: string,
    displayTime: number,
    snackbarColor: SnackbarType
  ) => void;
  /**
   * onClose function to hide snackbar manually or automatically
   */
  onClose: () => void;
}

export const SnackbarContext = createContext({} as SnackbarContextState);

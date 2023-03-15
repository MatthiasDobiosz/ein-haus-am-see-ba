import { action, makeObservable, observable } from "mobx";
import { RootStore } from "./RootStore";

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
 * SnackbarStore-Class that handles the state of the snackbar in the whole application
 */
class SnackbarStore {
  message: string;
  snackbarColor: SnackbarType;
  isDisplayed: boolean;
  timer: NodeJS.Timeout | undefined;
  rootStore: RootStore;

  constructor(rootStore: RootStore) {
    this.message = "";
    this.snackbarColor = SnackbarType.DEFAULT;
    this.isDisplayed = false;
    this.timer = undefined;
    this.rootStore = rootStore;

    makeObservable(this, {
      message: observable,
      snackbarColor: observable,
      isDisplayed: observable,
      displayHandler: action,
      closeHandler: action,
      timer: false,
      rootStore: false,
    });
  }

  /**
   * trigger Function to show snackbar with specified properties
   * @param message - Message to show in the snackbar
   * @param displayTime - amount of time that snackbar should be shown for
   * @param snackbarColor - color of the snackbar
   */
  displayHandler(
    message: string,
    displayTime: number | undefined,
    snackbarColor: SnackbarType
  ) {
    this.message = message;
    this.snackbarColor = snackbarColor;
    this.isDisplayed = true;
    if (displayTime) {
      this.timer = setTimeout(() => {
        this.closeHandler();
      }, displayTime);
    }
  }

  /** clears SnackbarTimer and removes visiblity */
  closeHandler() {
    clearTimeout(this.timer);
    this.isDisplayed = false;
  }
}

export default SnackbarStore;

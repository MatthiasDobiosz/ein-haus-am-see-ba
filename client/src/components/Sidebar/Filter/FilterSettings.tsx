import { observer } from "mobx-react";
import { Dispatch, SetStateAction, useState } from "react";
import { AiOutlineClose } from "react-icons/ai";
import rootStore from "../../../stores/RootStore";
import { SnackbarType } from "../../../stores/SnackbarStore";

import { Filter, FilterRelevance } from "./Filters";

interface FilterSettingsProps {
  /** name of the category to show modal for */
  value: string;
  /** determines if modal is still active */
  open: boolean;
  /** function to trigger closing of the modal */
  onClose: Dispatch<SetStateAction<boolean>>;
  newGroup: boolean;
  setError: (errorMessage: string) => void;
  goBack: () => void;
}

export const FilterSettings = observer(
  (props: FilterSettingsProps): JSX.Element | null => {
    const { value, open, onClose } = props;
    const [distance, setDistance] = useState(500);
    const [measure, setMeasure] = useState("m");
    const [relevance, setRelevance] = useState(FilterRelevance.important);
    const [wanted, setWanted] = useState(true);
    const [groupname, setGroupname] = useState("");

    async function performOsmQuery(): Promise<void> {
      if (rootStore.filterStore.activeFilters.size === 0) {
        rootStore.snackbarStore.displayHandler(
          "Es können keine Daten geladen werden, da keine Filter aktiv sind",
          2500,
          SnackbarType.WARNING
        );
        return;
      }
      rootStore.mapStore.loadMapData();
    }

    /**
     * createse new FilterLayer object based on current chosen values and adds it to the global context
     */
    const handleAddFilter = () => {
      // FIXME: layername muss einzigartig sein, überprüfen wie viele Filter mit dem Name schon existieren

      if (props.newGroup) {
        //Check if groupname already exists
        if (!rootStore.filterStore.validateGroupName(groupname)) {
          if (groupname === "") {
            props.setError(`Kein Gruppenname angegeben`);
          } else {
            props.setError(
              `Eine Gruppe mit dem Namen ${groupname} existiert bereits!`
            );
          }
          //FIXME: display error
        } else {
          const newFilter: Filter = {
            layername: rootStore.filterStore.getUniqueLayerName(
              value,
              groupname
            ),
            tagName: value,
            distance: distance,
            measurement: measure,
            wanted: wanted,
            points: [],
            features: [],
            originalData: null,
            group: groupname,
          };
          const filterWasAdded = rootStore.filterStore.addNewFilterToGroup(
            newFilter,
            props.newGroup,
            groupname,
            relevance
          );
          // rootStore.filterStore.addFilter(newFilter);

          if (filterWasAdded) {
            //closes Modal
            onClose(false);

            // load map data automatically after 800ms (timeout so the snackbars wont overlap)
            setTimeout(() => {
              performOsmQuery();
            }, 800);
          } else {
            props.setError(`Filter konnte nicht hinzugefügt werden`);
          }

          // load map data automatically after 800ms (timeout so the snackbars wont overlap)
          /*setTimeout(() => {
      performOsmQuery();
    }, 800);*/
        }
      } else {
        const newFilter: Filter = {
          layername: rootStore.filterStore.getUniqueLayerName(value, groupname),
          tagName: value,
          distance: distance,
          measurement: measure,
          wanted: wanted,
          points: [],
          features: [],
          originalData: null,
          group: groupname,
        };
        const filterWasAdded = rootStore.filterStore.addNewFilterToGroup(
          newFilter,
          props.newGroup,
          groupname
        );
        // rootStore.filterStore.addFilter(newFilter);
        if (filterWasAdded) {
          //closes Modal
          onClose(false);

          // load map data automatically after 800ms (timeout so the snackbars wont overlap)
          setTimeout(() => {
            performOsmQuery();
          }, 800);
        } else {
          if (groupname === "") {
            props.setError("Wähle bitte eine zugehörige Gruppe aus");
          } else {
            props.setError(
              `Ein Filter vom Typ ${value} existiert bereits in der Gruppe!`
            );
          }
        }
      }
    };

    const setRelevanceValue = (value: string) => {
      if (value === "wenig") {
        setRelevance(FilterRelevance.notVeryImportant);
      } else if (value === "normal") {
        setRelevance(FilterRelevance.important);
      } else {
        setRelevance(FilterRelevance.veryImportant);
      }
    };

    const setAllowedDistance = (value: number) => {
      if (value <= 2000) {
        setDistance(value);
      } else {
        props.setError("Es sind maximal 2000m Umkreis möglich");
      }
    };

    if (!open) {
      return null;
    }

    return (
      <div className="bg-[#fff] my-[10%] mx-auto p-0 relative rounded-[8px] w-[35vw] modal-content">
        <div className="relative">
          <h2 className="flex justify-center py-[0.8em] px-0 bg-[#5cb85c] text-[#fff] text-[1.5em] font-bold rounded-t-[0.4em] rounded-r-[0.3em]">
            {value}
          </h2>
          <button
            className="absolute top-[20%] right-4 text-[2em]"
            onClick={() => props.onClose(true)}
          >
            <AiOutlineClose color="#fff" />
          </button>
        </div>
        <div className="pt-[1.1em] pb-[0.2em]  w-[100%]">
          <form className="flex flex-col justify-center items-center w-[100%] gap-[3em]">
            <div className="flex flex-row justify-around w-[80%] items-center mt-4">
              {props.newGroup ? (
                <>
                  <p className=" text-[1.2em]  w-[50%]">
                    Name der Filtergruppe:
                  </p>
                  <input
                    type="text"
                    defaultValue=""
                    onChange={(e) => setGroupname(e.target.value)}
                    className="p-[0.45em] w-[50%] h-[3vh] border-[1px] border-solid border-[#808080] rounded-[2px]"
                    required
                    maxLength={30}
                  />
                </>
              ) : (
                <>
                  <p className="text-[1.2em] w-[50%]">Zugehörige Gruppe:</p>
                  <select
                    defaultValue={""}
                    onChange={(e) => setGroupname(e.target.value)}
                    className="border-[1px] w-[50%] h-[3vh] border-solid border-[#000000] text-center"
                  >
                    <option value="">Wähle eine Gruppe aus</option>
                    {rootStore.filterStore.allFilterGroups.map((group) => {
                      return (
                        <option value={group.groupName} key={group.groupName}>
                          {group.groupName}
                        </option>
                      );
                    })}
                  </select>
                </>
              )}
            </div>
            {props.newGroup && (
              <div className="flex flex-row justify-around w-[80%] items-center">
                <p className=" text-[1.2em] w-[50%]">Gruppengewichtung:</p>
                <div className="w-[50%]">
                  <select
                    defaultValue={"normal"}
                    onChange={(e) => setRelevanceValue(e.target.value)}
                    className="border-[1px] border-solid border-[#000000] h-[3vh] w-[50%] text-center"
                  >
                    <option value="wenig">wenig</option>
                    <option value="normal">normal</option>
                    <option value="viel">viel</option>
                  </select>
                </div>
              </div>
            )}
            <div className="flex flex-row justify-around w-[80%] items-center">
              <p className=" text-[1.2em] w-[50%]">Umkreis: </p>
              <div className="w-[50%] align-middle">
                <input
                  type="text"
                  defaultValue="500"
                  pattern="\d"
                  onChange={(e) => setAllowedDistance(Number(e.target.value))}
                  className="mr-[0.55em] w-[4em] h-[3vh] border-[1px] border-solid border-[#808080] rounded-[2px] text-center"
                  required
                />
                <span>Meter</span>
              </div>
            </div>
            <div className="hidden">
              Die Entfernung kann leider im Moment höchstens 700 m sein!
            </div>
            <div className="flex flex-row justify-around w-[80%] items-center">
              <p className="text-[1.2em] w-[50%]">
                Objekte dieser Kategorie sollen:
              </p>
              <div className="w-[50%]">
                <label className="block relative pl-[2em] mb-[1.1em] cursor-pointer text-[1em] radiocontainer">
                  möglichst nah sein
                  <input
                    type="radio"
                    defaultChecked={true}
                    name="polarity"
                    defaultValue="true"
                    className="absolute opacity-0 cursor-pointer"
                    onChange={() => setWanted(true)}
                  />
                  <span className="absolute top-0 left-0 h-[1.2em] w-[1.2em] bg-[#eee] rounded-[50%] checkmark"></span>
                </label>
                <label className="block relative pl-[2em] mb-[1.1em] cursor-pointer text-[1em] radiocontainer">
                  möglichst weit entfernt sein
                  <input
                    type="radio"
                    defaultChecked={false}
                    name="polarity"
                    defaultValue="false"
                    className="absolute opacity-0 cursor-pointer"
                    onChange={() => setWanted(false)}
                  />
                  <span className="absolute top-0 left-0 h-[1.2em] w-[1.2em] bg-[#eee] rounded-[50%] checkmark"></span>
                </label>
              </div>
            </div>
          </form>
        </div>
        <div className="mt-[1.7em] flex justify-evenly items-center">
          <button
            type="button"
            className="mb-[1em] p-[0.8em] w-[10vw] cursor-pointer overflow-hidden border-0 outline-none rounded-[4px] bg-[#e8e8e8] text-[#000000] hover:bg-[#e2dede] active:bg-[#e2dede]"
            onClick={() => props.goBack()}
          >
            Zurück
          </button>
          <button
            type="button"
            className="mb-[1em] p-[0.8em] w-[10vw] cursor-pointer overflow-hidden border-0 outline-none rounded-[4px] bg-[#14bd5a] text-[#f5f5f5] hover:bg-[#11a74f] active:bg-[#11a74f]"
            onClick={() => handleAddFilter()}
          >
            Hinzufügen
          </button>
        </div>
      </div>
    );
  }
);

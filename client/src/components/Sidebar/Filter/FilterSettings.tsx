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
    const [relevance, setRelevance] = useState(
      FilterRelevance.notVeryImportant
    );
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
      console.log("eight");
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
            rootStore.snackbarStore.displayHandler(
              "Filter wurde erfolgreich hinzugefügt!",
              1000,
              SnackbarType.SUCCESS
            );

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
          rootStore.snackbarStore.displayHandler(
            "Filter wurde erfolgreich hinzugefügt!",
            1000,
            SnackbarType.SUCCESS
          );

          //closes Modal
          onClose(false);

          // load map data automatically after 800ms (timeout so the snackbars wont overlap)
          setTimeout(() => {
            performOsmQuery();
          }, 800);
        } else {
          props.setError(
            `Filter of type ${value} already exists within Group!`
          );
        }
      }
    };

    const setRelevanceValue = (value: string) => {
      if (value === "optional") {
        setRelevance(FilterRelevance.notVeryImportant);
      } else if (value === "wichtig") {
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
      <div className="bg-[#fff] my-[5%] mx-auto p-0 relative rounded-[8px] w-[40vw] modal-content">
        <div className="relative">
          <h2 className="flex justify-center py-[12px] px-0 bg-[#5cb85c] text-[#fff] text-[1.5em] font-bold rounded-t-[8px] rounded-r-[8px]">
            {value}
          </h2>
          <button
            className="absolute top-[20%] right-4 text-[24px]"
            onClick={() => props.onClose(true)}
          >
            <AiOutlineClose color="#fff" />
          </button>
        </div>
        <div className="pt-[16px] pb-[2px] px-[16px] flex justify-center">
          <form>
            <div className="flex items-center">
              {props.newGroup ? (
                <>
                  <p className="my-[16px] text-[16px] pr-[12px] w-[12em]">
                    Name der Filtergruppe:
                  </p>
                  <input
                    type="text"
                    defaultValue=""
                    onChange={(e) => setGroupname(e.target.value)}
                    className="p-[6px] mr-[8px] w-[8vw] h-[3vh] border-[1px] border-solid border-[#808080] rounded-[2px]"
                    required
                  />
                </>
              ) : (
                <>
                  <p className="my-[16px] text-[16px] pr-[12px] w-[12em]">
                    Zugehörige Gruppe:
                  </p>
                  <select
                    defaultValue={""}
                    onChange={(e) => {
                      console.log(e.target.value);
                      setGroupname(e.target.value);
                    }}
                    className="border-[1px] h-[3vh] border-solid border-[#000000]"
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
            <div className="flex items-center">
              <p className="my-[16px] text-[16px] pr-[12px] w-[12em] text-center">
                Umkreis:{" "}
              </p>
              <input
                type="text"
                defaultValue="500"
                pattern="\d"
                onChange={(e) => setAllowedDistance(Number(e.target.value))}
                className="p-[6px] mr-[8px] w-[4em] h-[3vh] border-[1px] border-solid border-[#808080] rounded-[2px]"
                required
              />
              <span>Meter</span>
            </div>
            <div className="hidden">
              Die Entfernung kann leider im Moment höchstens 700 m sein!
            </div>
            {props.newGroup && (
              <div className="flex items-center">
                <p className="my-[16px] text-[16px] pr-[12px] w-[12em] text-center">
                  Relevanz
                </p>
                <div>
                  <select
                    defaultValue={"optional"}
                    onChange={(e) => setRelevanceValue(e.target.value)}
                    className="border-[1px] border-solid border-[#000000] h-[3vh]"
                  >
                    <option value="optional">optional</option>
                    <option value="wichtig">wichtig</option>
                    <option value="sehr wichtig">sehr wichtig</option>
                  </select>
                </div>
              </div>
            )}
            <div className="my-[16px] ml-[6em]">
              <p className="text-[16px] mr-[12px] my-[16px]">
                Dieses Kriterium soll:{" "}
              </p>
              <label className="block relative pl-[30px] mb-[16px] cursor-pointer text-[14px] radiocontainer">
                möglichst nah sein
                <input
                  type="radio"
                  defaultChecked={true}
                  name="polarity"
                  defaultValue="true"
                  className="absolute opacity-0 cursor-pointer"
                  onChange={() => setWanted(true)}
                />
                <span className="absolute top-0 left-0 h-[18px] w-[18px] bg-[#eee] rounded-[50%] checkmark"></span>
              </label>
              <label className="block relative pl-[30px] mb-[16px] cursor-pointer text-[14px] radiocontainer">
                möglichst weit entfernt sein
                <input
                  type="radio"
                  defaultChecked={false}
                  name="polarity"
                  defaultValue="false"
                  className="absolute opacity-0 cursor-pointer"
                  onChange={() => setWanted(false)}
                />
                <span className="absolute top-0 left-0 h-[18px] w-[18px] bg-[#eee] rounded-[50%] checkmark"></span>
              </label>
            </div>
          </form>
        </div>
        <div className="mt-[25px] flex justify-evenly items-center">
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

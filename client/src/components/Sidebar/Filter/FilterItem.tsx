import { observer } from "mobx-react";
import { useState } from "react";
import rootStore from "../../../stores/RootStore";
import { SnackbarType } from "../../../stores/SnackbarStore";
import { Filter } from "./Filters";
import { BsPencil, BsTrash } from "react-icons/bs";
import { AiOutlineCheck, AiOutlineClose } from "react-icons/ai";
import { DeleteModal } from "./DeleteModal";

interface FilterItemProps {
  /** filter object that contains relevant filter properties */
  filter: Filter;
}

const allFilterTypes = [
  "Bar",
  "Restaurant",
  "Cafe",
  "Universität und Hochschule",
  "Schule",
  "Supermarkt",
  "Einkaufszentrum",
  "Parkplatz",
  "Bushaltestelle",
  "Bahnhof",
  "Autobahn",
  "Parks und Grünflächen",
  "Wald",
  "Fluss",
  "Kindergarten",
  "Krankenhaus",
  "Klinik",
  "Apotheke",
  "Kino",
  "Theater",
  "See",
];
//FIXME: wird evtl. durch Gruppe ersetzt

/**
 * FilterItem Component that shows a single filter
 */
export const FilterItem = observer((props: FilterItemProps) => {
  const { filter } = props;
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [newDistance, setNewDistance] = useState(filter.distance);
  const [newMeasure, setNewMeasure] = useState(filter.measurement);
  const [newWanted, setNewWanted] = useState(filter.wanted);

  // removes the filter from the store and also from the map
  const onFilterRemoved = () => {
    rootStore.mapStore.removeData(filter);
    rootStore.snackbarStore.displayHandler(
      `Filter "${filter.tagName}" wurde entfernt.`,
      1200,
      SnackbarType.SUCCESS
    );
  };

  const getCorrectDistance = () => {
    if (filter.measurement === "km") {
      return (filter.distance / 1000).toString();
    } else {
      return filter.distance.toString();
    }
  };

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
   * handles changing the values of the filter
   */
  const handleEditFilter = () => {
    rootStore.filterStore.changeSingleFilter(
      props.filter.layername,
      newDistance,
      newMeasure,
      newWanted
    );

    rootStore.snackbarStore.displayHandler(
      "Filter wurde erfolgreich hinzugefügt!",
      1000,
      SnackbarType.SUCCESS
    );

    setIsEditing(false);
    // load map data automatically after 800ms (timeout so the snackbars wont overlap)
    setTimeout(() => {
      performOsmQuery();
    }, 800);
  };

  const setMeasureAndDistance = (value: string) => {
    if (value === "km") {
      setNewDistance((prevDistance) => prevDistance * 1000);
      setNewMeasure(value);
    } else {
      setNewDistance((prevDistance) => prevDistance / 1000);
      setNewMeasure(value);
    }
  };

  if (isEditing) {
    return (
      <>
        <li className="flex flex-col relative p-[6px] my-[3px] mx-0 transition-[0.2s] border-[1px] border-solid border-[#d3d3d3] hover:bg-[#f7f2df] 2xl:text-[1.3em] xl:text-[1em] lg:text-[0.8em] md:text-[0.7em] sm:text-[0.6em]">
          <div className="flex flex-col my-[4px] ml-[5em] mr-[6em] gap-2">
            <div className="flex flex-row">
              <span className="font-bold w-[5em] mr-12">Filtertyp:</span>
              <span>{filter.tagName}</span>
            </div>
            <div className="flex flex-row">
              <span className="font-bold mr-12 w-[5em]">Entfernung:</span>
              <div className="flex">
                <input
                  type="text"
                  defaultValue={getCorrectDistance()}
                  pattern="\d"
                  onChange={(e) => setNewDistance(Number(e.target.value))}
                  className="border-[1px] border-solid border-[#808080]  w-[3em]  ml-[0.5em] text-center self-start"
                />
                <select
                  defaultValue={filter.measurement}
                  className="border-[1px] border-solid border-[#808080] ml-[0.5em] w-fit "
                  onChange={(e) => setMeasureAndDistance(e.target.value)}
                >
                  <option value="m">m</option>
                  <option value="km">km</option>
                </select>
              </div>
            </div>
            <div className="flex flex-row">
              <span className="font-bold  mr-12 w-[5em]">Polarität:</span>
              <select
                defaultValue={newWanted ? "nah" : "fern"}
                onChange={(e) =>
                  setNewWanted(e.target.value === "nah" ? true : false)
                }
                className="border-[1px] border-solid border-[#808080]    ml-[0.5em] w-fit "
              >
                <option value="nah">möglichst nah</option>
                <option value="fern">möglichst fern</option>
              </select>
            </div>
          </div>

          <button
            className="absolute top-2 right-10"
            onClick={() => handleEditFilter()}
          >
            <AiOutlineCheck color="#21ABE6" />
          </button>
          <button
            className="absolute top-2 right-4"
            onClick={() => setIsEditing(false)}
          >
            <AiOutlineClose />
          </button>
          <button
            className="absolute top-12 right-4"
            onClick={() => setIsDeleting(true)}
          >
            <BsTrash color={"#EE4B2B"} />
          </button>
        </li>
        {isDeleting && (
          <DeleteModal
            value={filter.tagName}
            onClose={() => setIsDeleting(false)}
            onDelete={() => onFilterRemoved()}
          />
        )}
      </>
    );
  }

  return (
    <>
      <li className="flex flex-col relative p-[6px] my-[3px] mx-0 transition-[0.2s] border-[1px] border-solid border-[#d3d3d3] hover:bg-[#f7f2df] 2xl:text-[1.3em] xl:text-[1em] lg:text-[0.8em] md:text-[0.7em] sm:text-[0.6em]">
        <div className="flex flex-col my-[4px] ml-[5em] mr-[6em] gap-2">
          <div className="flex flex-row">
            <span className="font-bold w-[5em] mr-12">Filtertyp:</span>
            <span>{filter.tagName}</span>
          </div>
          <div className="flex flex-row">
            <span className="font-bold mr-12 w-[5em]">Entfernung:</span>
            <span>{filter.distance}</span>
            <span className="pl-1">{filter.measurement}</span>
          </div>
          <div className="flex flex-row">
            <span className="font-bold  mr-12 w-[5em]">Polarität:</span>
            <span>{filter.wanted ? "möglichst nah" : "möglichst fern"}</span>
          </div>
        </div>
        <button
          className="absolute top-2 right-4"
          onClick={() => setIsEditing(true)}
        >
          <BsPencil color="#21ABE6" />
        </button>
        <button
          className="absolute top-12 right-4"
          onClick={() => setIsDeleting(true)}
        >
          <BsTrash color={"#EE4B2B"} />
        </button>
      </li>
      {isDeleting && (
        <DeleteModal
          value={filter.tagName}
          onClose={() => setIsDeleting(false)}
          onDelete={() => onFilterRemoved()}
        />
      )}
    </>
  );
});

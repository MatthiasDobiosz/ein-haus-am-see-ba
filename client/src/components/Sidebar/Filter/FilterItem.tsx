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
      newWanted
    );

    rootStore.snackbarStore.displayHandler(
      "Filter wurde erfolgreich bearbeitet!",
      1000,
      SnackbarType.SUCCESS
    );

    setIsEditing(false);
    // load map data automatically after 800ms (timeout so the snackbars wont overlap)
    setTimeout(() => {
      performOsmQuery();
    }, 800);
  };

  if (isEditing) {
    return (
      <>
        <li className="flex flex-col relative p-[6px] my-[3px] mx-auto transition-[0.2s] border-[1px] border-solid border-[#d3d3d3] bg-[#f7f2df] hover:bg-[#f7f2df] text-[1em] w-[90%]">
          <div className="flex flex-col my-[4px] ml-[5em] mr-[3em] gap-2">
            <div className="flex flex-row">
              <span className="font-bold w-[50%]">Filtertyp:</span>
              <span>{filter.tagName}</span>
            </div>
            <div className="flex flex-row">
              <span className="font-bold w-[50%]">Entfernung:</span>
              <div className="flex flex-row w-[50%]">
                <input
                  type="text"
                  defaultValue={filter.distance}
                  pattern="\d"
                  onChange={(e) => setNewDistance(Number(e.target.value))}
                  className="border-[1px] border-solid border-[#808080] w-[50%]  ml-[0.5em] text-center self-start"
                />
                <span className="pl-1 w-[50%]">Meter</span>
              </div>
            </div>
            <div className="flex flex-row">
              <span className="font-bold  w-[50%]">Polarität:</span>
              <select
                defaultValue={newWanted ? "nah" : "fern"}
                onChange={(e) =>
                  setNewWanted(e.target.value === "nah" ? true : false)
                }
                className="border-[1px] border-solid border-[#808080]  ml-[0.5em] w-fit "
              >
                <option value="nah">möglichst nah</option>
                <option value="fern">möglichst fern</option>
              </select>
            </div>
          </div>

          <button
            className="absolute top-2 right-10 text-[1.2em]"
            onClick={() => handleEditFilter()}
          >
            <AiOutlineCheck color="#21ABE6" />
          </button>
          <button
            className="absolute top-2 right-4 text-[1.2em]"
            onClick={() => setIsEditing(false)}
          >
            <AiOutlineClose />
          </button>
          <button
            className="absolute top-12 right-4 text-[1.2em]"
            onClick={() => setIsDeleting(true)}
          >
            <BsTrash color={"#EE4B2B"} />
          </button>
        </li>
        {isDeleting && (
          <DeleteModal
            value={
              <>
                Möchtest du den Filter{" "}
                <span className="font-bold">{filter.tagName}</span> löschen?
              </>
            }
            onClose={setIsDeleting}
            onDelete={() => onFilterRemoved()}
          />
        )}
      </>
    );
  }

  return (
    <>
      <li className="flex flex-col relative p-[6px] my-[3px] mx-auto transition-[0.2s] border-[1px] border-solid border-[#d3d3d3] bg-[#f7f2df] hover:bg-[#f7f2df] text-[1em] w-[90%]">
        <div className="flex flex-col my-[4px] ml-[5em] mr-[3em] gap-2">
          <div className="flex flex-row">
            <span className="font-bold w-[50%]">Filtertyp:</span>
            <span className="w-[50%]">{filter.tagName}</span>
          </div>
          <div className="flex flex-row">
            <span className="font-bold w-[50%]">Entfernung:</span>
            <div className="w-[50%] ">
              <span>{filter.distance}</span>
              <span className="pl-1">Meter</span>
            </div>
          </div>
          <div className="flex flex-row">
            <span className="font-bold w-[50%]">Polarität:</span>
            <span className="w-[50%]">
              {filter.wanted ? "möglichst nah" : "möglichst fern"}
            </span>
          </div>
        </div>
        <button
          className="absolute top-2 right-4 text-[1.2em]"
          onClick={() => setIsEditing(true)}
        >
          <BsPencil color="#21ABE6" />
        </button>
        <button
          className="absolute top-12 right-4 text-[1.2em]"
          onClick={() => setIsDeleting(true)}
        >
          <BsTrash color={"#EE4B2B"} />
        </button>
      </li>
      {isDeleting && (
        <DeleteModal
          value={
            <>
              Möchtest du den Filter{" "}
              <span className="font-bold">{filter.tagName}</span> löschen?
            </>
          }
          onClose={setIsDeleting}
          onDelete={() => onFilterRemoved()}
        />
      )}
    </>
  );
});

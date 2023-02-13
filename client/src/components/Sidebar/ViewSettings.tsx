import { observer } from "mobx-react";
import { useState } from "react";
import rootStore from "../../stores/RootStore";
import { DeleteModal } from "./Filter/DeleteModal";

export const ViewSettings = observer(() => {
  const [resetMapModal, setResetMapModal] = useState(false);

  const resetMap = () => {
    rootStore.mapStore.resetMapData();
    setResetMapModal(false);
  };

  return (
    <>
      <div className="flex flex-col pt-10 justify-center items-center">
        <h1 className="text-[1.5em] w-[100%] text-center">
          Sichtbarkeitseinstellungen
        </h1>
        <div className="flex flex-row justify-around w-[50%] mt-10 text-[1.2em]">
          <span className="w-[50%]">Gebietsansicht:</span>
          <label className="switch relative inline-block w-[30px] h-[17px]">
            <input
              type="checkbox"
              className="opacity-0 w-0 h-0 switchinput"
              defaultChecked={rootStore.mapStore.overlayView}
              onChange={(e) =>
                rootStore.mapStore.setOverlayView(e.target.checked)
              }
            />
            <span className="slider round absolute cursor-pointer top-0 left-0 right-0 bottom-0 bg-[#ccc]"></span>
          </label>
        </div>
        <div className="flex flex-row justify-around w-[50%] mt-6 text-[1.2em]">
          <span className="w-[50%]">Ortsansicht:</span>
          <label className="switch relative inline-block w-[30px] h-[17px]">
            <input
              type="checkbox"
              className="opacity-0 w-0 h-0 switchinput"
              defaultChecked={rootStore.mapStore.poiView}
              onChange={(e) => rootStore.mapStore.setPoiView(e.target.checked)}
            />
            <span className="slider round absolute cursor-pointer top-0 left-0 right-0 bottom-0 bg-[#ccc]"></span>
          </label>
        </div>
        <button
          type="button"
          className=" p-[0.5em] text-[1em] mt-[4rem] cursor-pointer overflow-hidden border-0 rounded-[6px]  bg-[#be150f] text-whitesmoke focus:ring-transparent hover:bg-[#a30d08] active:bg-[#a30d08]"
          onClick={() => setResetMapModal(true)}
        >
          Karte zurücksetzen
        </button>
      </div>
      {resetMapModal && (
        <DeleteModal
          value={<>Möchtest du die Karte und alle Filter zurücksetzen?</>}
          onClose={setResetMapModal}
          onDelete={() => resetMap()}
        />
      )}
    </>
  );
});

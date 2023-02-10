import mapboxgl, { LngLat } from "mapbox-gl";
import { useContext, useState } from "react";
import Map, { AttributionControl, NavigationControl } from "react-map-gl";
import { initialZoomLevel } from "./mapboxConfig";
import { SnackbarType } from "./../../stores/SnackbarStore";
import rootStore from "../../stores/RootStore";
import { VisualType } from "../../stores/MapStore";
import { observer } from "mobx-react";
import { AiOutlineMenu } from "react-icons/ai";
import { fetchHouseDataFromPostGIS } from "../../network/networkUtils";
import { getViewportPolygon } from "./mapUtils";
import { Feature, Point } from "geojson";
import { CustomMarker } from "./CustomMarker";
import { SidebarContext } from "../Sidebar/SidebarContext";

interface MapOverlayProps {
  /* dynamically change width depending on sidebarState */
  isSidebarOpen: boolean;
}

// tresholds to prevent reloading when small movements are made (performance optimization)
const zoomTreshold = 0.7; // zoom level difference -> update if a map zoom event changed more than this
const moveTreshold = 1000; // map center difference in meters

/**
 * Component that returns Mapbox Map with specified settings
 */
export const MapOverlay = observer((props: MapOverlayProps) => {
  const { isSidebarOpen, setSidebarState } = useContext(SidebarContext);
  const [currentMapCenter, setCurrentMapCenter] = useState<LngLat>(
    new LngLat(12.101624, 49.013432)
  );
  const [currentMapZoom, setCurrentMapZoom] = useState(initialZoomLevel);
  const [showHouses, setShowHouses] = useState(false);
  const [houses, setHouses] = useState<Feature<Point, any>[]>([]);
  const minRequiredZoomLevel = 7;
  const map = rootStore.mapStore.map;
  const visualType = rootStore.mapStore.visualType;
  /*
  const setViewPortOnThreshold = (viewState: ViewState) => {
    if (
      currentMapCenter?.distanceTo(map ? map.getCenter() : currentMapCenter) >
      moveTreshold
    ) {
      setViewport(viewState);
      return;
    }
    if (Math.abs(viewport.zoom - viewState.zoom) > zoomTreshold) {
      setViewport(viewState);
    }
  };*/

  async function fetchHouses() {
    console.log("hey");
    console.log(map);
    if (map) {
      const bounds = getViewportPolygon(map, 0);
      const data = await fetchHouseDataFromPostGIS(bounds);
      if (data?.features) {
        setHouses(data?.features);
      }
    }
  }

  const handleSidebarOpen = () => {
    setSidebarState(!isSidebarOpen);
  };

  const onMapDragEnd = () => {
    if (map) {
      // Uses the Haversine Formula to calculate difference between tow latLng coords in meters
      const distance = currentMapCenter.distanceTo(map.getCenter());

      console.log(currentMapZoom);
      if (currentMapZoom > 17) {
        fetchHouses();
      }

      //! overlay needs to be updated all the time unfortunately as long as i can't find a way
      //! to draw the canvas bigger than the screen and also retain correct pixel corrdinates :(
      //!  -> would probably require view matrix transformations
      if (visualType === VisualType.BOTH) {
        // this is a threshold to avoid firing events with small moves
        if (distance < moveTreshold) {
          // if below the treshold only update overlay
          rootStore.mapStore.addAreaOverlay();
        } else {
          // if greater than the treshold load new data from the internet as well
          rootStore.mapStore.loadMapData();
        }
      } else if (visualType === VisualType.OVERLAY) {
        rootStore.filterStore.recalculateScreenCoords();
        // this is a threshold to avoid firing events with small moves
        if (distance < moveTreshold) {
          // if below the treshold only update overlay
          rootStore.mapStore.addAreaOverlay();
        } else {
          // if greater than the treshold load new data from the internet as well
          rootStore.mapStore.loadMapData();
        }
      } else {
        if (distance < moveTreshold) {
          return;
        }
        //console.log("Distance greater than treshold - updating");
        rootStore.mapStore.loadMapData();
      }
    }
  };

  const onMapZoomEnd = () => {
    if (map) {
      const newZoom = map.getZoom();

      if (newZoom > 17) {
        setShowHouses(true);
        fetchHouses();
      } else {
        setShowHouses(false);
      }
      if (visualType === VisualType.BOTH) {
        rootStore.filterStore.recalculateScreenCoords();

        if (newZoom <= minRequiredZoomLevel) {
          // performance optimization - dont show/update overlay below a certain zoomlevel

          rootStore.snackbarStore.displayHandler(
            "Die aktuelle Zoomstufe ist zu niedrig, um Daten zu aktualisieren!",
            2000,
            SnackbarType.WARNING
          );
          return;
        } else if (Math.abs(newZoom - currentMapZoom) <= zoomTreshold) {
          rootStore.mapStore.addAreaOverlay();
          return;
        }
        rootStore.mapStore.loadMapData();
      } else if (visualType === VisualType.OVERLAY) {
        rootStore.filterStore.recalculateScreenCoords();

        if (newZoom <= minRequiredZoomLevel) {
          // performance optimization - dont show/update overlay below a certain zoomlevel

          rootStore.snackbarStore.displayHandler(
            "Die aktuelle Zoomstufe ist zu niedrig, um Daten zu aktualisieren!",
            2000,
            SnackbarType.WARNING
          );
          return;
        } else if (Math.abs(newZoom - currentMapZoom) <= zoomTreshold) {
          rootStore.mapStore.addAreaOverlay();
          return;
        }
        rootStore.mapStore.loadMapData();
      } else {
        if (newZoom <= minRequiredZoomLevel) {
          rootStore.snackbarStore.displayHandler(
            "Die aktuelle Zoomstufe ist zu niedrig, um Daten zu aktualisieren!",
            2000,
            SnackbarType.WARNING
          );
          return;
        } else if (Math.abs(newZoom - currentMapZoom) <= zoomTreshold) {
          // don't update data if the zoom level change is below the treshold
          return;
        }
        //rootStore.mapStore.loadMapData();
      }
      setCurrentMapZoom(newZoom);
    }
  };

  // make sure that MapboxGl (and WebGL) are supported in the browser
  // TODO: show custom error component
  if (!mapboxgl.supported()) {
    throw new Error("Your browser does not support Mapbox GL!");
  }

  return (
    <div
      className="h-[100vh] flex justify-start items-center transition-width ease-in-out duration-500 relative"
      style={{ width: isSidebarOpen ? "70%" : "100%" }}
    >
      <button
        className="absolute p-3 mt-[1em] ml-[0.5em] text-[1.4em] text-[#fff] z-50 top-20 inline-flex flex-row bg-[#fa6400] font-semibold justify-center w-auto border-solid border-[1px] border-[#ffffffcc] hover:bg-[#fb8332] rounded-[10%]"
        onClick={() => handleSidebarOpen()}
      >
        <AiOutlineMenu /> <span className="pl-2">Menu</span>
      </button>
      <div className="w-[100%] h-[100%]">
        <Map
          ref={(ref) => ref && rootStore.mapStore.setMap(ref.getMap())}
          mapboxAccessToken={process.env.MAPBOX_TOKEN}
          reuseMaps={true}
          initialViewState={{
            longitude: 12.101624,
            latitude: 49.013432,
            zoom: 12,
            bearing: 0,
            pitch: 0,
          }}
          style={{ width: "100%", height: "100%" }}
          mapStyle="mapbox://styles/mapbox/streets-v11?optimize=true"
          dragPan={{ linearity: 0.3, maxSpeed: 1400, deceleration: 3000 }}
          dragRotate={false}
          //onMove={(evt) => setViewport(evt.viewState)}
          attributionControl={false}
          minZoom={4}
          maxZoom={20}
          trackResize={true}
          antialias={false} // * set to true for antialiasing custom layers but this has a negative impact on performance
          preserveDrawingBuffer={false} // necessary to be able to export the map canvas as an image but has negative performance impact
          onDragStart={() =>
            setCurrentMapCenter(map ? map.getCenter() : currentMapCenter)
          }
          onDragEnd={() => onMapDragEnd()}
          onZoomStart={() =>
            setCurrentMapZoom(map ? map.getZoom() : currentMapZoom)
          }
          onZoomEnd={() => onMapZoomEnd()}
        >
          <NavigationControl position={"top-right"} visualizePitch={true} />
          <AttributionControl position={"bottom-right"} />
          {showHouses &&
            houses.map((house, i) => {
              return <CustomMarker house={house} key={i} />;
            })}
        </Map>
        <canvas id="texture_canvas">
          Your browser does not seem to support HTML5 canvas.
        </canvas>
      </div>
    </div>
  );
});

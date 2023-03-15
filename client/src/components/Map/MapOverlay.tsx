import mapboxgl, { LngLat } from "mapbox-gl";
import { useContext, useState } from "react";
import Map, {
  AttributionControl,
  NavigationControl,
  ScaleControl,
} from "react-map-gl";
import { SnackbarType } from "./../../stores/SnackbarStore";
import rootStore from "../../stores/RootStore";
import { VisualType } from "../../stores/MapStore";
import { observer } from "mobx-react";
import { AiOutlineMenu } from "react-icons/ai";
import { SidebarContext } from "../Sidebar/SidebarContext";

// tresholds to prevent reloading when small movements are made (performance optimization)
const zoomTreshold = 0.2; // zoom level difference -> update if a map zoom event changed more than this
const moveTreshold = 10; // map center difference in meters
/**
 * Component that returns Mapbox Map with specified settings
 */
export const MapOverlay = observer(() => {
  const { isSidebarOpen, setSidebarState } = useContext(SidebarContext);
  const [currentMapCenter, setCurrentMapCenter] = useState<LngLat>(
    new LngLat(12.101624, 49.013432)
  );
  const [currentMapZoom, setCurrentMapZoom] = useState(12);
  const [hoveredOnce, setHoveredOnce] = useState(false);
  const minRequiredZoomLevel = 7;
  const map = rootStore.mapStore.map;
  const visualType = rootStore.mapStore.visualType;
  // const timeout = useRef<NodeJS.Timeout>();

  // Clean up timeout
  /*
  useEffect(() => {
    return () => clearTimeout(timeout.current);
  }, []); */

  const handleSidebarOpen = () => {
    setSidebarState(!isSidebarOpen);
    if (!hoveredOnce) {
      setHoveredOnce(true);
    }
  };

  const onMapDragEnd = () => {
    //clearTimeout(timeout.current);
    if (map) {
      // Uses the Haversine Formula to calculate difference between tow latLng coords in meters
      const distance = currentMapCenter.distanceTo(map.getCenter());

      //! overlay needs to be updated all the time unfortunately as long as i can't find a way
      //! to draw the canvas bigger than the screen and also retain correct pixel corrdinates :(
      //!  -> would probably require view matrix transformations
      if (visualType === VisualType.BOTH) {
        // this is a threshold to avoid firing events with small moves
        if (distance < moveTreshold) {
          // if below the treshold only update overlay
          rootStore.mapStore.addAreaOverlay();
        } else {
          // if greater than the treshold load new data from the db as well
          rootStore.mapStore.loadMapData();
        }
      } else if (visualType === VisualType.OVERLAY) {
        rootStore.filterStore.recalculateScreenCoords();
        // this is a threshold to avoid firing events with small moves
        if (distance < moveTreshold) {
          // if below the treshold only update overlay
          rootStore.mapStore.addAreaOverlay();
        } else {
          rootStore.mapStore.loadMapData();
        }
      } else if (visualType === VisualType.NORMAL) {
        if (distance < moveTreshold) {
          return;
        }
        rootStore.mapStore.loadMapData();
      }
    }
  };

  const onMapZoomEnd = () => {
    if (map) {
      const newZoom = map.getZoom();

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
            1000,
            SnackbarType.WARNING
          );
          return;
        } else if (Math.abs(newZoom - currentMapZoom) <= zoomTreshold) {
          rootStore.mapStore.addAreaOverlay();
          return;
        }
        rootStore.mapStore.loadMapData();
      } else if (visualType === VisualType.NORMAL) {
        if (newZoom <= minRequiredZoomLevel) {
          rootStore.snackbarStore.displayHandler(
            "Die aktuelle Zoomstufe ist zu niedrig, um Daten zu aktualisieren!",
            2000,
            SnackbarType.WARNING
          );
          return;
        } else if (Math.abs(newZoom - currentMapZoom) <= zoomTreshold) {
          // don't update data if the zoom level change is below the treshold
          rootStore.mapStore.addAreaOverlay();
          return;
        }
        rootStore.mapStore.loadMapData();
      }
      setCurrentMapZoom(newZoom);
    }
  };

  // make sure that MapboxGl (and WebGL) are supported in the browser
  if (!mapboxgl.supported()) {
    throw new Error("Your browser does not support Mapbox GL!");
  }

  return (
    <div className="h-[100%] flex justify-start items-center transition-width ease-in-out duration-500 relative  w-[100%]">
      <button
        className={`absolute p-[0.55rem]  ml-[0.5em] mt-[0.5em] text-[1.3em] text-[#fff] z-50 top-0 left-[15em] inline-flex flex-row bg-[#fa6400] font-semibold justify-center w-auto border-solid border-[1px] border-[#ffffffcc] hover:bg-[#fb8332] rounded-[5%]  ${
          isSidebarOpen
            ? "left-[28%] filterbtnout opacity-0"
            : !isSidebarOpen && hoveredOnce
            ? "left-[2%] filterbtnin"
            : "left-[2%] opacity-1"
        }`}
        onClick={() => handleSidebarOpen()}
      >
        <AiOutlineMenu /> <span className="pl-2">Filter</span>
      </button>
      <div className="h-[100%] w-[100%]">
        <Map
          ref={(ref) => ref && rootStore.mapStore.setMap(ref.getMap())}
          mapboxAccessToken={process.env.MAPBOX_TOKEN}
          reuseMaps={true}
          hash={true}
          initialViewState={{
            longitude: 12.101624,
            latitude: 49.013432,
            zoom: 12,
            bearing: 0,
            pitch: 0,
          }}
          style={{
            width: "100%",
            height: "100%",
          }}
          mapStyle="mapbox://styles/mapbox/streets-v11?optimize=true"
          dragPan={{ linearity: 0.3, maxSpeed: 1400, deceleration: 3000 }}
          dragRotate={false}
          touchZoomRotate={false}
          //onMove={(evt) => setViewport(evt.viewState)} can be used to set new Coordinates manually
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
          <AttributionControl position={"bottom-right"} />
          <NavigationControl position={"top-right"} visualizePitch={false} />
          <ScaleControl position="bottom-left" />
        </Map>
        <canvas id="texture_canvas">
          Your browser does not seem to support HTML5 canvas.
        </canvas>
      </div>
    </div>
  );
});

import mapboxgl from "mapbox-gl";
import { memo, useEffect, useState } from "react";
import Map, { AttributionControl, NavigationControl } from "react-map-gl";
import { useFilterLayers } from "../Sidebar/Filter/FiltersContextProvider";
import { SnackbarType } from "../Snackbar/Snackbar";
import { useSnackbar } from "../Snackbar/SnackbarContextProvider";
import { VisualType, useMap } from "./MapProvider";

interface MapOverlayProps {
  /* dynamically change width depending on sidebarState */
  isSidebarOpen: boolean;
}

/**
 * Component that returns Mapbox Map with specified settings
 */
export const MapOverlay = memo((props: MapOverlayProps) => {
  const [firstRender, setFirstRender] = useState(true);
  const { setMap, selectedVisualType } = useMap();
  const { activeFilters } = useFilterLayers();
  const { displayMessage } = useSnackbar();
  const { isSidebarOpen } = props;
  // define initial Viewport state
  const [viewport, setViewport] = useState({
    longitude: 12.101624,
    latitude: 49.013432,
    zoom: 12,
  });

  useEffect(() => {
    if (firstRender) {
      setFirstRender(false);
    } else {
      if (activeFilters.size > 0) {
        if (selectedVisualType === VisualType.OVERLAY) {
          console.log("loadMapData");
        } else {
          console.log("showPOI");
        }
      } else {
        displayMessage(
          "Aktive Filter müssen vorhanden sein, um Informationen anzuzeigen!",
          3000,
          SnackbarType.WARNING
        );
      }
    }
  }, [selectedVisualType]);

  // make sure that MapboxGl (and WebGL) are supported in the browser
  // TODO: show custom error component
  if (!mapboxgl.supported()) {
    throw new Error("Your browser does not support Mapbox GL!");
  }

  console.log("rerender");

  return (
    <div
      className="h-[calc(100vh-50px)] flex justify-start items-center transition-width ease-in-out duration-500"
      style={{ width: isSidebarOpen ? "70%" : "100%" }}
    >
      <div className="w-[100%] h-[100%]">
        <Map
          ref={(ref) => ref && setMap(ref.getMap())}
          mapboxAccessToken={process.env.MAPBOX_TOKEN}
          {...viewport}
          style={{ width: "100%", height: "100%" }}
          mapStyle="mapbox://styles/mapbox/streets-v11"
          dragPan={{ linearity: 0.3, maxSpeed: 1400, deceleration: 3000 }}
          onMove={(evt) => setViewport(evt.viewState)}
          attributionControl={false}
          minZoom={4}
          maxZoom={20}
          trackResize={true}
          antialias={false} // * set to true for antialiasing custom layers but this has a negative impact on performance
          preserveDrawingBuffer={false} // necessary to be able to export the map canvas as an image but has negative performance impact
        >
          <NavigationControl position={"top-left"} visualizePitch={true} />
          <AttributionControl position={"bottom-right"} />
        </Map>
      </div>
    </div>
  );
});

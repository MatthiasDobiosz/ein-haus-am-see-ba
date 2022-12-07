import { useState } from "react";
import Map, { AttributionControl, NavigationControl } from "react-map-gl";

interface MapOverlayProps {
  /* dynamically change width depending on sidebarState */
  isSidebarOpen: boolean;
}

/**
 * Component that returns Mapbox Map with specified settings
 */
export const MapOverlay = (props: MapOverlayProps) => {
  const { isSidebarOpen } = props;
  // define initial Viewport state
  const [viewport, setViewport] = useState({
    longitude: 12.101624,
    latitude: 49.013432,
    zoom: 12,
  });

  return (
    <div
      className="h-[calc(100vh-50px)] flex justify-start items-center transition-width ease-in-out duration-500"
      style={{ width: isSidebarOpen ? "70%" : "100%" }}
    >
      <div className="w-[100%] h-[100%]">
        <Map
          mapboxAccessToken={process.env.MAPBOX_TOKEN}
          {...viewport}
          style={{ width: "100%", height: "100%" }}
          mapStyle="mapbox://styles/mapbox/streets-v12"
          dragPan={{ linearity: 0.3, maxSpeed: 1400, deceleration: 3000 }}
          onMove={(evt) => setViewport(evt.viewState)}
          attributionControl={false}
        >
          <NavigationControl position={"top-left"} visualizePitch={true} />
          <AttributionControl position={"bottom-right"} />
        </Map>
      </div>
    </div>
  );
};

import { useState } from "react";
import Map, { AttributionControl, NavigationControl } from "react-map-gl";

export const MapOverlay = () => {
  const [viewport, setViewport] = useState({
    longitude: 12.101624,
    latitude: 49.013432,
    zoom: 12,
  });

  return (
    <div className="w-screen h-[calc(100vh-4rem)] flex justify-center items-center">
      <Map
        mapboxAccessToken={process.env.MAPBOX_TOKEN}
        {...viewport}
        style={{ width: "100%", height: "100%" }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        dragPan={{ linearity: 0.3, maxSpeed: 1400, deceleration: 5 }}
        onMove={(evt) => setViewport(evt.viewState)}
        attributionControl={false}
      >
        <NavigationControl position={"top-left"} visualizePitch={true} />
        <AttributionControl position={"bottom-right"} />
      </Map>
    </div>
  );
};

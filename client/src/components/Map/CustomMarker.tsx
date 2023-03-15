import { Feature, GeoJsonProperties, Point, Position } from "geojson";
import { observer } from "mobx-react";
import { useState } from "react";
import { Marker, Popup } from "react-map-gl";

/**
 * Custom Marker that shows informational content of a single house
 * ! Works, but is not used in the current implementation
 * ! For this to work correctly, there needs to be a database table for houses/apartments
 * ! You can fetch this data in the overlay and map a marker for each house on close zoom
 */

interface CustomMarkerProps {
  house: Feature<Point, GeoJsonProperties>;
}

export interface PopupInfo {
  kind: string;
  name: string | null;
  street: string | null;
  address: string | null;
  position: Position;
}

export const CustomMarker = observer((props: CustomMarkerProps) => {
  const { house } = props;
  const [showPopup, setShowPopup] = useState(false);

  return (
    <>
      <Marker
        longitude={house.geometry.coordinates[0]}
        latitude={house.geometry.coordinates[1]}
        anchor="bottom"
        onClick={() => setShowPopup(true)}
      />
      {showPopup && (
        <Popup
          longitude={house.geometry.coordinates[0]}
          latitude={house.geometry.coordinates[1]}
          anchor="bottom"
          offset={50}
          closeOnClick={false}
          onClose={() => setShowPopup(false)}
        >
          <div className="flex flex-col">
            <span>
              Name:{" "}
              {house.properties?.name ? house.properties.name : "Unbekannt"}
            </span>
            <span>
              Art:{" "}
              {house.properties?.kind ? house.properties.kind : "Unbekannt"}
            </span>
            <span>
              Straße:
              {house.properties?.street ? house.properties.street : "Unbekannt"}
            </span>
            <span>
              Hausnummer:
              {house.properties?.address
                ? house.properties.address
                : "Unbekannt"}
            </span>
          </div>
        </Popup>
      )}
    </>
  );
});

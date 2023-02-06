import { observer } from "mobx-react";
import { City } from "./Geocoder";
import { HiMagnifyingGlass } from "react-icons/hi2";
import rootStore from "../../stores/RootStore";

interface GeocoderCityProps {
  city: City;
  onSelect: () => void;
}
export const GeocoderCity = observer((props: GeocoderCityProps) => {
  const { name, geometry } = props.city;

  function setLocation() {
    rootStore.mapStore.flyToLocation(geometry.coordinates);
    props.onSelect();
  }

  return (
    <div
      className="flex flex-row pt-4 bg-[#fff] hover:bg-gray"
      onClick={() => setLocation()}
    >
      <div className="pl-[12px] border-none text-[15px]">
        <HiMagnifyingGlass />
      </div>
      <div className="pl-2">
        <p className="text-[15px]">{name}</p>
      </div>
    </div>
  );
});

import { observer } from "mobx-react";
import { useEffect, useState } from "react";
import axios from "../../network/axiosInterceptor";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { GeocoderCity } from "./GeocoderCity";

export interface City {
  name: string;
  geometry: { type: string; coordinates: number[] };
}

export const Geocoder = observer(() => {
  const [cities, setCities] = useState<City[]>([]);
  const [currentCities, setCurrentCities] = useState<City[]>([]);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [currentText, setCurrentText] = useState("");

  useEffect(() => {
    const getAllCities = async () => {
      const response = await axios.get("/geocoder", { timeout: 10000 });
      setCities(response.data);
    };

    getAllCities().catch((error) => console.log(error));
  }, []);

  function setDisabled() {
    if (currentText === "") {
      setIsSearchActive(false);
    }
  }

  function handleTextInput(e: React.FormEvent<HTMLInputElement>) {
    const text = e.currentTarget.value;
    setCurrentText(text);
    if (text === "") {
      setCurrentCities([]);
    } else {
      const matchedCities = cities.filter((city) => {
        return city.name.toLowerCase().startsWith(text.toLowerCase());
      });
      setCurrentCities(matchedCities.slice(0, 9));
    }
    console.log(currentCities);
  }

  function onCitySelect() {
    setIsSearchActive(false);
    setCurrentCities([]);
    setCurrentText("");
  }

  return (
    <div
      className="absolute p-0 border-none mt-[8px] mr-[16px] ml-[16px] text-[25px] z-50 top-2 flex flex-col"
      onMouseLeave={() => setDisabled()}
    >
      <div className="flex flex-row searchBox">
        <div
          className="p-[6px] text-[25px] bg-[#fff]"
          onMouseEnter={() => setIsSearchActive(true)}
        >
          <FontAwesomeIcon icon={faMagnifyingGlass} />
        </div>
        <input
          type="text"
          placeholder="search city.."
          id="searchInput"
          onChange={(e) => handleTextInput(e)}
          className={`searchInput w-0 ${isSearchActive ? "active" : ""}`}
          value={currentText}
        />
      </div>
      {currentCities.length > 0 && (
        <div className=" flex flex-col ">
          {currentCities.map((city) => {
            return (
              <GeocoderCity
                city={city}
                key={city.name}
                onSelect={onCitySelect}
              />
            );
          })}
        </div>
      )}
    </div>
  );
});

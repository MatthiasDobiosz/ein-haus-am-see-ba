import { observer } from "mobx-react";
import { useEffect, useState } from "react";
import axios from "../../network/axiosInterceptor";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

interface City {
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
        return city.name.includes(text);
      });
      setCurrentCities(matchedCities.slice(0, 9));
    }
  }

  if (!isSearchActive) {
    return (
      <div
        className="absolute p-[6px] border-none mt-[8px] mr-[16px] ml-[16px] text-[25px] z-50 top-2 bg-[#fff]"
        onMouseEnter={() => setIsSearchActive(true)}
      >
        <FontAwesomeIcon icon={faMagnifyingGlass} />
      </div>
    );
  }
  return (
    <div
      className="absolute p-0 border-none mt-[8px] mr-[16px] ml-[16px] text-[25px] z-50 top-2 flex flex-col"
      onMouseLeave={() => setDisabled()}
    >
      <div className="flex flex-row">
        <div className="p-[6px] border-none text-[25px] bg-[#fff]">
          <FontAwesomeIcon icon={faMagnifyingGlass} />
        </div>
        <div className={`block SearchBar`}>
          <input
            type="text"
            placeholder="search city.."
            onChange={(e) => handleTextInput(e)}
            className="h-[100%]"
          />
        </div>
      </div>
      <div className="">
        <div>Regensburg</div>
      </div>
    </div>
  );
});

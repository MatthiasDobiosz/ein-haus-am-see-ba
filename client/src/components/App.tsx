import "./App.css";
import { Navbar } from "./Navbar";
import { MapOverlay } from "./Map/MapOverlay";

function App() {
  return (
    <div className=" w-screen h-screen box-border mt-0 ml-0">
      <Navbar />
      <MapOverlay />
    </div>
  );
}

export default App;

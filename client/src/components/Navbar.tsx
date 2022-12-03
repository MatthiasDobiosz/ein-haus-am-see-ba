import axios from "axios";
import {
  endPerformanceMeasure,
  evaluateMeasure,
  startPerformanceMeasure,
} from "../../../shared/benchmarking.js";

export const Navbar = () => {
  const fetchPerformanceServer = () => {
    axios
      .get("/test")
      .then((resp) => console.log(resp.data))
      .catch((err) => console.log(err));
  };

  const fetchPerformanceClient = () => {
    console.log("hey");
    startPerformanceMeasure("client");
    let j = 0;
    for (let i = 0; i < 1000000; i++) {
      j += i;
    }
    console.log(j);
    endPerformanceMeasure("client"), evaluateMeasure();
  };
  return (
    <nav className="bg-gray-800 h-16">
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-[8vh] items-center justify-between">
          <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>

              <svg
                className="block h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              </svg>

              <svg
                className="hidden h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-center">
            <div className="hidden sm:mr-50 sm:block">
              <div className="flex space-x-4">
                <p className="text-fuchsia-200">lul</p>
              </div>
            </div>
            <button
              className="bg-orange-500 ml-11"
              onClick={() => fetchPerformanceServer()}
            >
              server
            </button>
            <button
              className="bg-orange-500 ml-11"
              onClick={() => fetchPerformanceClient()}
            >
              client
            </button>
          </div>
        </div>
      </div>

      <div className="sm:hidden" id="mobile-menu">
        <div className="space-y-1 px-2 pt-2 pb-3">
          <a
            href="#"
            className="bg-gray-900 text-white block px-3 py-2 rounded-md text-base font-medium"
            aria-current="page"
          >
            Ein Haus am See
          </a>
        </div>
      </div>
    </nav>
  );
};

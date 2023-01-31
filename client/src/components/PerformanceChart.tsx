import { observer } from "mobx-react";
import { useCallback, useEffect, useRef, useState } from "react";
import axios from "../network/axiosInterceptor";
import { DBType, getMeasures, measurement } from "../../../shared/benchmarking";
import {
  BarElement,
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  Chart,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const possibleBenchmarks = [
  "The whole workflow",
  "Request Client Side",
  "RequestServer",
  "Sending Data to Client",
  "Query From Database",
  "Osm to Geojson",
  "removing existing layers",
  "Adding new GeoData",
  "Loading of all filters",
  "Loadtime of a single filter",
  "Rendering of All Polygons",
  "Creating the Canvas Layer",
  "Rendering of Polygons for single Layer",
  "Getting Image from Canvas to blur",
  "Bluring of image",
  "Reading and saving final layer",
  "Combining of textures",
  "Creating Alpha Mask",
  "Adding Layer to the Map",
  "Adding Buffers",
];

export const PerformanceChart = observer((): JSX.Element => {
  const [labels, setLabels] = useState<string[]>([]);
  const [postGISSingleData, setPostGISSingleData] = useState<number[]>([]);
  const [postGISIndexData, setPostGISIndexData] = useState<number[]>([]);
  const [postGISBufferData, setPostGISBufferData] = useState<number[]>([]);
  const [overpassData, setOverpassData] = useState<number[]>([]);

  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    const fetchBackendData = async () => {
      const response = await axios.get("/backendLogs", { timeout: 10000 });
      filterData(response.data);
    };

    fetchBackendData().catch((error) => console.log(error));
  }, []);

  const exportAsPng = useCallback(() => {
    if (chartRef.current) {
      const link = document.createElement("a");
      link.download = "chart.png";
      link.href = chartRef.current.toBase64Image();
      link.click();
    }
  }, []);
  function filterData(backendData: measurement[]) {
    let allMeasures: measurement[];
    if (backendData) {
      allMeasures = getMeasures().concat(backendData);
    } else {
      allMeasures = getMeasures();
    }
    console.log(allMeasures);

    let postGISSingleMeasures = allMeasures.filter((measure) => {
      return measure.name.includes(DBType.POSTGISSINGLE);
    });
    postGISSingleMeasures.forEach((filteredMeasure) => {
      filteredMeasure.name = filteredMeasure.name.replace(
        DBType.POSTGISSINGLE,
        ""
      );
    });

    let postGISIndexMeasures = allMeasures.filter((measure) => {
      return measure.name.includes(DBType.POSTGISINDEX);
    });

    postGISIndexMeasures.forEach((filteredMeasure) => {
      filteredMeasure.name = filteredMeasure.name.replace(
        DBType.POSTGISINDEX,
        ""
      );
    });

    let postGISBufferMeasures = allMeasures.filter((measure) => {
      return measure.name.includes(DBType.POSTGISBUFFER);
    });

    postGISBufferMeasures.forEach((filteredMeasure) => {
      filteredMeasure.name = filteredMeasure.name.replace(
        DBType.POSTGISBUFFER,
        ""
      );
    });

    let overpassMeasures = allMeasures.filter((measure) => {
      return measure.name.includes(DBType.OVERPASS);
    });
    overpassMeasures.forEach((filteredMeasure) => {
      filteredMeasure.name = filteredMeasure.name.replace(DBType.OVERPASS, "");
    });

    postGISSingleMeasures = addLoadingTime(postGISSingleMeasures);
    postGISIndexMeasures = addLoadingTime(postGISIndexMeasures);
    postGISBufferMeasures = addLoadingTime(postGISBufferMeasures);
    overpassMeasures = addLoadingTime(overpassMeasures);

    const PostGISSinglePoints: number[] = [];
    const PostGISIndexPoints: number[] = [];
    const PostGISBufferPoints: number[] = [];
    const OverpassPoints: number[] = [];
    const matchedLabels: string[] = [];

    for (let i = 0; i < possibleBenchmarks.length; i++) {
      let matched = false;

      const singleIndex = postGISSingleMeasures.findIndex(
        (measure) => measure.name === possibleBenchmarks[i]
      );
      if (singleIndex > -1) {
        matched = true;
        PostGISSinglePoints.push(postGISSingleMeasures[singleIndex].duration);
      } else {
        PostGISSinglePoints.push(-10);
      }

      const indexIndex = postGISIndexMeasures.findIndex(
        (measure) => measure.name === possibleBenchmarks[i]
      );
      if (indexIndex > -1) {
        matched = true;
        PostGISIndexPoints.push(postGISIndexMeasures[indexIndex].duration);
      } else {
        PostGISIndexPoints.push(-10);
      }

      const bufferIndex = postGISBufferMeasures.findIndex(
        (measure) => measure.name === possibleBenchmarks[i]
      );
      if (bufferIndex > -1) {
        matched = true;
        PostGISBufferPoints.push(postGISBufferMeasures[bufferIndex].duration);
      } else {
        PostGISBufferPoints.push(-10);
      }

      const overpassIndex = overpassMeasures.findIndex(
        (measure) => measure.name === possibleBenchmarks[i]
      );
      if (overpassIndex > -1) {
        matched = true;
        OverpassPoints.push(overpassMeasures[overpassIndex].duration);
      } else {
        OverpassPoints.push(-10);
      }

      if (matched) {
        matchedLabels.push(possibleBenchmarks[i]);
      } else {
        PostGISSinglePoints.pop();
        PostGISIndexPoints.pop();
        PostGISBufferPoints.pop();
        OverpassPoints.pop();
      }
    }

    setPostGISSingleData(PostGISSinglePoints);
    setPostGISIndexData(PostGISIndexPoints);
    setPostGISBufferData(PostGISBufferPoints);
    setOverpassData(OverpassPoints);
    setLabels(matchedLabels);
  }

  function addLoadingTime(measures: measurement[]): measurement[] {
    const newMeasures = measures;
    const clientTime = measures.find((measurement) => {
      return measurement.name === "Request Client Side";
    })?.duration;
    const serverTime = measures.find((measurement) => {
      return measurement.name === "RequestServer";
    })?.duration;

    if (clientTime && serverTime) {
      const sendingData: measurement = {
        name: "Sending Data to Client",
        duration: clientTime - serverTime,
        count: 1,
      };
      newMeasures.push(sendingData);
    }
    return newMeasures;
  }

  const plugin = {
    beforeDraw: (chartCtx: Chart) => {
      const ctx = chartCtx.canvas.getContext("2d");
      if (ctx) {
        ctx.save();
        ctx.globalCompositeOperation = "destination-over";
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, chartCtx.width, chartCtx.height);
        ctx.restore();
      }
    },
    id: "png",
  };

  const options = {
    indexAxis: "y" as const,
    elements: {
      bar: {
        borderWidth: 2,
      },
    },
    responsive: true,
    plugins: {
      legend: {
        position: "right" as const,
      },
      title: {
        display: true,
        text: "Performance Comparison",
      },
    },
  };

  const data = {
    labels: labels,
    datasets: [
      {
        label: "PostGIS (Union Query)",
        data: postGISSingleData,
        borderColor: "rgb(251, 86, 7)",
        backgroundColor: "rgba(251, 86, 7, 0.5)",
      },
      {
        label: "PostGIS (Gist-Index)",
        data: postGISIndexData,
        borderColor: "rgb(255, 0, 110)",
        backgroundColor: "rgba(255, 0, 110, 0.5)",
      },
      {
        label: "PostGIS (Buffer)",
        data: postGISBufferData,
        borderColor: "rgb(131, 56, 236)",
        backgroundColor: "rgba(131, 56, 236, 0.5)",
      },
      {
        label: "Overpass",
        data: overpassData,
        borderColor: "rgb(58, 134, 255)",
        backgroundColor: "rgba(58, 134, 255, 0.5)",
      },
    ],
  };

  return (
    <div className=" w-[80vw] h-[80vh] flex flex-col gap-4 justify-center items-center">
      <Bar options={options} data={data} ref={chartRef} plugins={[plugin]} />
      <button
        onClick={() => exportAsPng()}
        className="p-[0.2em] cursor-pointer border-0 rounded-[2px] outline-none shadow bg-lightorange text-whitesmoke hover:bg-darkorange active:bg-darkorange"
      >
        Export as Png
      </button>
    </div>
  );
});

import { observer } from "mobx-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { getMeasures } from "../../../shared/benchmarking";
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

export const PerformanceChart = observer((): JSX.Element => {
  const [labels, setLabels] = useState<string[]>([]);
  const [postGISData, setPostGISData] = useState<number[]>([]);
  const [overpassData, setOverpassData] = useState<number[]>([]);

  const chartRef = useRef<Chart | null>(null);
  useEffect(() => {
    filterData();
  }, []);

  const exportAsPng = useCallback(() => {
    if (chartRef.current) {
      const link = document.createElement("a");
      link.download = "chart.png";
      link.href = chartRef.current.toBase64Image();
      link.click();
    }
  }, []);
  function filterData() {
    const allMeasures = getMeasures();
    console.log(allMeasures);
    const postGISMeasures = allMeasures.filter((measure) => {
      return measure.name.includes("(PostGIS)");
    });
    postGISMeasures.forEach((filteredMeasure) => {
      filteredMeasure.name = filteredMeasure.name.replace(" (PostGIS)", "");
    });

    const overpassMeasures = allMeasures.filter((measure) => {
      return measure.name.includes("(Overpass)");
    });
    overpassMeasures.forEach((filteredMeasure) => {
      filteredMeasure.name = filteredMeasure.name.replace(" (Overpass)", "");
    });

    const matchedPostGISPoints: number[] = [];
    const matchedOverpassPoints: number[] = [];
    const matchedLabels: string[] = [];

    for (let i = 0; i < postGISMeasures.length; i++) {
      for (let y = 0; y < overpassMeasures.length; y++) {
        if (postGISMeasures[i].name === overpassMeasures[y].name) {
          matchedLabels.push(postGISMeasures[i].name);
          matchedPostGISPoints.push(postGISMeasures[i].duration);
          matchedOverpassPoints.push(overpassMeasures[y].duration);
        }
      }
    }

    setPostGISData(matchedPostGISPoints);
    setOverpassData(matchedOverpassPoints);
    setLabels(matchedLabels);
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
        label: "PostGIS",
        data: postGISData,
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
      {
        label: "Overpass",
        data: overpassData,
        borderColor: "rgb(53, 162, 235)",
        backgroundColor: "rgba(53, 162, 235, 0.5)",
      },
    ],
  };

  return (
    <div className=" w-[50vw] h-[50vh] flex flex-col gap-4 justify-center items-center">
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

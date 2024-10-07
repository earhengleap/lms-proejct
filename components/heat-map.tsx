"use client";

import React, { useState, useEffect } from "react";
import HeatMap from "@uiw/react-heat-map";

export interface HeatMapDataPoint {
  date: string;
  count: number;
}

type Props = {
  data: HeatMapDataPoint[];
};

const panelColors = {
  0: "#F3F4F5",
  1: "#E0E8F0",
  2: "#B0C3D9",
  3: "#7B98B2",
  4: "#186AA4",
};

const UserHeatMap = ({ data }: Props) => {
  const [dimensions, setDimensions] = useState({
    width: 1200,
    rectSize: 18,
    height: 200,
  });

  useEffect(() => {
    const handleResize = () => {
      const containerWidth = window.innerWidth;
      if (containerWidth < 640) {
        // Mobile
        setDimensions({
          width: containerWidth - 40,
          rectSize: 20, // Increased rectangle size for better visibility
          height: 200, // Adjust height if necessary to accommodate larger rectangles
        });
      } else if (containerWidth < 768) {
        // Tablet
        setDimensions({
          width: containerWidth - 60,
          rectSize: 15,
          height: 200,
        });
      } else {
        // Desktop
        setDimensions({
          width: Math.min(containerWidth - 80, 1200),
          rectSize: 18,
          height: 200,
        });
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const aggregatedData = data.reduce((acc, curr) => {
    const existingPoint = acc.find((point) => point.date === curr.date);
    if (existingPoint) {
      existingPoint.count += curr.count;
    } else {
      acc.push({ ...curr });
    }
    return acc;
  }, [] as HeatMapDataPoint[]);

  return (
    <div className="flex justify-center items-center w-full overflow-x-auto p-4">
      <div style={{ width: dimensions.width, maxWidth: "100%" }}>
        <HeatMap
          value={aggregatedData}
          width={dimensions.width}
          height={dimensions.height}
          style={{
            color: "#888",
          }}
          panelColors={panelColors}
          rectSize={dimensions.rectSize}
          startDate={new Date(aggregatedData[0]?.date || new Date())}
          rectProps={{
            rx: 4,
            ry: 4,
          }}
          legendCellSize={20}
          rectRender={(props, data) => {
            const tooltipContent =
              data.count > 0
                ? `${data.count} quiz submission${data.count > 1 ? "s" : ""} on ${new Date(data.date).toDateString()}`
                : `No quiz submissions on ${new Date(data.date).toDateString()}`;

            return (
              <g>
                <rect
                  {...props}
                  onMouseEnter={(e) => {
                    const tooltip = document.createElement("div");
                    tooltip.className = "tooltip";
                    tooltip.innerHTML = tooltipContent;
                    tooltip.style.position = "fixed";
                    tooltip.style.backgroundColor = "rgba(0, 0, 0, 0.75)";
                    tooltip.style.color = "#fff";
                    tooltip.style.padding = "8px 12px";
                    tooltip.style.borderRadius = "8px";
                    tooltip.style.pointerEvents = "none";
                    tooltip.style.zIndex = "9999";
                    tooltip.style.fontSize = "14px";
                    document.body.appendChild(tooltip);

                    const rect = e.currentTarget.getBoundingClientRect();
                    tooltip.style.left = `${rect.left}px`;
                    tooltip.style.top = `${rect.top - 40}px`;

                    e.currentTarget.onmouseleave = () => {
                      tooltip.remove();
                    };
                  }}
                />
              </g>
            );
          }}
        />
      </div>
    </div>
  );
};

export default UserHeatMap;

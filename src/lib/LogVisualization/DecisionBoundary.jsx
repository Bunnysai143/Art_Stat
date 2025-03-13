import React, { useRef, useState, useEffect } from 'react';
import * as d3 from 'd3';


const DecisionBoundary= ({ data }) => {
  const svgRef = useRef(null);
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [tooltipPos, setTooltipPos] = useState(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const margin = { top: 40, right: 100, bottom: 60, left: 60 };
    const width = 800 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    // Clear previous content
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create scales
    const xExtent = d3.extent(data.points, d => d.x) ;
    const yExtent = d3.extent(data.points, d => d.y);
    
    const padding = 1;
    const x = d3.scaleLinear()
      .domain([xExtent[0] - padding, xExtent[1] + padding])
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([yExtent[0] - padding, yExtent[1] + padding])
      .range([height, 0]);

    // Add grid
    const gridOpacity = 0.2;
    const xGrid = d3.axisBottom(x)
      .tickSize(-height)
      .tickFormat(() => "");

    const yGrid = d3.axisLeft(y)
      .tickSize(-width)
      .tickFormat(() => "");

    svg.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${height})`)
      .call(xGrid)
      .style("opacity", gridOpacity);

    svg.append("g")
      .attr("class", "grid")
      .call(yGrid)
      .style("opacity", gridOpacity);

    // Add axes
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x));

    svg.append("g")
      .call(d3.axisLeft(y));

    // Draw decision boundary
    const { w1, w2, bias } = data.weights;
    if (w2 !== 0) {
      const xValues = d3.range(x.domain()[0], x.domain()[1], 0.1);
      const boundaryPoints = xValues.map(xVal => ({
        x: xVal,
        y: (-w1 * xVal - bias) / w2
      }));

      const line = d3.line()
        .x(d => x(d.x))
        .y(d => y(d.y));

      // Decision boundary
      svg.append("path")
        .datum(boundaryPoints)
        .attr("fill", "none")
        .attr("stroke", "#10b981")
        .attr("stroke-width", 3)
        .attr("d", line);

      // Probability contours
      const drawContour = (probability  ) => {
        const logit = Math.log(probability / (1 - probability));
        const contourPoints = xValues.map(xVal => ({
          x: xVal,
          y: (-w1 * xVal - bias + logit) / w2
        }));

        svg.append("path")
          .datum(contourPoints)
          .attr("fill", "none")
          .attr("stroke", "rgba(16, 185, 129, 0.3)")
          .attr("stroke-width", 2)
          .attr("stroke-dasharray", "5,5")
          .attr("d", line);
      };

      drawContour(0.25);
      drawContour(0.75);
    }

    // Draw points
    const points = svg.selectAll("circle")
      .data(data.points)
      .enter()
      .append("circle")
      .attr("cx", d => x(d.x))
      .attr("cy", d => y(d.y))
      .attr("r", 5)
      .attr("fill", d => d.class === 1 ? "#3b82f6" : "#ef4444")
      .attr("stroke", "white")
      .attr("stroke-width", 1.5)
      .style("cursor", "pointer")
      .on("mouseover", (event, d) => {
        setHoveredPoint(d);
        setTooltipPos({
          x: event.pageX,
          y: event.pageY
        });
        
        d3.select(event.currentTarget)
          .transition()
          .duration(200)
          .attr("r", 8)
          .attr("stroke-width", 2);
      })
      .on("mouseout", (event) => {
        setHoveredPoint(null);
        setTooltipPos(null);
        
        d3.select(event.currentTarget)
          .transition()
          .duration(200)
          .attr("r", 5)
          .attr("stroke-width", 1.5);
      });

    // Add legend
    const legend = svg.append("g")
      .attr("transform", `translate(${width + 20}, 20)`);

    // Class 1
    legend.append("circle")
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", 5)
      .attr("fill", "#3b82f6");

    legend.append("text")
      .attr("x", 15)
      .attr("y", 5)
      .text("Class 1")
      .style("font-size", "14px");

    // Class 0
    legend.append("circle")
      .attr("cx", 0)
      .attr("cy", 25)
      .attr("r", 5)
      .attr("fill", "#ef4444");

    legend.append("text")
      .attr("x", 15)
      .attr("y", 30)
      .text("Class 0")
      .style("font-size", "14px");

    // Decision boundary
    legend.append("line")
      .attr("x1", -10)
      .attr("x2", 10)
      .attr("y1", 50)
      .attr("y2", 50)
      .attr("stroke", "#10b981")
      .attr("stroke-width", 3);

    legend.append("text")
      .attr("x", 15)
      .attr("y", 55)
      .text("Decision Boundary")
      .style("font-size", "14px");

    // Probability contours
    legend.append("line")
      .attr("x1", -10)
      .attr("x2", 10)
      .attr("y1", 75)
      .attr("y2", 75)
      .attr("stroke", "rgba(16, 185, 129, 0.3)")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5");

    legend.append("text")
      .attr("x", 15)
      .attr("y", 80)
      .text("Probability Contours")
      .style("font-size", "14px");

  }, [data]);

  return (
    <div className="h-full flex flex-col">
      <h3 className="text-lg font-medium mb-4">Decision Boundary Visualization</h3>
      <div className="flex-grow bg-white rounded-lg overflow-hidden relative">
        <svg ref={svgRef} className="w-full h-full" />
        
        {hoveredPoint && tooltipPos && (
          <div 
            className="absolute bg-black bg-opacity-80 text-white p-3 rounded-lg shadow-lg text-sm z-10"
            style={{
              left: tooltipPos.x + 10,
              top: tooltipPos.y - 80,
              transform: 'translateX(-50%)',
              pointerEvents: 'none'
            }}
          >
            <div className="font-medium mb-1">Point Details</div>
            <div>X: {hoveredPoint.x.toFixed(3)}</div>
            <div>Y: {hoveredPoint.y.toFixed(3)}</div>
            <div>Class: {hoveredPoint.class}</div>
          </div>
        )}
      </div>
      <div className="mt-4 text-sm text-gray-600">
        <p>The decision boundary (green line) shows where the model predicts a 50% probability of being class 1.</p>
        <p>Points are colored by their true class: blue for class 1 and red for class 0.</p>
        <p>Dashed lines show the 25% and 75% probability contours.</p>
        <p>Hover over points to see their details!</p>
      </div>
    </div>
  );
};

export default DecisionBoundary;
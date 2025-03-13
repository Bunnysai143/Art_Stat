import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';



const SigmoidFunction = ({ data }) => {
  const svgRef = useRef(null);
  const [sliderValue, setSliderValue] = useState(0);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    if (!svg) return;

    // Clear previous content
    svg.selectAll("*").remove();

    const margin = { top: 40, right: 40, bottom: 60, left: 60 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const chartGroup = svg
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create scales
    const x = d3.scaleLinear()
      .domain([-10, 10])
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([0, 1])
      .range([height, 0]);

    // Add axes
    chartGroup.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x));

    chartGroup.append("g")
      .call(d3.axisLeft(y));

    // Add labels
    chartGroup.append("text")
      .attr("text-anchor", "middle")
      .attr("x", width/2)
      .attr("y", height + margin.bottom - 10)
      .text("Input (z)");

    chartGroup.append("text")
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(-90)")
      .attr("y", -margin.left + 20)
      .attr("x", -height/2)
      .text("Probability");

    // Generate sigmoid curve data
    const sigmoid = (x) => 1 / (1 + Math.exp(-(x + sliderValue)));
    const points = d3.range(-10, 10, 0.1).map(x => ({
      x: x,
      y: sigmoid(x)
    }));

    // Add the sigmoid curve
    const line = d3.line()
      .x(d => x(d.x))
      .y(d => y(d.y));

    chartGroup.append("path")
      .datum(points)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 2)
      .attr("d", line);

    // Add interactive point
    const interactivePoint = chartGroup.append("circle")
      .attr("r", 5)
      .attr("fill", "red");

    // Add vertical and horizontal lines for point
    const vLine = chartGroup.append("line")
      .attr("stroke", "red")
      .attr("stroke-dasharray", "4");

    const hLine = chartGroup.append("line")
      .attr("stroke", "red")
      .attr("stroke-dasharray", "4");

    // Update point position based on slider
    const updatePoint = () => {
      const xPos = x(sliderValue);
      const yPos = y(sigmoid(sliderValue));
      
      interactivePoint
        .attr("cx", xPos)
        .attr("cy", yPos);

      vLine
        .attr("x1", xPos)
        .attr("x2", xPos)
        .attr("y1", height)
        .attr("y2", yPos);

      hLine
        .attr("x1", 0)
        .attr("x2", xPos)
        .attr("y1", yPos)
        .attr("y2", yPos);
    };

    updatePoint();

  }, [sliderValue, data]);

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="w-full max-w-2xl bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Sigmoid Function Visualization</h3>
        <svg ref={svgRef}></svg>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">
            Input Value (z): {sliderValue.toFixed(2)}
          </label>
          <input
            type="range"
            min="-10"
            max="10"
            step="0.1"
            value={sliderValue}
            onChange={(e) => setSliderValue(parseFloat(e.target.value))}
            className="w-full mt-2"
          />
        </div>
        <div className="mt-4 text-sm text-gray-600">
          <h4 className="font-medium mb-2">How it works:</h4>
          <p>The sigmoid function maps any input value to a probability between 0 and 1. It's defined as:</p>
          <p className="my-2 font-mono">σ(z) = 1 / (1 + e^(-z))</p>
          <p>Move the slider to see how different input values (z) are transformed into probabilities.</p>
          <ul className="list-disc list-inside mt-2">
            <li>Large negative inputs approach 0</li>
            <li>Large positive inputs approach 1</li>
            <li>Input of 0 gives output of 0.5</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SigmoidFunction;
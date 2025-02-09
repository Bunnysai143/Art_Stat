import React, { useEffect, useRef } from 'react';



export function ScatterPlot({ data, width, height, animationProgress }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size with device pixel ratio for sharp rendering
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Scale all drawing operations by dpr
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Set up padding and plot area
    const padding = 50;
    const plotWidth = width - 2 * padding;
    const plotHeight = height - 2 * padding;

    // Draw grid
    ctx.beginPath();
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;

    // Vertical grid lines
    for (let i = 0; i <= 10; i++) {
      const x = padding + (i / 10) * plotWidth;
      ctx.moveTo(x, padding);
      ctx.lineTo(x, height - padding);
    }

    // Horizontal grid lines
    for (let i = 0; i <= 10; i++) {
      const y = padding + (i / 10) * plotHeight;
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
    }
    ctx.stroke();

    // Draw axes
    ctx.beginPath();
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 2;
    
    // X-axis
    ctx.moveTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    
    // Y-axis
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.stroke();

    // Draw axis labels and ticks
    ctx.fillStyle = '#374151';
    ctx.font = '12px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    
    // X-axis labels and ticks
    for (let i = 0; i <= 10; i++) {
      const x = padding + (i / 10) * plotWidth;
      const value = (i / 10).toFixed(1);
      
      // Draw tick
      ctx.beginPath();
      ctx.moveTo(x, height - padding);
      ctx.lineTo(x, height - padding + 5);
      ctx.stroke();
      
      // Draw label
      ctx.fillText(value, x, height - padding + 20);
    }
    
    // Y-axis labels and ticks
    ctx.textAlign = 'right';
    for (let i = 0; i <= 10; i++) {
      const y = height - padding - (i / 10) * plotHeight;
      const value = (i / 10).toFixed(1);
      
      // Draw tick
      ctx.beginPath();
      ctx.moveTo(padding - 5, y);
      ctx.lineTo(padding, y);
      ctx.stroke();
      
      // Draw label
      ctx.fillText(value, padding - 10, y + 4);
    }

    // Axis titles
    ctx.font = '14px Inter, system-ui, sans-serif';
    ctx.fillStyle = '#1F2937';
    
    // X-axis title
    ctx.textAlign = 'center';
    ctx.fillText('X Values', width / 2, height - 10);
    
    // Y-axis title
    ctx.save();
    ctx.translate(15, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Y Values', 0, 0);
    ctx.restore();

    // Draw points with animation
    const numPoints = Math.floor(data.x.length * animationProgress);
    
    for (let i = 0; i < numPoints; i++) {
      const x = padding + data.x[i] * plotWidth;
      const y = height - (padding + data.y[i] * plotHeight);

      // Draw point shadow
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(79, 70, 229, 0.2)';
      ctx.fill();

      // Draw point
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(79, 70, 229, 0.8)';
      ctx.fill();
      ctx.strokeStyle = 'rgb(79, 70, 229)';
      ctx.stroke();

      // Draw coordinates for the latest point
      if (i === numPoints - 1) {
        ctx.fillStyle = '#1F2937';
        ctx.font = '12px Inter, system-ui, sans-serif';
        const xText = data.x[i].toFixed(2);
        const yText = data.y[i].toFixed(2);
        ctx.fillText(`(${xText}, ${yText})`, x + 10, y - 10);
      }
    }
  }, [data, width, height, animationProgress]);

  return (
    <div className="relative w-full h-full">
      <canvas 
        ref={canvasRef} 
        className="w-full h-full border border-gray-200 rounded-lg bg-white"
      />
      <div className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-md text-sm text-gray-600 border border-gray-200">
        Points: {Math.floor(data.x.length * animationProgress)} / {data.x.length}
      </div>
    </div>
  );
}
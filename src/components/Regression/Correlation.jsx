import React, { useState, useEffect, useCallback, useRef } from 'react';
import { generateCorrelationData } from '../../utils/dataGeneartor';
import { ArrowRight, RefreshCw, Info } from 'lucide-react';

function Correlation() {
  const [data, setData] = useState(generateCorrelationData());
  const [animationProgress, setAnimationProgress] = useState(0);
  const canvasRef = useRef(null);

  const generateNewData = useCallback(() => {
    setData(generateCorrelationData());
    setAnimationProgress(0);
  }, []);

  useEffect(() => {
    const interval = setInterval(generateNewData, 8000);
    return () => clearInterval(interval);
  }, [generateNewData]);

  useEffect(() => {
    let animationFrame;
    const animate = () => {
      setAnimationProgress(prev => {
        if (prev >= 1) return 1;
        return prev + 0.02;
      });
      animationFrame = requestAnimationFrame(animate);
    };
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [data]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set up scaling
    const padding = 60;
    const width = canvas.width - 2 * padding;
    const height = canvas.height - 2 * padding;

    // Draw background grid
    ctx.beginPath();
    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = 1;
    for (let i = -1; i <= 1; i += 0.2) {
      const x = padding + ((i + 1) / 2) * width;
      const y = canvas.height - (padding + ((i + 1) / 2) * height);
      
      ctx.moveTo(padding, y);
      ctx.lineTo(canvas.width - padding, y);
      ctx.moveTo(x, padding);
      ctx.lineTo(x, canvas.height - padding);
    }
    ctx.stroke();

    // Draw axes
    ctx.beginPath();
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 1.5;
    
    // X-axis
    ctx.moveTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    
    // Y-axis
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.stroke();

    // Add axis labels and ticks
    ctx.font = '12px Arial';
    ctx.fillStyle = '#666';
    ctx.textAlign = 'center';

    // X-axis ticks and labels
    for (let i = -1; i <= 1; i += 0.5) {
      const x = padding + ((i + 1) / 2) * width;
      const y = canvas.height - padding + 20;
      
      ctx.beginPath();
      ctx.moveTo(x, canvas.height - padding - 5);
      ctx.lineTo(x, canvas.height - padding + 5);
      ctx.stroke();
      
      ctx.fillText(i.toFixed(1), x, y);
    }

    // Y-axis ticks and labels
    ctx.textAlign = 'right';
    for (let i = -1; i <= 1; i += 0.5) {
      const x = padding - 10;
      const y = canvas.height - (padding + ((i + 1) / 2) * height);
      
      ctx.beginPath();
      ctx.moveTo(padding - 5, y);
      ctx.lineTo(padding + 5, y);
      ctx.stroke();
      
      ctx.fillText(i.toFixed(1), x, y + 4);
    }

    // Axis titles
    ctx.font = '14px Arial';
    ctx.fillStyle = '#333';
    ctx.textAlign = 'center';
    ctx.fillText('X Variable', canvas.width / 2, canvas.height - 20);
    
    ctx.save();
    ctx.translate(20, canvas.height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Y Variable', 0, 0);
    ctx.restore();

    // Draw regression line first (behind points)
    if (Math.abs(data.correlation) > 0.3 && data.type !== 'nonlinear' && animationProgress === 1) {
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.7)';
      ctx.lineWidth = 2;
      
      // Calculate regression line points
      const slope = data.correlation;
      const x1 = -1;
      const y1 = -slope;
      const x2 = 1;
      const y2 = slope;
      
      // Transform to canvas coordinates
      const canvasX1 = padding + ((x1 + 1) / 2) * width;
      const canvasY1 = canvas.height - (padding + ((y1 + 1) / 2) * height);
      const canvasX2 = padding + ((x2 + 1) / 2) * width;
      const canvasY2 = canvas.height - (padding + ((y2 + 1) / 2) * height);
      
      ctx.moveTo(canvasX1, canvasY1);
      ctx.lineTo(canvasX2, canvasY2);
      ctx.stroke();
    }

    // Plot points with animation
    const visiblePoints = Math.floor(data.points?.length * animationProgress);
    
    data.points?.slice(0, visiblePoints).forEach(point => {
      const x = padding + ((point.x + 1) / 2) * width;
      const y = canvas.height - (padding + ((point.y + 1) / 2) * height);

      ctx.beginPath();
      ctx.fillStyle = 'rgba(59, 130, 246, 0.8)';
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    });
  }, [data, animationProgress]);

  const getCorrelationDescription = () => {
    const r = data.correlation;
    if (data.type === 'nonlinear') return "Nonlinear relationship";
    if (Math.abs(r) > 0.7) return r > 0 ? "Strong positive correlation" : "Strong negative correlation";
    if (Math.abs(r) > 0.3) return r > 0 ? "Moderate positive correlation" : "Moderate negative correlation";
    return "Weak or no correlation";
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-2/3 bg-white rounded-xl p-6 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">Learn Correlation By Visualization</h2>
            <button 
              onClick={generateNewData}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <RefreshCw size={16} />
              New Data
            </button>
          </div>
          <canvas
            ref={canvasRef}
            width={800}
            height={500}
            className="w-full rounded-lg bg-gray-50"
          />
        </div>

        <div className="lg:w-1/3 space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">Correlation Statistics</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Info size={20} className="text-blue-500" />
                <span className="font-medium">{getCorrelationDescription()}</span>
              </div>
              <p className="text-gray-600">
                Correlation coefficient (r): {data.correlation?.toFixed(3)}
              </p>
              <p className="text-gray-600">
                Type: {data.type?.charAt(0).toUpperCase() + data.type?.slice(1)} correlation
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">Learning Points</h2>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <ArrowRight size={20} className="text-blue-500 mt-1 flex-shrink-0" />
                <span>Correlation measures the strength and direction of a linear relationship between two variables</span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight size={20} className="text-blue-500 mt-1 flex-shrink-0" />
                <span>Values range from -1 (perfect negative) to +1 (perfect positive)</span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight size={20} className="text-blue-500 mt-1 flex-shrink-0" />
                <span>Not all relationships are linear - some patterns may show strong relationships but low correlation</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Correlation;
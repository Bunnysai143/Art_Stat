import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Play, RotateCcw, Trophy, Book, Plus, X, Database } from 'lucide-react';
import { generateRegressionData, calculateRMSE, PRESET_DATASETS } from '../../utils/exregData';


function ExploreRegression() {
  const canvasRef = useRef(null);
  const [data, setData] = useState(generateRegressionData());
  const [slope, setSlope] = useState(1);
  const [intercept, setIntercept] = useState(0);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [gameMode, setGameMode] = useState(false);
  const [targetSlope, setTargetSlope] = useState(2);
  const [targetIntercept, setTargetIntercept] = useState(1);
  const [score, setScore] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [showDataEditor, setShowDataEditor] = useState(false);
  const [newPointX, setNewPointX] = useState('');
  const [newPointY, setNewPointY] = useState('');
  const [pointAnimation, setPointAnimation] = useState(null);

  const drawPlot = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const padding = 40;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Scale factors
    const xScale = (width - 2 * padding) / 40;
    const yScale = (height - 2 * padding) / 40;

    // Draw grid
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    for (let i = -20; i <= 20; i += 2) {
      // Vertical lines
      ctx.beginPath();
      ctx.moveTo(padding + (i + 20) * xScale, padding);
      ctx.lineTo(padding + (i + 20) * xScale, height - padding);
      ctx.stroke();
      
      // Horizontal lines
      ctx.beginPath();
      ctx.moveTo(padding, height - (padding + (i + 20) * yScale));
      ctx.lineTo(width - padding, height - (padding + (i + 20) * yScale));
      ctx.stroke();
    }

    // Draw axes
    ctx.beginPath();
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 2;
    ctx.moveTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.stroke();

    // Add axis labels and values
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#374151';

    // X-axis values
    for (let i = -20; i <= 20; i += 4) {
      const x = padding + (i + 20) * xScale;
      const y = height - padding + 20;
      
      // Draw tick mark
      ctx.beginPath();
      ctx.moveTo(x, height - padding - 4);
      ctx.lineTo(x, height - padding + 4);
      ctx.stroke();
      
      // Draw value
      ctx.fillText(i.toString(), x, y);
    }

    // Y-axis values
    ctx.textAlign = 'right';
    for (let i = -20; i <= 20; i += 4) {
      const x = padding - 10;
      const y = height - (padding + (i + 20) * yScale);
      
      // Draw tick mark
      ctx.beginPath();
      ctx.moveTo(padding - 4, y);
      ctx.lineTo(padding + 4, y);
      ctx.stroke();
      
      // Draw value
      ctx.fillText(i.toString(), x, y);
    }

    // Axis labels
    ctx.font = '14px Arial';
    ctx.fillStyle = '#1f2937';
    ctx.textAlign = 'center';
    
    // X-axis label
    ctx.fillText('X', width - padding + 25, height - padding + 5);
    
    // Y-axis label
    ctx.save();
    ctx.translate(padding - 25, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Y', 0, 0);
    ctx.restore();

    // Plot data points with animation for new points
    data.forEach((point, index) => {
      const x = padding + (point.x + 20) * xScale;
      const y = height - (padding + (point.y + 20) * yScale);
      
      ctx.beginPath();
      ctx.fillStyle = '#3b82f6';
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    // Animate new point if exists
    if (pointAnimation) {
      const x = padding + (pointAnimation.x + 20) * xScale;
      const y = height - (padding + (pointAnimation.y + 20) * yScale);
      
      ctx.beginPath();
      ctx.fillStyle = `rgba(59, 130, 246, ${pointAnimation.progress})`;
      ctx.arc(x, y, 4 + (1 - pointAnimation.progress) * 10, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw regression line
    const progress = animationProgress;
    const startX = -20;
    const endX = 20;
    const startY = slope * startX + intercept;
    const endY = slope * endX + intercept;

    ctx.beginPath();
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.moveTo(
      padding + (startX + 20) * xScale,
      height - (padding + (startY + 20) * yScale)
    );
    ctx.lineTo(
      padding + (startX + (endX - startX) * progress + 20) * xScale,
      height - (padding + (startY + (endY - startY) * progress + 20) * yScale)
    );
    ctx.stroke();

    // Draw target line in game mode
    if (gameMode) {
      const targetStartY = targetSlope * startX + targetIntercept;
      const targetEndY = targetSlope * endX + targetIntercept;

      ctx.beginPath();
      ctx.strokeStyle = '#22c55e';
      ctx.setLineDash([5, 5]);
      ctx.moveTo(
        padding + (startX + 20) * xScale,
        height - (padding + (targetStartY + 20) * yScale)
      );
      ctx.lineTo(
        padding + (endX + 20) * xScale,
        height - (padding + (targetEndY + 20) * yScale)
      );
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }, [data, slope, intercept, animationProgress, gameMode, targetSlope, targetIntercept, pointAnimation]);

  useEffect(() => {
    let animationFrame;
    const animate = () => {
      setAnimationProgress(prev => {
        if (prev >= 1) return 1;
        animationFrame = requestAnimationFrame(animate);
        return prev + 0.02;
      });
    };
    animate();
    return () => cancelAnimationFrame(animationFrame);
  }, [data, slope, intercept]);

  useEffect(() => {
    if (pointAnimation) {
      let animationFrame;
      const animate = () => {
        setPointAnimation(prev => {
          if (!prev || prev.progress >= 1) return null;
          animationFrame = requestAnimationFrame(animate);
          return { ...prev, progress: prev.progress + 0.05 };
        });
      };
      animate();
      return () => cancelAnimationFrame(animationFrame);
    }
  }, [pointAnimation]);

  useEffect(() => {
    drawPlot();
  }, [drawPlot]);

  const handleSlopeChange = useCallback((newSlope) => {
    setSlope(newSlope);
    setAnimationProgress(0);
    
    if (gameMode) {
      const rmse = calculateRMSE(data, newSlope, intercept);
      const accuracy = Math.max(0, 100 - (rmse * 10));
      setScore(Math.round(accuracy));
    }
  }, [gameMode, data, intercept]);

  const handleInterceptChange = useCallback((newIntercept ) => {
    setIntercept(newIntercept);
    setAnimationProgress(0);
    
    if (gameMode) {
      const rmse = calculateRMSE(data, slope, newIntercept);
      const accuracy = Math.max(0, 100 - (rmse * 10));
      setScore(Math.round(accuracy));
    }
  }, [gameMode, data, slope]);

  const addDataPoint = () => {
    const x = parseFloat(newPointX);
    const y = parseFloat(newPointY);
    
    if (!isNaN(x) && !isNaN(y)) {
      setData(prev => [...prev, { x, y }]);
      setPointAnimation({ x, y, progress: 0 });
      setNewPointX('');
      setNewPointY('');
      setAnimationProgress(0);
    }
  };

  const removeDataPoint = (index ) => {
    setData(prev => prev.filter((_, i) => i !== index));
    setAnimationProgress(0);
  };

  const loadPresetData = (key) => {
    setData(PRESET_DATASETS[key].data);
    setAnimationProgress(0);
    setSlope(1);
    setIntercept(0);
  };

  const startGame = () => {
    const newData = generateRegressionData(20, 2, targetSlope, targetIntercept);
    setData(newData);
    setGameMode(true);
    setSlope(1);
    setIntercept(0);
    setScore(0);
  };

  const resetGame = () => {
    setGameMode(false);
    setData(generateRegressionData());
    setSlope(1);
    setIntercept(0);
    setScore(0);
    setShowHint(false);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">
            {gameMode ? 'Match the Line Challenge' : 'Explore Linear Regression'}
          </h2>
          <div className="space-x-4">
            {!gameMode && (
              <>
                <button
                  onClick={() => setShowDataEditor(!showDataEditor)}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Database className="w-4 h-4 mr-2" />
                  {showDataEditor ? 'Hide Data Editor' : 'Show Data Editor'}
                </button>
                <button
                  onClick={startGame}
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <Trophy className="w-4 h-4 mr-2" />
                  Start Challenge
                </button>
              </>
            )}
            {gameMode && (
              <button
                onClick={resetGame}
                className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </button>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <canvas
              ref={canvasRef}
              width="500"
              height="500"
              className="w-full bg-gray-50 rounded-lg"
            />
            {gameMode && (
              <div className="text-center">
                <p className="text-xl font-semibold">Score: {score}/100</p>
                {score >= 90 && (
                  <p className="text-green-600 font-medium mt-2">
                    Excellent! You've matched the line perfectly!
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="space-y-6">
            {showDataEditor && !gameMode && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Data Management</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(PRESET_DATASETS).map(([key, dataset]) => (
                    <button
                      key={key}
                      onClick={() => loadPresetData(key)}
                      className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm"
                    >
                      {dataset.name}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">X</label>
                    <input
                      type="number"
                      value={newPointX}
                      onChange={(e) => setNewPointX(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                      placeholder="X value"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Y</label>
                    <input
                      type="number"
                      value={newPointY}
                      onChange={(e) => setNewPointY(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                      placeholder="Y value"
                    />
                  </div>
                  <button
                    onClick={addDataPoint}
                    className="mt-6 inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <div className="max-h-40 overflow-y-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 text-left">X</th>
                        <th className="px-4 py-2 text-left">Y</th>
                        <th className="px-4 py-2"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.map((point, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2">{point.x.toFixed(2)}</td>
                          <td className="px-4 py-2">{point.y.toFixed(2)}</td>
                          <td className="px-4 py-2">
                            <button
                              onClick={() => removeDataPoint(index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Slope: {slope.toFixed(2)}
              </label>
              <input
                type="range"
                min="-5"
                max="5"
                step="0.1"
                value={slope}
                onChange={(e) => handleSlopeChange(parseFloat(e.target.value))}
                className="w-full"
              />
              <p className="text-sm text-gray-500 mt-1">
                Controls how steep the line is
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Intercept: {intercept.toFixed(2)}
              </label>
              <input
                type="range"
                min="-10"
                max="10"
                step="0.1"
                value={intercept}
                onChange={(e) => handleInterceptChange(parseFloat(e.target.value))}
                className="w-full"
              />
              <p className="text-sm text-gray-500 mt-1">
                Controls where the line crosses the y-axis
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Regression Equation
              </h3>
              <p className="font-mono text-lg">
                y = {slope.toFixed(2)}x + {intercept.toFixed(2)}
              </p>
            </div>

            {gameMode && (
              <div className="space-y-4">
                <button
                  onClick={() => setShowHint(!showHint)}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Book className="w-4 h-4 mr-2" />
                  {showHint ? 'Hide Hint' : 'Show Hint'}
                </button>
                
                {showHint && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Hints:</h4>
                    <ul className="list-disc list-inside text-blue-800 space-y-1">
                      <li>Look at the green dashed line - that's your target!</li>
                      <li>Adjust the slope to match the steepness</li>
                      <li>Fine-tune the intercept to match the y-axis crossing point</li>
                      <li>Try to get a score above 90 for a perfect match!</li>
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h3 className="text-xl font-semibold mb-4">Understanding Linear Regression</h3>
        <div className="prose max-w-none">
          <p>
            Linear regression helps us understand the relationship between variables by finding the best-fitting straight line through a set of points.
          </p>
          <ul>
            <li><strong>Slope:</strong> Tells us how much y changes for each unit change in x</li>
            <li><strong>Intercept:</strong> The y-value where the line crosses the y-axis (when x = 0)</li>
            <li><strong>Points:</strong> The blue dots represent our data points</li>
            <li><strong>Line:</strong> The red line shows our current prediction model</li>
          </ul>
          {gameMode && (
            <p className="text-green-700">
              In challenge mode, try to match your line (red) with the target line (green dashed) by adjusting the slope and intercept!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ExploreRegression;
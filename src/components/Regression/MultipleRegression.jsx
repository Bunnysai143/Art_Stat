import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Play, RotateCcw, Trophy, Book, Plus, X, Database, Eye } from 'lucide-react';
import {
  generateMultipleRegressionData,
  calculateMultipleRMSE,
  MULTIPLE_REGRESSION_PRESETS,
  
} from '../../utils/exregData';

function MultipleRegression() {
  const canvasRef = useRef(null);
  const [data, setData] = useState(generateMultipleRegressionData());
  const [coefficients, setCoefficients] = useState({ x1: 1, x2: 1 });
  const [intercept, setIntercept] = useState(0);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [gameMode, setGameMode] = useState(false);
  const [targetCoefficients, setTargetCoefficients] = useState({ x1: 2, x2: 1.5 });
  const [targetIntercept, setTargetIntercept] = useState(1);
  const [score, setScore] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [showDataEditor, setShowDataEditor] = useState(false);
  const [newPoint, setNewPoint] = useState({ x1: '', x2: '', y: '' });
  const [pointAnimation, setPointAnimation] = useState(null);
  const [viewMode, setViewMode] = useState('x1');

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
      
      ctx.beginPath();
      ctx.moveTo(x, height - padding - 4);
      ctx.lineTo(x, height - padding + 4);
      ctx.stroke();
      
      ctx.fillText(i.toString(), x, y);
    }

    // Y-axis values
    ctx.textAlign = 'right';
    for (let i = -20; i <= 20; i += 4) {
      const x = padding - 10;
      const y = height - (padding + (i + 20) * yScale);
      
      ctx.beginPath();
      ctx.moveTo(padding - 4, y);
      ctx.lineTo(padding + 4, y);
      ctx.stroke();
      
      ctx.fillText(i.toString(), x, y);
    }

    // Axis labels
    ctx.font = '14px Arial';
    ctx.fillStyle = '#1f2937';
    ctx.textAlign = 'center';
    
    // X-axis label
    ctx.fillText(viewMode === 'x1' ? 'X₁' : 'X₂', width - padding + 25, height - padding + 5);
    
    // Y-axis label
    ctx.save();
    ctx.translate(padding - 25, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Y', 0, 0);
    ctx.restore();

    // Plot data points
    data.forEach(point => {
      const x = padding + (viewMode === 'x1' ? point.x1 : point.x2 + 20) * xScale;
      const y = height - (padding + (point.y + 20) * yScale);
      
      ctx.beginPath();
      ctx.fillStyle = '#3b82f6';
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    // Animate new point if exists
    if (pointAnimation) {
      const x = padding + (viewMode === 'x1' ? pointAnimation.x1 : pointAnimation.x2 + 20) * xScale;
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
    const coefficient = viewMode === 'x1' ? coefficients.x1 : coefficients.x2;
    const startY = coefficient * startX + intercept;
    const endY = coefficient * endX + intercept;

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
      const targetCoefficient = viewMode === 'x1' ? targetCoefficients.x1 : targetCoefficients.x2;
      const targetStartY = targetCoefficient * startX + targetIntercept;
      const targetEndY = targetCoefficient * endX + targetIntercept;

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
  }, [data, coefficients, intercept, animationProgress, gameMode, targetCoefficients, targetIntercept, viewMode, pointAnimation]);

  useEffect(() => {
    let animationFrame ;
    const animate = () => {
      setAnimationProgress(prev => {
        if (prev >= 1) return 1;
        animationFrame = requestAnimationFrame(animate);
        return prev + 0.02;
      });
    };
    animate();
    return () => cancelAnimationFrame(animationFrame);
  }, [data, coefficients, intercept]);

  useEffect(() => {
    if (pointAnimation) {
      let animationFrame ;
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

  const handleCoefficientChange = useCallback((variable, value ) => {
    setCoefficients(prev => ({ ...prev, [variable]: value }));
    setAnimationProgress(0);
    
    if (gameMode) {
      const rmse = calculateMultipleRMSE(data, { ...coefficients, [variable]: value }, intercept);
      const accuracy = Math.max(0, 100 - (rmse * 10));
      setScore(Math.round(accuracy));
    }
  }, [gameMode, data, coefficients, intercept]);

  const handleInterceptChange = useCallback((value ) => {
    setIntercept(value);
    setAnimationProgress(0);
    
    if (gameMode) {
      const rmse = calculateMultipleRMSE(data, coefficients, value);
      const accuracy = Math.max(0, 100 - (rmse * 10));
      setScore(Math.round(accuracy));
    }
  }, [gameMode, data, coefficients]);

  const addDataPoint = () => {
    const x1 = parseFloat(newPoint.x1);
    const x2 = parseFloat(newPoint.x2);
    const y = parseFloat(newPoint.y);
    
    if (!isNaN(x1) && !isNaN(x2) && !isNaN(y)) {
      setData(prev => [...prev, { x1, x2, y }]);
      setPointAnimation({ x1, x2, y, progress: 0 });
      setNewPoint({ x1: '', x2: '', y: '' });
      setAnimationProgress(0);
    }
  };

  const removeDataPoint = (index ) => {
    setData(prev => prev.filter((_, i) => i !== index));
    setAnimationProgress(0);
  };

  const loadPresetData = (key) => {
    setData(MULTIPLE_REGRESSION_PRESETS[key].data);
    setAnimationProgress(0);
    setCoefficients({ x1: 1, x2: 1 });
    setIntercept(0);
  };

  const startGame = () => {
    const newTargetCoefficients = { x1: 2 + Math.random(), x2: 1.5 + Math.random() };
    const newTargetIntercept = Math.random() * 2 - 1;
    setTargetCoefficients(newTargetCoefficients);
    setTargetIntercept(newTargetIntercept);
    
    const newData = generateMultipleRegressionData(
      20,
      2,
      newTargetCoefficients,
      newTargetIntercept
    );
    setData(newData);
    setGameMode(true);
    setCoefficients({ x1: 1, x2: 1 });
    setIntercept(0);
    setScore(0);
  };

  const resetGame = () => {
    setGameMode(false);
    setData(generateMultipleRegressionData());
    setCoefficients({ x1: 1, x2: 1 });
    setIntercept(0);
    setScore(0);
    setShowHint(false);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">
            {gameMode ? 'Multiple Regression Challenge' : 'Explore Multiple Linear Regression'}
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
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Visualization</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => setViewMode('x1')}
                  className={`px-3 py-1 rounded ${
                    viewMode === 'x1'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Eye className="w-4 h-4 inline mr-1" />
                  X₁ View
                </button>
                <button
                  onClick={() => setViewMode('x2')}
                  className={`px-3 py-1 rounded ${
                    viewMode === 'x2'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Eye className="w-4 h-4 inline mr-1" />
                  X₂ View
                </button>
              </div>
            </div>
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
                    Excellent! You've found the correct coefficients!
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
                  {Object.entries(MULTIPLE_REGRESSION_PRESETS).map(([key, dataset]) => (
                    <button
                      key={key}
                      onClick={() => loadPresetData(key )}
                      className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm"
                    >
                      {dataset.name}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">X₁</label>
                    <input
                      type="number"
                      value={newPoint.x1}
                      onChange={(e) => setNewPoint(prev => ({ ...prev, x1: e.target.value }))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                      placeholder="X₁ value"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">X₂</label>
                    <input
                      type="number"
                      value={newPoint.x2}
                      onChange={(e) => setNewPoint(prev => ({ ...prev, x2: e.target.value }))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                      placeholder="X₂ value"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Y</label>
                    <input
                      type="number"
                      value={newPoint.y}
                      onChange={(e) => setNewPoint(prev => ({ ...prev, y: e.target.value }))}
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
                        <th className="px-4 py-2 text-left">X₁</th>
                        <th className="px-4 py-2 text-left">X₂</th>
                        <th className="px-4 py-2 text-left">Y</th>
                        <th className="px-4 py-2"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.map((point, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2">{point.x1.toFixed(2)}</td>
                          <td className="px-4 py-2">{point.x2.toFixed(2)}</td>
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
                X₁ Coefficient: {coefficients.x1.toFixed(2)}
              </label>
              <input
                type="range"
                min="-5"
                max="5"
                step="0.1"
                value={coefficients.x1}
                onChange={(e) => handleCoefficientChange('x1', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                X₂ Coefficient: {coefficients.x2.toFixed(2)}
              </label>
              <input
                type="range"
                min="-5"
                max="5"
                step="0.1"
                value={coefficients.x2}
                onChange={(e) => handleCoefficientChange('x2', parseFloat(e.target.value))}
                className="w-full"
              />
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
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Multiple Regression Equation
              </h3>
              <p className="font-mono text-lg">
                y = {coefficients.x1.toFixed(2)}x₁ + {coefficients.x2.toFixed(2)}x₂ + {intercept.toFixed(2)}
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
                      <li>Look at the green dashed line in each view</li>
                      <li>Adjust X₁ and X₂ coefficients to match both views</li>
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
        <h3 className="text-xl font-semibold mb-4">Understanding Multiple Linear Regression</h3>
        <div className="prose max-w-none">
          <p>
            Multiple linear regression extends simple linear regression by considering multiple independent variables (X₁, X₂) to predict a dependent variable (Y).
          </p>
          <ul>
            <li><strong>Coefficients:</strong> Each X variable has its own coefficient, showing its individual effect on Y</li>
            <li><strong>Intercept:</strong> The Y value when all X variables are zero</li>
            <li><strong>Visualization:</strong> Switch between X₁ and X₂ views to understand each variable's relationship with Y</li>
            <li><strong>Data Points:</strong> Each point represents an observation with values for X₁, X₂, and Y</li>
          </ul>
          {gameMode && (
            <p className="text-green-700">
              In challenge mode, try to find the correct coefficients and intercept that generated the data by matching your prediction line (red) with the target line (green dashed) in both views!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default MultipleRegression;
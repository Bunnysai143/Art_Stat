import  React,{ useState, useEffect, useCallback } from 'react';
import {  Plus, Trash2, Info } from 'lucide-react';




const dummyDatasets = {
  linear: [
    {
      name: "Dataset A",
      color: "#4F46E5",
      data: Array.from({ length: 100 }, (_, i) => ({
        x: 10 + Math.random() * 20,
        y: 30 + 0.5 * i + Math.random() * 8,
        label: `Point ${i + 1}`
      }))
    }
  ],
  logistic: [
    {
      name: "Success Rate",
      color: "#06B6D4",
      data: Array.from({ length: 150 }, (_, i) => {
        const x = 1 + (i / 20);
        const noise = Math.random() * 0.1 - 0.05;
        return {
          x,
          y: 1 / (1 + Math.exp(-(-4 + 2 * x))) + noise,
          label: `Success Point ${i + 1}`
        };
      })
    }
  ],
  multilinear: [
    {
      name: "Class A",
      color: "#8B5CF6",
      data: Array.from({ length: 80 }, (_, i) => ({
        x: 10 + Math.random() * 15,
        y: 20 + 0.4 * i + Math.random() * 5,
        z: 5 + Math.random() * 10,
        label: `Class A Point ${i + 1}`
      }))
    },
    {
      name: "Class B",
      color: "#EC4899",
      data: Array.from({ length: 80 }, (_, i) => ({
        x: 15 + Math.random() * 15,
        y: 35 + 0.35 * i + Math.random() * 4,
        z: 8 + Math.random() * 10,
        label: `Class B Point ${i + 1}`
      }))
    }
  ]
};


function Regression() {
  const [regressionType, setRegressionType] = useState('linear');
  const [showConfidenceInterval, setShowConfidenceInterval] = useState(true);
  const [showTrendLine, setShowTrendLine] = useState(true);
  const [showMeanPrediction, setShowMeanPrediction] = useState(true);
  const [results, setResults] = useState(new Map());
  const [animationProgress, setAnimationProgress] = useState(0);
  const [editingDataset, setEditingDataset] = useState(null);
  const [datasets, setDatasets] = useState(dummyDatasets);
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, content: '' });

  const calculateRegression = useCallback((data, type) => {
    if (type === 'logistic') {
      const sigmoid = (x) => 1 / (1 + Math.exp(-x));
      const slope = 2;
      const intercept = -4;
      const predicted = data.map(point => sigmoid(slope * point.x + intercept));
      const actual = data.map(point => point.y);
      
      const meanPrediction = predicted.reduce((sum, val) => sum + val, 0) / predicted.length;
      const nullLogLikelihood = actual.reduce((sum, y) => 
        sum + y * Math.log(y) + (1 - y) * Math.log(1 - y), 0);
      const modelLogLikelihood = actual.reduce((sum, y, i) => 
        sum + y * Math.log(predicted[i]) + (1 - y) * Math.log(1 - predicted[i]), 0);
      const r2 = 1 - modelLogLikelihood / nullLogLikelihood;

      return {
        slope,
        intercept,
        r2,
        standardError: Math.sqrt(1 - r2),
        confidenceInterval: { lower: -4.5, upper: -3.5 },
        equation: `P(Y) = 1 / (1 + e^(${slope.toFixed(2)}x + ${intercept.toFixed(2)}))`,
        meanPrediction
      };
    } else if (type === 'multilinear') {
      const n = data.length;
      let sumX = 0, sumY = 0, sumZ = 0, sumXY = 0;
      
      data.forEach(point => {
        sumX += point.x;
        sumY += point.y;
        sumZ += point.z || 0;
        sumXY += point.x * point.y;
      });

      const slope = (n * sumXY - sumX * sumY) / (n * sumX * sumX - sumX * sumX);
      const zCoef = 0.3;
      const intercept = (sumY - slope * sumX - zCoef * sumZ) / n;
      
      const yMean = sumY / n;
      const predicted = data.map(point => slope * point.x + zCoef * (point.z || 0) + intercept);
      const meanPrediction = predicted.reduce((sum, val) => sum + val, 0) / n;
      
      const ssTotal = data.reduce((sum, point) => sum + Math.pow(point.y - yMean, 2), 0);
      const ssResidual = data.reduce((sum, point, i) => sum + Math.pow(point.y - predicted[i], 2), 0);
      const r2 = 1 - (ssResidual / ssTotal);

      return {
        slope,
        intercept,
        r2,
        standardError: Math.sqrt(ssResidual / (n - 3)),
        confidenceInterval: { 
          lower: intercept - 1.96 * Math.sqrt(ssResidual / (n - 3)), 
          upper: intercept + 1.96 * Math.sqrt(ssResidual / (n - 3))
        },
        equation: `y = ${slope.toFixed(2)}x + ${zCoef.toFixed(2)}z + ${intercept.toFixed(2)}`,
        meanPrediction
      };
    } else {
      const n = data.length;
      let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
      
      data.forEach(point => {
        sumX += point.x;
        sumY += point.y;
        sumXY += point.x * point.y;
        sumXX += point.x * point.x;
      });

      const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
      const intercept = (sumY - slope * sumX) / n;
      
      const predicted = data.map(point => slope * point.x + intercept);
      const meanPrediction = predicted.reduce((sum, val) => sum + val, 0) / n;
      
      const yMean = sumY / n;
      const ssTotal = data.reduce((sum, point) => sum + Math.pow(point.y - yMean, 2), 0);
      const ssResidual = data.reduce((sum, point) => {
        const yPredicted = slope * point.x + intercept;
        return sum + Math.pow(point.y - yPredicted, 2);
      }, 0);
      const r2 = 1 - (ssResidual / ssTotal);

      const standardError = Math.sqrt(ssResidual / (n - 2));
      const confidenceInterval = {
        lower: intercept - 1.96 * standardError,
        upper: intercept + 1.96 * standardError
      };

      return {
        slope,
        intercept,
        r2,
        standardError,
        confidenceInterval,
        equation: `y = ${slope.toFixed(2)}x + ${intercept.toFixed(2)}`,
        meanPrediction
      };
    }
  }, []);

  useEffect(() => {
    const newResults = new Map();
    const currentDatasets = datasets[regressionType] || [];
    currentDatasets.forEach(dataset => {
      newResults.set(dataset.name, calculateRegression(dataset.data, regressionType));
    });
    setResults(newResults);
    setAnimationProgress(0);
  }, [regressionType, calculateRegression, datasets]);

  useEffect(() => {
    let animationFrame;
    const animate = () => {
      setAnimationProgress(prev => {
        if (prev >= 1) return 1;
        return prev + 0.03;
      });
      if (animationProgress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };
    animate();
    return () => cancelAnimationFrame(animationFrame);
  }, [regressionType]);

  useEffect(() => {
    const canvas = document.getElementById('regressionPlot');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#f8fafc');
    gradient.addColorStop(1, '#f1f5f9');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const currentDatasets = datasets[regressionType] || [];
    
    const padding = 60;
    const maxX = Math.max(...currentDatasets.flatMap(d => d.data.map(p => p.x)));
    const maxY = Math.max(...currentDatasets.flatMap(d => d.data.map(p => p.y)));
    const scaleX = (canvas.width - 2 * padding) / maxX;
    const scaleY = (canvas.height - 2 * padding) / maxY;

    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 10; i++) {
      if (i / 10 <= animationProgress) {
        const x = padding + (i / 10) * (canvas.width - 2 * padding);
        const y = canvas.height - padding - (i / 10) * (canvas.height - 2 * padding);
        
        ctx.beginPath();
        ctx.moveTo(x, padding);
        ctx.lineTo(x, canvas.height - padding);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(canvas.width - padding, y);
        ctx.stroke();
        
        ctx.fillStyle = '#64748b';
        ctx.font = '12px Inter';
        ctx.fillText(Math.round(i * maxX / 10).toString(), x - 15, canvas.height - padding + 20);
        ctx.fillText(Math.round(i * maxY / 10).toString(), padding - 40, y + 5);
      }
    }

    if (animationProgress > 0) {
      ctx.beginPath();
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.moveTo(padding, canvas.height - padding);
      ctx.lineTo(padding + (canvas.width - 2 * padding) * animationProgress, canvas.height - padding);
      ctx.moveTo(padding, canvas.height - padding);
      ctx.lineTo(padding, canvas.height - padding - (canvas.height - 2 * padding) * animationProgress);
      ctx.stroke();
    }

    currentDatasets.forEach(dataset => {
      const result = results.get(dataset.name);
      if (!result) return;

      dataset.data.forEach((point, index) => {
        if (index / dataset.data.length <= animationProgress) {
          ctx.beginPath();
          
          const isHovered = hoveredPoint && 
            hoveredPoint.datasetName === dataset.name && 
            hoveredPoint.index === index;

          const baseRadius = point.z ? 4 + (point.z / 10) : 4;
          const radius = isHovered ? baseRadius * 1.5 : baseRadius;

          const pointX = point.x * scaleX + padding;
          const pointY = canvas.height - (point.y * scaleY + padding);

          if (isHovered) {
            ctx.shadowColor = dataset.color;
            ctx.shadowBlur = 15;
          }

          ctx.fillStyle = isHovered ? dataset.color : dataset.color + '80';
          ctx.arc(pointX, pointY, radius, 0, 2 * Math.PI);
          ctx.fill();

          ctx.shadowBlur = 0;

          point._rendered = { x: pointX, y: pointY, radius: baseRadius };
        }
      });

      if (showTrendLine && animationProgress > 0.3) {
        ctx.beginPath();
        ctx.strokeStyle = dataset.color;
        ctx.lineWidth = 2;
        
        const progress = (animationProgress - 0.3) * 1.4; // Adjust for delayed start
        
        if (regressionType === 'logistic') {
          for (let x = 0; x <= maxX * progress; x += maxX / 100) {
            const sigmoid = (t) => 1 / (1 + Math.exp(-(result.slope * t + result.intercept)));
            const y = sigmoid(x);
            const px = x * scaleX + padding;
            const py = canvas.height - (y * scaleY + padding);
            
            if (x === 0) {
              ctx.moveTo(px, py);
            } else {
              ctx.lineTo(px, py);
            }
          }
        } else {
          const x1 = padding;
          const y1 = canvas.height - (result.intercept * scaleY + padding);
          const x2 = padding + (canvas.width - 2 * padding) * progress;
          const y2 = canvas.height - ((result.slope * maxX * progress + result.intercept) * scaleY + padding);
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
        }
        ctx.stroke();
        if (showConfidenceInterval) {
          ctx.fillStyle = dataset.color + '20';
          ctx.beginPath();
          if (regressionType === 'logistic') {
            // Draw confidence band for logistic regression
            const points = [];
            for (let x = 0; x <= maxX; x += maxX / 50) {
              const sigmoid = (t) => 1 / (1 + Math.exp(-(result.slope * t + t)));
              const y1 = sigmoid(x + result.confidenceInterval.lower);
              const y2 = sigmoid(x + result.confidenceInterval.upper);
              points.push([x, y1], [x, y2]);
            }
            
            ctx.moveTo(points[0][0] * scaleX + padding, canvas.height - (points[0][1] * scaleY + padding));
            points.forEach(([x, y]) => {
              ctx.lineTo(x * scaleX + padding, canvas.height - (y * scaleY + padding));
            });
          } else {
            ctx.moveTo(padding, canvas.height - (result.confidenceInterval.lower * scaleY + padding));
            ctx.lineTo(canvas.width - padding, canvas.height - ((result.slope * maxX + result.confidenceInterval.lower) * scaleY + padding));
            ctx.lineTo(canvas.width - padding, canvas.height - ((result.slope * maxX + result.confidenceInterval.upper) * scaleY + padding));
            ctx.lineTo(padding, canvas.height - (result.confidenceInterval.upper * scaleY + padding));
          }
          ctx.closePath();
          ctx.fill();
        }
    
        if (showMeanPrediction && result.meanPrediction) {
          ctx.setLineDash([5, 5]);
          ctx.beginPath();
          ctx.strokeStyle = dataset.color + '80';
          ctx.moveTo(padding, canvas.height - (result.meanPrediction * scaleY + padding));
          ctx.lineTo(canvas.width - padding, canvas.height - (result.meanPrediction * scaleY + padding));
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }
    });
    }, [regressionType, results, animationProgress, showConfidenceInterval, showTrendLine, showMeanPrediction, datasets]);

  const handleCanvasHover = useCallback((event) => {
    const canvas = document.getElementById('regressionPlot');
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    let found = false;
    const currentDatasets = datasets[regressionType] || [];

    for (const dataset of currentDatasets) {
      for (let i = 0; i < dataset.data.length; i++) {
        const point = dataset.data[i];
        if (point._rendered) {
          const dx = x - point._rendered.x;
          const dy = y - point._rendered.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance <= point._rendered.radius * 2) {
            setHoveredPoint({ datasetName: dataset.name, index: i });
            setTooltip({
              visible: true,
              x: event.clientX,
              y: event.clientY,
              content: `${point.label}\nX: ${point.x.toFixed(2)}\nY: ${point.y.toFixed(2)}${point.z ? `\nZ: ${point.z.toFixed(2)}` : ''}`
            });
            found = true;
            break;
          }
        }
      }
      if (found) break;
    }

    if (!found) {
      setHoveredPoint(null);
      setTooltip({ visible: false, x: 0, y: 0, content: '' });
    }
  }, [datasets, regressionType]);
  const handleAddDataPoint = (datasetName) => {
    setDatasets(prev => {
      const newDatasets = { ...prev };
      const dataset = newDatasets[regressionType]?.find(d => d.name === datasetName);
      if (dataset) {
        const lastPoint = dataset.data[dataset.data.length - 1];
        const newPoint = {
          x: lastPoint.x + Math.random() * 2,
          y: lastPoint.y + Math.random() * 2,
          ...(regressionType === 'multilinear' ? { z: (lastPoint.z || 0) + Math.random() * 2 } : {})
        };
        dataset.data.push(newPoint);
      }
      return newDatasets;
    });
  };

  const handleRemoveDataPoint = (datasetName, index) => {
    setDatasets(prev => {
      const newDatasets = { ...prev };
      const dataset = newDatasets[regressionType]?.find(d => d.name === datasetName);
      if (dataset) {
        dataset.data.splice(index, 1);
      }
      return newDatasets;
    });
  };

  const handleUpdateDataPoint = (datasetName, index, field, value) => {
    setDatasets(prev => {
      const newDatasets = { ...prev };
      const dataset = newDatasets[regressionType]?.find(d => d.name === datasetName);
      if (dataset) {
        dataset.data[index] = { ...dataset.data[index], [field]: value };
      }
      return newDatasets;
    });
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex items-center">
          <button className="mr-4 hover:bg-slate-100 p-2 rounded-full transition-colors">
          
          </button>
          <h1 className="text-2xl font-bold text-indigo-600 ">
            {regressionType === 'linear' ? 'Linear' : 
             regressionType === 'logistic' ? 'Logistic' : 'Multilinear'} Regression
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-9">
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <canvas 
                id="regressionPlot" 
                width="800" 
                height="500" 
                className="w-full rounded-lg cursor-crosshair"
                onMouseMove={handleCanvasHover}
                onMouseLeave={() => {
                  setHoveredPoint(null);
                  setTooltip({ visible: false, x: 0, y: 0, content: '' });
                }}
              />
            </div>
          </div>

          <div className="col-span-3 space-y-6">
            <div className=" rounded-lg p-6 shadow-lg">
              <h2 className="text-lg font-semibold mb-4">Controls</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Regression Type
                  </label>
                  <select
                    value={regressionType}
                    onChange={(e) => setRegressionType(e.target.value)}
                    className="w-full bg-slate-300 border border-gray-700 rounded-md px-3 py-2 text-sm"
                  >
                    <option value="linear">Linear</option>
                    <option value="logistic">Logistic</option>
                    <option value="multilinear">Multilinear</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={showConfidenceInterval}
                      onChange={(e) => setShowConfidenceInterval(e.target.checked)}
                      className="rounded bg-[#2a2a2a] border-gray-700 text-blue-500"
                    />
                    <span className="text-sm">Show Confidence Interval</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={showTrendLine}
                      onChange={(e) => setShowTrendLine(e.target.checked)}
                      className="rounded bg-[#2a2a2a] border-gray-700 text-blue-500"
                    />
                    <span className="text-sm">Show Trend Line</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={showMeanPrediction}
                      onChange={(e) => setShowMeanPrediction(e.target.checked)}
                      className="rounded bg-[#2a2a2a] border-gray-700 text-blue-500"
                    />
                    <span className="text-sm">Show Mean Prediction</span>
                  </label>
                </div>
              </div>
            </div>

            <div className=" rounded-lg p-6 shadow-lg">
              <h2 className="text-lg font-semibold mb-4">Results</h2>
              <div className="space-y-6">
                {Array.from(results.entries()).map(([datasetName, result]) => {
                  const dataset = datasets[regressionType]?.find(d => d.name === datasetName);
                  if (!dataset) return null;
                  return (
                    <div key={datasetName} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: dataset.color }}
                          />
                          <h3 className="font-medium">{datasetName}</h3>
                        </div>
                        <button
                          onClick={() => setEditingDataset(editingDataset === datasetName ? null : datasetName)}
                          className="text-sm text-gray-800 hover:text-gray-500"
                        >
                          {editingDataset === datasetName ? 'Close' : 'Edit Data'}
                        </button>
                      </div>
                      <div className="text-sm bg-slate-200 p-3 rounded-md">
                        <p className="text-gray-800">Equation</p>
                        <p className="font-mono">{result.equation}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="bg-slate-200 p-3 rounded-md">
                          <p className="text-gray-800">R²</p>
                          <p className="font-mono">{result.r2.toFixed(4)}</p>
                        </div>
                        <div className="bg-slate-200 p-3 rounded-md">
                          <p className="text-gray-800">Std. Error</p>
                          <p className="font-mono">{result.standardError.toFixed(4)}</p>
                        </div>
                      </div>
                      {editingDataset === datasetName && (
                        <div className="mt-4">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="text-sm font-medium">Data Points</h4>
                            <button
                              onClick={() => handleAddDataPoint(datasetName)}
                              className="flex items-center space-x-1 text-sm text-blue-400 hover:text-blue-300"
                            >
                              <Plus className="w-4 h-4" />
                              <span>Add Point</span>
                            </button>
                          </div>
                          <div className="max-h-60 overflow-y-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="text-gray-400">
                                  <th className="text-left py-2">X</th>
                                  <th className="text-left py-2">Y</th>
                                  {regressionType === 'multilinear' && (
                                    <th className="text-left py-2">Z</th>
                                  )}
                                  <th className="text-left py-2"></th>
                                </tr>
                              </thead>
                              <tbody>
                                {dataset.data.map((point, index) => (
                                  <tr key={index} className="border-t border-gray-800">
                                    <td className="py-2">
                                      <input
                                        type="number"
                                        value={point.x}
                                        onChange={(e) => handleUpdateDataPoint(
                                          datasetName,
                                          index,
                                          'x',
                                          parseFloat(e.target.value)
                                        )}
                                        className="w-20 bg-slate-300 border border-gray-700 rounded px-2 py-1"
                                      />
                                    </td>
                                    <td className="py-2">
                                      <input
                                        type="number"
                                        value={point.y}
                                        onChange={(e) => handleUpdateDataPoint(
                                          datasetName,
                                          index,
                                          'y',
                                          parseFloat(e.target.value)
                                        )}
                                        className="w-20 bg-slate-300 border border-gray-700 rounded px-2 py-1"
                                      />
                                    </td>
                                    {regressionType === 'multilinear' && (
                                      <td className="py-2">
                                        <input
                                          type="number"
                                          value={point.z}
                                          onChange={(e) => handleUpdateDataPoint(
                                            datasetName,
                                            index,
                                            'z',
                                            parseFloat(e.target.value)
                                          )}
                                          className="w-20 bg-[#2a2a2a] border border-gray-700 rounded px-2 py-1"
                                        />
                                      </td>
                                    )}
                                    <td className="py-2">
                                      <button
                                        onClick={() => handleRemoveDataPoint(datasetName, index)}
                                        className="text-red-400 hover:text-red-300"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>
      {tooltip.visible && (
        <div 
          className="fixed z-50 bg-white px-4 py-2 rounded-lg shadow-lg text-sm pointer-events-none transform -translate-x-1/2 -translate-y-full"
          style={{
            left: tooltip.x,
            top: tooltip.y - 10,
          }}
        >
          {tooltip.content.split('\n').map((line, i) => (
            <div key={i} className="whitespace-nowrap">{line}</div>
          ))}
        </div>
      )}
    </div>
  );
}



export default Regression;
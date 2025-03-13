import React, { useState, useEffect, useMemo } from 'react';
import { TrendingDown, Play, Pause, RotateCcw, Info } from 'lucide-react';

const GradientDescent = ({ data }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [learningRate, setLearningRate] = useState(0.1);
  const [iteration, setIteration] = useState(0);
  const [w1, setW1] = useState(0);
  const [w2, setW2] = useState(0);
  const [bias, setBias] = useState(0);
  const [costHistory, setCostHistory] = useState([]);
  const maxIterations = 100;

  // Sigmoid function
  const sigmoid = (z) => 1 / (1 + Math.exp(-z));

  // Calculate cost and gradients
  const calculateGradients = () => {
    const m = data.points.length;
    let dw1 = 0, dw2 = 0, db = 0, cost = 0;

    data.points.forEach(point => {
      const z = w1 * point.x + w2 * point.y + bias;
      const a = sigmoid(z);
      const error = a - point.class;
      
      dw1 += error * point.x;
      dw2 += error * point.y;
      db += error;
      
      // Binary cross-entropy loss
      cost -= (point.class * Math.log(a) + (1 - point.class) * Math.log(1 - a));
    });

    cost /= m;
    dw1 /= m;
    dw2 /= m;
    db /= m;

    return { dw1, dw2, db, cost };
  };

  // Update parameters using gradient descent
  const updateParameters = () => {
    const { dw1, dw2, db, cost } = calculateGradients();
    
    setW1(prev => prev - learningRate * dw1);
    setW2(prev => prev - learningRate * dw2);
    setBias(prev => prev - learningRate * db);
    setCostHistory(prev => [...prev, cost]);
    setIteration(prev => prev + 1);

    if (iteration >= maxIterations) {
      setIsRunning(false);
    }
  };

  // Animation loop
  useEffect(() => {
    let animationFrame;
    
    if (isRunning) {
      animationFrame = requestAnimationFrame(updateParameters);
    }

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isRunning, w1, w2, bias, iteration]);

  // Calculate current predictions
  const predictions = useMemo(() => {
    return data.points.map(point => {
      const z = w1 * point.x + w2 * point.y + bias;
      return {
        ...point,
        prediction: sigmoid(z)
      };
    });
  }, [w1, w2, bias, data]);

  // Calculate accuracy
  const accuracy = useMemo(() => {
    return (predictions.reduce((acc, point) => {
      const predicted = point.prediction >= 0.5 ? 1 : 0;
      return acc + (predicted === point.class ? 1 : 0);
    }, 0) / predictions.length * 100).toFixed(1);
  }, [predictions]);

  const resetOptimization = () => {
    setIsRunning(false);
    setW1(0);
    setW2(0);
    setBias(0);
    setIteration(0);
    setCostHistory([]);
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl p-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-emerald-100 p-3 rounded-xl">
          <TrendingDown className="w-6 h-6 text-emerald-600" />
        </div>
        <h3 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 text-transparent bg-clip-text">
          Gradient Descent Explorer
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-6">
          {/* Controls */}
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Learning Rate: {learningRate}
              </label>
              <input
                type="range"
                min="0.01"
                max="0.5"
                step="0.01"
                value={learningRate}
                onChange={(e) => setLearningRate(parseFloat(e.target.value))}
                className="w-full h-2 bg-emerald-200 rounded-lg appearance-none cursor-pointer"
                disabled={isRunning}
              />
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setIsRunning(!isRunning)}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-2 px-4 rounded-lg font-medium hover:from-emerald-700 hover:to-teal-700 transition-colors"
              >
                {isRunning ? (
                  <>
                    <Pause className="w-4 h-4" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Start
                  </>
                )}
              </button>
              
              <button
                onClick={resetOptimization}
                className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                disabled={isRunning}
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
            </div>
          </div>

          {/* Parameters */}
          <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
            <h4 className="font-medium text-gray-700">Current Parameters</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-500">Weight 1 (w₁)</div>
                <div className="text-lg font-semibold text-emerald-600">{w1.toFixed(4)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Weight 2 (w₂)</div>
                <div className="text-lg font-semibold text-emerald-600">{w2.toFixed(4)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Bias</div>
                <div className="text-lg font-semibold text-emerald-600">{bias.toFixed(4)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Accuracy</div>
                <div className="text-lg font-semibold text-emerald-600">{accuracy}%</div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Cost History Plot */}
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h4 className="font-medium text-gray-700 mb-4">Cost History</h4>
            <div className="h-30 flex items-end gap-1">
              {costHistory.map((cost, i) => {
                const height = Math.min(100 - (cost * 20), 100);
                return (
                  <div
                    key={i}
                    className="flex-1 bg-gradient-to-t from-emerald-500 to-teal-500 rounded-t transition-all duration-300"
                    style={{
                      height: `${height}%`,
                      opacity: 0.7 + (i / costHistory.length) * 0.3
                    }}
                  >
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 opacity-0 group-hover:opacity-100">
                      <div className="text-xs text-gray-500">{cost.toFixed(4)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Decision Boundary Visualization */}
          <div className="bg-white rounded-xl  shadow-sm aspect-square relative overflow-hidden">
            <div className="absolute inset-0">
              {/* Grid */}
              <div className="absolute inset-0 grid grid-cols-4 grid-rows-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <React.Fragment key={i}>
                    <div className="absolute left-0 right-0 border-t border-gray-100" style={{ top: `${i * 25}%` }} />
                    <div className="absolute top-0 bottom-0 border-l border-gray-100" style={{ left: `${i * 25}%` }} />
                  </React.Fragment>
                ))}
              </div>

              {/* Points */}
              {predictions.map((point, i) => {
                const x = ((point.x + 2) / 4) * 100;
                const y = ((point.y + 2) / 4) * 100;
                
                return (
                  <div
                    key={i}
                    className={`absolute w-3 h-3 rounded-full transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
                      point.class === 1 ? 'bg-blue-500' : 'bg-red-500'
                    }`}
                    style={{
                      left: `${x}%`,
                      top: `${y}%`,
                      opacity: Math.abs(point.prediction - 0.5) * 2,
                    }}
                  >
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 pointer-events-none">
                      <div className="bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                        ({point.x.toFixed(2)}, {point.y.toFixed(2)})
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Decision boundary */}
              <div
                className="absolute border-2 border-emerald-500 border-dashed transition-all duration-300"
                style={{
                  left: '50%',
                  top: '50%',
                  width: '141.4%',
                  height: '2px',
                  transform: `translate(-50%, -50%) rotate(${Math.atan2(w2, w1) * (180 / Math.PI)}deg) translateY(${bias * 20}px)`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
          <div className="space-y-2 text-sm text-gray-600">
            <p>
              This visualization demonstrates how gradient descent optimizes the model parameters:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Adjust the learning rate to control the optimization speed</li>
              <li>Watch the decision boundary update in real-time</li>
              <li>Monitor the cost history to see convergence</li>
              <li>Points fade based on the model's confidence in their classification</li>
            </ul>
            <p>
              The algorithm iteratively updates the parameters to minimize the cost function,
              gradually improving the model's ability to separate the two classes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GradientDescent;
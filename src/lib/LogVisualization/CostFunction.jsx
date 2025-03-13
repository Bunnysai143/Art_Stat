import React, { useState, useMemo } from 'react';
import { TrendingUp, MinusCircle, PlusCircle, RefreshCw, Info } from 'lucide-react';

const CostFunction = ({ data }) => {
  const [w1Range, setW1Range] = useState(0);
  const [w2Range, setW2Range] = useState(0);
  const [biasRange, setBiasRange] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Convert slider values to actual parameter values
  const w1 = w1Range * 0.1;
  const w2 = w2Range * 0.1;
  const bias = biasRange * 0.1;

  const { cost, accuracy, predictions } = useMemo(() => {
    // Sigmoid function
    const sigmoid = (z) => 1 / (1 + Math.exp(-z));

    // Calculate predictions and cost
    const predictions = data.points.map(point => {
      const z = w1 * point.x + w2 * point.y + bias;
      return {
        ...point,
        prediction: sigmoid(z)
      };
    });

    // Binary cross-entropy loss
    const cost = predictions.reduce((acc, point) => {
      const y = point.class;
      const yHat = point.prediction;
      return acc - (y * Math.log(yHat) + (1 - y) * Math.log(1 - yHat));
    }, 0) / predictions.length;

    // Calculate accuracy
    const accuracy = predictions.reduce((acc, point) => {
      const predicted = point.prediction >= 0.5 ? 1 : 0;
      return acc + (predicted === point.class ? 1 : 0);
    }, 0) / predictions.length * 100;

    return { cost, accuracy, predictions };
  }, [data, w1, w2, bias]);

  const startAnimation = () => {
    setIsAnimating(true);
    let step = 0;
    const animate = () => {
      if (step < 100) {
        const progress = step / 100;
        setW1Range(Math.sin(progress * Math.PI * 2) * 10);
        setW2Range(Math.cos(progress * Math.PI * 2) * 10);
        setBiasRange(Math.sin(progress * Math.PI) * 5);
        step++;
        requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
        setW1Range(0);
        setW2Range(0);
        setBiasRange(0);
      }
    };
    animate();
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl p-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-purple-100 p-3 rounded-xl">
          <TrendingUp className="w-6 h-6 text-purple-600" />
        </div>
        <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-transparent bg-clip-text">
          Cost Function Explorer
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-6">
          {/* Parameter Controls */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <label className="block text-sm font-medium text-gray-700 mb-2">Weight 1 (w₁)</label>
              <div className="flex items-center gap-3">
                <MinusCircle className="w-4 h-4 text-gray-400" />
                <input
                  type="range"
                  min="-20"
                  max="20"
                  value={w1Range}
                  onChange={(e) => setW1Range(parseFloat(e.target.value))}
                  className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer"
                  disabled={isAnimating}
                />
                <PlusCircle className="w-4 h-4 text-gray-400" />
              </div>
              <span className="text-sm text-gray-500 mt-1 block">{w1.toFixed(2)}</span>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm">
              <label className="block text-sm font-medium text-gray-700 mb-2">Weight 2 (w₂)</label>
              <div className="flex items-center gap-3">
                <MinusCircle className="w-4 h-4 text-gray-400" />
                <input
                  type="range"
                  min="-20"
                  max="20"
                  value={w2Range}
                  onChange={(e) => setW2Range(parseFloat(e.target.value))}
                  className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer"
                  disabled={isAnimating}
                />
                <PlusCircle className="w-4 h-4 text-gray-400" />
              </div>
              <span className="text-sm text-gray-500 mt-1 block">{w2.toFixed(2)}</span>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm">
              <label className="block text-sm font-medium text-gray-700 mb-2">Bias</label>
              <div className="flex items-center gap-3">
                <MinusCircle className="w-4 h-4 text-gray-400" />
                <input
                  type="range"
                  min="-20"
                  max="20"
                  value={biasRange}
                  onChange={(e) => setBiasRange(parseFloat(e.target.value))}
                  className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer"
                  disabled={isAnimating}
                />
                <PlusCircle className="w-4 h-4 text-gray-400" />
              </div>
              <span className="text-sm text-gray-500 mt-1 block">{bias.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={startAnimation}
            disabled={isAnimating}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-4 rounded-xl font-medium shadow-lg shadow-purple-200 hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${isAnimating ? 'animate-spin' : ''}`} />
            Animate Parameters
          </button>
        </div>

        <div className="space-y-6">
          {/* Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <h4 className="text-sm font-medium text-gray-500 mb-2">Cost</h4>
              <div className="text-2xl font-bold text-purple-600">{cost.toFixed(4)}</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <h4 className="text-sm font-medium text-gray-500 mb-2">Accuracy</h4>
              <div className="text-2xl font-bold text-indigo-600">{accuracy.toFixed(1)}%</div>
            </div>
          </div>

          {/* Decision Boundary Visualization */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 aspect-square relative overflow-hidden">
            <div className="absolute inset-0">
              {/* Grid lines */}
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
                // Scale points to fit within visualization
                const x = ((point.x + 2) / 4) * 100; // Map [-2,2] to [0,100]
                const y = ((point.y + 2) / 4) * 100; // Map [-2,2] to [0,100]
                
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
                    {/* Hover tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 pointer-events-none">
                      <div className="bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                        ({point.x.toFixed(2)}, {point.y.toFixed(2)})
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Decision boundary line */}
              <div
                className="absolute border-2 border-purple-500 border-dashed transition-all duration-300"
                style={{
                  left: '50%',
                  top: '50%',
                  width: '141.4%', // √2 * 100% to ensure line reaches corners
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
          <Info className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
          <div className="space-y-2 text-sm text-gray-600">
            <p>
              This visualization helps you understand how the model's parameters affect its performance:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Adjust the sliders to modify the weights and bias</li>
              <li>Watch how the decision boundary changes in real-time</li>
              <li>Monitor the cost and accuracy metrics</li>
              <li>Click "Animate Parameters" to see how different combinations affect the model</li>
            </ul>
            <p>
              The goal is to find parameters that minimize the cost function while maximizing accuracy.
              Points fade based on the model's confidence in their classification.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CostFunction;
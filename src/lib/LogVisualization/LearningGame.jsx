import React, { useState, useEffect } from 'react';
import { Brain, RefreshCw, Info } from 'lucide-react';

const LearningGame = ({ data }) => {
  const [points, setPoints] = useState(Array.isArray(data) ? data : []);

  const [angle, setAngle] = useState(0);
  const [bias, setBias] = useState(0);
  const [gameMode, setGameMode] = useState('place'); // 'place' or 'classify'
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [showTutorial, setShowTutorial] = useState(true);
  // Calculate accuracy
  const calculateAccuracy = () => {
    if (!Array.isArray(points) || points.length === 0) return 0;
  
    const correct = points.filter(point => {
      const predictedClass = isPointAboveLine(point.x, point.y) ? 1 : 0;
      return predictedClass === point.pointClass; // Ensure `pointClass` is used instead of `class`
    }).length;
  
    return (correct / points.length) * 100;
  };
  

  // Check if a point is above the decision boundary
  const isPointAboveLine = (x, y) => {
    const slope = Math.tan(angle * (Math.PI / 180));
    const yIntercept = bias;
    return y > slope * x + yIntercept;
  };

  // Handle canvas click to add points
  const handleCanvasClick = (e) => {
    if (gameMode !== 'place') return;

    const rect = e.target.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 4 - 2;
    const y = -((e.clientY - rect.top) / rect.height) * 4 + 2;

    setPoints(prev => [...prev, { x, y, pointClass: level % 2 }]);


    if (points.length >= 4) {
      setGameMode('classify');
    }
  };

  // Reset game
  const resetGame = () => {
    setPoints(data);
    setAngle(0);
    setBias(0);
    setGameMode('place');
    setScore(0);
    setLevel(1);
  };

  // Check if level is complete
  useEffect(() => {
    if (gameMode === 'classify' && calculateAccuracy() >= 80) {
      setScore(prev => prev + Math.floor(calculateAccuracy()));
      setLevel(prev => prev + 1);
      setPoints(data);
      setAngle(0);
      setBias(0);
      setGameMode('place');
    }
  }, [angle, bias, data]);

  // Update points when data changes
  useEffect(() => {
    setPoints(Array.isArray(data) ? data : []);
  }, [data]);
  
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-3 rounded-xl">
              <Brain className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-transparent bg-clip-text">
              Logistic Regression Game
            </h3>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-purple-100 px-4 py-2 rounded-lg">
              <span className="text-purple-600 font-semibold">Level: {level}</span>
            </div>
            <div className="bg-indigo-100 px-4 py-2 rounded-lg">
              <span className="text-indigo-600 font-semibold">Score: {score}</span>
            </div>
          </div>
        </div>

        {/* Game Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h4 className="font-medium text-gray-700 mb-4">Controls</h4>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rotation: {angle}°
                  </label>
                  <input
                    type="range"
                    min="-90"
                    max="90"
                    value={angle}
                    onChange={(e) => setAngle(parseFloat(e.target.value))}
                    className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bias: {bias.toFixed(2)}
                  </label>
                  <input
                    type="range"
                    min="-2"
                    max="2"
                    step="0.1"
                    value={bias}
                    onChange={(e) => setBias(parseFloat(e.target.value))}
                    className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={resetGame}
                  className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Reset
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h4 className="font-medium text-gray-700 mb-4">Statistics</h4>
              <div className="space-y-2">
                <div>
                  <div className="text-sm text-gray-500">Accuracy</div>
                  <div className="text-lg font-semibold text-purple-600">
                    {calculateAccuracy().toFixed(1)}%
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Points Placed</div>
                  <div className="text-lg font-semibold text-purple-600">
                    {points.length}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Game Board */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div 
                className="relative w-full cursor-crosshair"
                style={{ paddingBottom: '100%' }}
                onClick={handleCanvasClick}
              >
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
                  <div className="absolute inset-4">
                    {points.map((point, i) => {
                      const x = ((point.x + 2) / 4) * 100;
                      const y = ((-point.y + 2) / 4) * 100;
                      
                      return (
                        <div
                          key={i}
                          className={`absolute w-4 h-4 rounded-full transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
                            point.class === 1 ? 'bg-blue-500' : 'bg-red-500'
                          } shadow-md hover:scale-110`}
                          style={{
                            left: `${x}%`,
                            top: `${y}%`,
                          }}
                        >
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 hover:opacity-100 pointer-events-none">
                            <div className="bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                              ({point.x.toFixed(2)}, {point.y.toFixed(2)})
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Decision boundary */}
                    <div
                      className="absolute border-2 border-purple-500 border-dashed transition-all duration-300"
                      style={{
                        left: '50%',
                        top: '50%',
                        width: '141.4%',
                        height: '2px',
                        transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(${bias * 50}px)`
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tutorial */}
        {showTutorial && (
          <div className="mt-6 bg-white rounded-xl p-4 shadow-sm border border-purple-100">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-2 text-sm text-gray-600">
                <p className="font-medium text-gray-700">How to Play:</p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Click on the grid to place points (blue for class 1, red for class 0)</li>
                  <li>After placing points, adjust the decision boundary using the controls</li>
                  <li>Try to achieve at least 80% accuracy to advance to the next level</li>
                  <li>Each level alternates between classifying class 1 and class 0 points</li>
                </ol>
                <button
                  onClick={() => setShowTutorial(false)}
                  className="text-purple-600 hover:text-purple-700 font-medium mt-2"
                >
                  Got it!
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LearningGame;
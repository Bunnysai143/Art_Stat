import React, { useState, useEffect } from 'react';
import { Trash2, Plus, RefreshCw } from 'lucide-react';



const DataEditor= ({ data, onDataChange }) => {
  const [points, setPoints] = useState(data.points);
  const [weights, setWeights] = useState(data.weights);
  const [learningRate, setLearningRate] = useState(data.learningRate);
  const [newPoint, setNewPoint] = useState({ x: 0, y: 0, class: 1 });
  const [editMode, setEditMode] = useState<'table' | 'parameters'>('table');
  const [filterClass, setFilterClass] = useState<number | null>(null);

  // Update local state when props change
  useEffect(() => {
    setPoints(data.points);
    setWeights(data.weights);
    setLearningRate(data.learningRate);
  }, [data]);

  // Update parent component when local state changes
  useEffect(() => {
    onDataChange({
      points,
      weights,
      learningRate
    });
  }, [points, weights, learningRate, onDataChange]);

  const handleAddPoint = () => {
    const updatedPoints = [...points, { ...newPoint }];
    setPoints(updatedPoints);
    setNewPoint({ x: 0, y: 0, class: 1 });
  };

  const handleRemovePoint = (index) => {
    const updatedPoints = points.filter((_, i) => i !== index);
    setPoints(updatedPoints);
  };

  const handleGenerateRandomData = () => {
    const newPoints = Array.from({ length: 100 }, () => {
      const x = (Math.random() - 0.5) * 10;
      const y = (Math.random() - 0.5) * 10;
      // Use current weights to generate consistent data
      const linearValue = weights.w1 * x + weights.w2 * y + weights.bias;
      // Add some noise
      const noise = (Math.random() - 0.5) * 3;
      // Determine class based on sigmoid of linear value + noise
      const probability = 1 / (1 + Math.exp(-(linearValue + noise)));
      const classValue = probability > 0.5 ? 1 : 0;
      
      return { x, y, class: classValue };
    });
    
    setPoints(newPoints);
  };

  const filteredPoints = filterClass !== null 
    ? points.filter(point => point.class === filterClass)
    : points;

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4 flex space-x-4">
        <button
          onClick={() => setEditMode('table')}
          className={`px-4 py-2 rounded-md ${
            editMode === 'table' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
        >
          Data Points
        </button>
        <button
          onClick={() => setEditMode('parameters')}
          className={`px-4 py-2 rounded-md ${
            editMode === 'parameters' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
        >
          Model Parameters
        </button>
      </div>

      {editMode === 'table' && (
        <>
          <div className="mb-4 flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium">X:</label>
              <input
                type="number"
                step="0.1"
                value={newPoint.x}
                onChange={(e) => setNewPoint({ ...newPoint, x: parseFloat(e.target.value) || 0 })}
                className="w-20 p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium">Y:</label>
              <input
                type="number"
                step="0.1"
                value={newPoint.y}
                onChange={(e) => setNewPoint({ ...newPoint, y: parseFloat(e.target.value) || 0 })}
                className="w-20 p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium">Class:</label>
              <select
                value={newPoint.class}
                onChange={(e) => setNewPoint({ ...newPoint, class: parseInt(e.target.value) })}
                className="p-2 border border-gray-300 rounded-md"
              >
                <option value={0}>0</option>
                <option value={1}>1</option>
              </select>
            </div>
            <button
              onClick={handleAddPoint}
              className="flex items-center space-x-1 px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              <Plus size={16} />
              <span>Add Point</span>
            </button>
            <button
              onClick={handleGenerateRandomData}
              className="flex items-center space-x-1 px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              <RefreshCw size={16} />
              <span>Generate Random Data</span>
            </button>
          </div>

          <div className="mb-4 flex space-x-4">
            <button
              onClick={() => setFilterClass(null)}
              className={`px-3 py-1 rounded-md ${
                filterClass === null ? 'bg-gray-700 text-white' : 'bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterClass(1)}
              className={`px-3 py-1 rounded-md ${
                filterClass === 1 ? 'bg-blue-500 text-white' : 'bg-gray-200'
              }`}
            >
              Class 1
            </button>
            <button
              onClick={() => setFilterClass(0)}
              className={`px-3 py-1 rounded-md ${
                filterClass === 0 ? 'bg-red-500 text-white' : 'bg-gray-200'
              }`}
            >
              Class 0
            </button>
          </div>

          <div className="flex-grow overflow-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Index</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">X</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Y</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPoints.slice(0, 100).map((point, index) => (
                  <tr key={index}>
                    <td className="px-6 py-2 whitespace-nowrap">{index + 1}</td>
                    <td className="px-6 py-2 whitespace-nowrap">{point.x.toFixed(2)}</td>
                    <td className="px-6 py-2 whitespace-nowrap">{point.y.toFixed(2)}</td>
                    <td className="px-6 py-2 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        point.class === 1 ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {point.class}
                      </span>
                    </td>
                    <td className="px-6 py-2 whitespace-nowrap">
                      <button
                        onClick={() => handleRemovePoint(index)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredPoints.length > 100 && (
              <div className="text-center py-2 text-gray-500">
                Showing 100 of {filteredPoints.length} points
              </div>
            )}
          </div>
        </>
      )}

      {editMode === 'parameters' && (
        <div className="space-y-6 p-4">
          <div>
            <h3 className="text-lg font-medium mb-4">Model Parameters</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Weight 1 (w₁): {weights.w1.toFixed(2)}
                </label>
                <input
                  type="range"
                  min="-5"
                  max="5"
                  step="0.1"
                  value={weights.w1}
                  onChange={(e) => setWeights({ ...weights, w1: parseFloat(e.target.value) })}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Weight 2 (w₂): {weights.w2.toFixed(2)}
                </label>
                <input
                  type="range"
                  min="-5"
                  max="5"
                  step="0.1"
                  value={weights.w2}
                  onChange={(e) => setWeights({ ...weights, w2: parseFloat(e.target.value) })}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bias: {weights.bias.toFixed(2)}
                </label>
                <input
                  type="range"
                  min="-10"
                  max="10"
                  step="0.1"
                  value={weights.bias}
                  onChange={(e) => setWeights({ ...weights, bias: parseFloat(e.target.value) })}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Learning Rate: {learningRate.toFixed(2)}
                </label>
                <input
                  type="range"
                  min="0.01"
                  max="1"
                  step="0.01"
                  value={learningRate}
                  onChange={(e) => setLearningRate(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="text-md font-medium mb-2">Current Decision Boundary</h4>
            <p className="font-mono">
              p(y=1) = sigmoid({weights.w1.toFixed(2)}x + {weights.w2.toFixed(2)}y + {weights.bias.toFixed(2)})
            </p>
            <p className="mt-2 text-sm text-gray-600">
              The decision boundary is the line where p(y=1) = 0.5, which occurs when:
            </p>
            <p className="font-mono mt-1">
              {weights.w1.toFixed(2)}x + {weights.w2.toFixed(2)}y + {weights.bias.toFixed(2)} = 0
            </p>
            <p className="font-mono mt-1">
              y = {(-weights.w1/weights.w2).toFixed(2)}x + {(-weights.bias/weights.w2).toFixed(2)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataEditor;
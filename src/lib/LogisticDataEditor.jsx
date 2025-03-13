import React, { useState, useEffect, useCallback } from 'react';
import { Trash2, Plus, RefreshCw, Edit2, Save, X } from 'lucide-react';


const DataEditor = ({ data, onDataChange }) => {
  const [points, setPoints] = useState(data.points);
  const [weights, setWeights] = useState(data.weights);
  const [learningRate, setLearningRate] = useState(data.learningRate);
  const [newPoint, setNewPoint] = useState({ x: 0, y: 0, class: 1 });
  const [editMode, setEditMode] = useState('table');
  const [filterClass, setFilterClass] = useState(null);
  const [editingPoint, setEditingPoint] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Update local state when props change
  useEffect(() => {
    setPoints(data.points);
    setWeights(data.weights);
    setLearningRate(data.learningRate);
  }, [data]);

  // Debounced update to parent
  const debouncedUpdate = useCallback(
    (newData) => {
      onDataChange(newData);
    },
    [onDataChange]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      debouncedUpdate({ points, weights, learningRate });
    }, 100);
    return () => clearTimeout(timer);
  }, [points, weights, learningRate, debouncedUpdate]);

  const handleAddPoint = () => {
    setPoints(prev => [...prev, { ...newPoint }]);
    setNewPoint({ x: 0, y: 0, class: 1 });
  };

  const handleRemovePoint = (index   ) => {
    setPoints(prev => prev.filter((_, i) => i !== index));
  };

  const handleEditPoint = (index   ) => {
    setEditingPoint({ index, point: { ...points[index] } });
  };

  const handleSaveEdit = () => {
    if (editingPoint) {
      setPoints(prev => 
        prev.map((p, i) => i === editingPoint.index ? editingPoint.point : p)
      );
      setEditingPoint(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingPoint(null);
  };

  const handleGenerateRandomData = () => {
    setIsGenerating(true);
    
    // Generate points in batches to avoid UI freeze
    const totalPoints = 100;
    const batchSize = 20;
    const newPoints= [];
    
    const generateBatch = (currentBatch   ) => {
      if (currentBatch >= totalPoints) {
        setPoints(newPoints);
        setIsGenerating(false);
        return;
      }

      const batchPoints = Array.from({ length: Math.min(batchSize, totalPoints - currentBatch) }, () => {
        const x = (Math.random() - 0.5) * 10;
        const y = (Math.random() - 0.5) * 10;
        const linearValue = weights.w1 * x + weights.w2 * y + weights.bias;
        const noise = (Math.random() - 0.5) * 3;
        const probability = 1 / (1 + Math.exp(-(linearValue + noise)));
        return { 
          x, 
          y, 
          class: probability > 0.5 ? 1 : 0 
        };
      });

      newPoints.push(...batchPoints);
      setPoints([...newPoints]);

      requestAnimationFrame(() => generateBatch(currentBatch + batchSize));
    };

    generateBatch(0);
  };

  const filteredPoints = filterClass !== null 
    ? points.filter(point => point.class === filterClass)
    : points;

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4 flex space-x-4">
        <button
          onClick={() => setEditMode('table')}
          className={`px-4 py-2 rounded-md transition-colors ${
            editMode === 'table' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'
          }`}
        >
          Data Points
        </button>
        <button
          onClick={() => setEditMode('parameters')}
          className={`px-4 py-2 rounded-md transition-colors ${
            editMode === 'parameters' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'
          }`}
        >
          Model Parameters
        </button>
      </div>

      {editMode === 'table' && (
        <>
          <div className="mb-4 flex flex-wrap gap-4 items-center">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium">X:</label>
              <input
                type="number"
                step="0.1"
                value={newPoint.x}
                onChange={(e) => setNewPoint(prev => ({ ...prev, x: parseFloat(e.target.value) || 0 }))}
                className="w-20 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium">Y:</label>
              <input
                type="number"
                step="0.1"
                value={newPoint.y}
                onChange={(e) => setNewPoint(prev => ({ ...prev, y: parseFloat(e.target.value) || 0 }))}
                className="w-20 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium">Class:</label>
              <select
                value={newPoint.class}
                onChange={(e) => setNewPoint(prev => ({ ...prev, class: parseInt(e.target.value) }))}
                className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={0}>0</option>
                <option value={1}>1</option>
              </select>
            </div>
            <button
              onClick={handleAddPoint}
              className="flex items-center space-x-1 px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
            >
              <Plus size={16} />
              <span>Add Point</span>
            </button>
            <button
              onClick={handleGenerateRandomData}
              disabled={isGenerating}
              className={`flex items-center space-x-1 px-3 py-2 rounded-md transition-colors ${
                isGenerating 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              <RefreshCw size={16} className={isGenerating ? 'animate-spin' : ''} />
              <span>{isGenerating ? 'Generating...' : 'Generate Random Data'}</span>
            </button>
          </div>

          <div className="mb-4 flex space-x-4">
            <button
              onClick={() => setFilterClass(null)}
              className={`px-3 py-1 rounded-md transition-colors ${
                filterClass === null ? 'bg-gray-700 text-white' : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterClass(1)}
              className={`px-3 py-1 rounded-md transition-colors ${
                filterClass === 1 ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              Class 1
            </button>
            <button
              onClick={() => setFilterClass(0)}
              className={`px-3 py-1 rounded-md transition-colors ${
                filterClass === 0 ? 'bg-red-500 text-white' : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              Class 0
            </button>
          </div>

          <div className="flex-grow overflow-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Index</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">X</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Y</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPoints.slice(0, 100).map((point, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-2 whitespace-nowrap">{index + 1}</td>
                    <td className="px-6 py-2 whitespace-nowrap">
                      {editingPoint?.index === index ? (
                        <input
                          type="number"
                          step="0.1"
                          value={editingPoint.point.x}
                          onChange={(e) => setEditingPoint(prev => prev ? {
                            ...prev,
                            point: { ...prev.point, x: parseFloat(e.target.value) || 0 }
                          } : null)}
                          className="w-20 p-1 border border-gray-300 rounded"
                        />
                      ) : point.x.toFixed(2)}
                    </td>
                    <td className="px-6 py-2 whitespace-nowrap">
                      {editingPoint?.index === index ? (
                        <input
                          type="number"
                          step="0.1"
                          value={editingPoint.point.y}
                          onChange={(e) => setEditingPoint(prev => prev ? {
                            ...prev,
                            point: { ...prev.point, y: parseFloat(e.target.value) || 0 }
                          } : null)}
                          className="w-20 p-1 border border-gray-300 rounded"
                        />
                      ) : point.y.toFixed(2)}
                    </td>
                    <td className="px-6 py-2 whitespace-nowrap">
                      {editingPoint?.index === index ? (
                        <select
                          value={editingPoint.point.class}
                          onChange={(e) => setEditingPoint(prev => prev ? {
                            ...prev,
                            point: { ...prev.point, class: parseInt(e.target.value) }
                          } : null)}
                          className="p-1 border border-gray-300 rounded"
                        >
                          <option value={0}>0</option>
                          <option value={1}>1</option>
                        </select>
                      ) : (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          point.class === 1 ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {point.class}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-2 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {editingPoint?.index === index ? (
                          <>
                            <button
                              onClick={handleSaveEdit}
                              className="text-green-600 hover:text-green-900"
                              title="Save"
                            >
                              <Save size={16} />
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="text-gray-600 hover:text-gray-900"
                              title="Cancel"
                            >
                              <X size={16} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleEditPoint(index)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Edit"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleRemovePoint(index)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </div>
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
                  onChange={(e) => setWeights(prev => ({ ...prev, w1: parseFloat(e.target.value) }))}
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
                  onChange={(e) => setWeights(prev => ({ ...prev, w2: parseFloat(e.target.value) }))}
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
                  onChange={(e) => setWeights(prev => ({ ...prev, bias: parseFloat(e.target.value) }))}
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
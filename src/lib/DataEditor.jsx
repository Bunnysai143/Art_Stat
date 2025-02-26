import React, { useState, useEffect } from 'react';
// import { DataPoint } from './RegressionPlot3D';



const DataEditor= ({ onDataChange, onCoefficientChange, coefficients }) => {
  const [numPoints, setNumPoints] = useState(50);
  const [xCoefficient, setXCoefficient] = useState(coefficients.x);
  const [yCoefficient, setYCoefficient] = useState(coefficients.y);
  const [interceptValue, setInterceptValue] = useState(coefficients.intercept);
  const [noiseLevel, setNoiseLevel] = useState(1);
  const [manualPoints, setManualPoints] = useState([]);
  const [newPoint, setNewPoint] = useState({ x: 0, y: 0, z: 0 });
  const [editMode, setEditMode] = useState('generate');

  // Generate data based on current parameters
  const generateData = () => {
    const data= [];
    for (let i = 0; i < numPoints; i++) {
      const x = (Math.random() - 0.5) * 10;
      const y = (Math.random() - 0.5) * 10;
      const baseZ = xCoefficient * x + yCoefficient * y + interceptValue;
      const noise = (Math.random() - 0.5) * 2 * noiseLevel;
      const z = baseZ + noise;
      const classValue = z > 3 ? 1 : 0;
      
      data.push({ x, y, z, class: classValue });
    }
    return data;
  };

  // Update coefficients when they change
  useEffect(() => {
    onCoefficientChange({ x: xCoefficient, y: yCoefficient, intercept: interceptValue });
  }, [xCoefficient, yCoefficient, interceptValue, onCoefficientChange]);

  // Handle generating new data
  const handleGenerateData = () => {
    const newData = generateData();
    onDataChange(newData);
  };

  // Handle adding a new point
  const handleAddPoint = () => {
    const baseZ = xCoefficient * newPoint.x + yCoefficient * newPoint.y + interceptValue;
    const classValue = baseZ > 3 ? 1 : 0;
    
    const point= {
      x: newPoint.x,
      y: newPoint.y,
      z: newPoint.z,
      class: classValue
    };
    
    const updatedPoints = [...manualPoints, point];
    setManualPoints(updatedPoints);
    onDataChange(updatedPoints);
    setNewPoint({ x: 0, y: 0, z: 0 });
  };

  // Handle removing a point
  const handleRemovePoint = (index) => {
    const updatedPoints = manualPoints.filter((_, i) => i !== index);
    setManualPoints(updatedPoints);
    onDataChange(updatedPoints.length > 0 ? updatedPoints : null);
  };

  // Handle clearing all points
  const handleClearPoints = () => {
    setManualPoints([]);
    onDataChange(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex space-x-4 mb-4">
        <button
          onClick={() => setEditMode('generate')}
          className={`px-4 py-2 rounded-md ${
            editMode === 'generate' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
        >
          Generate Data
        </button>
        <button
          onClick={() => setEditMode('manual')}
          className={`px-4 py-2 rounded-md ${
            editMode === 'manual' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
        >
          Manual Entry
        </button>
      </div>

      {editMode === 'generate' && (
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-medium mb-4">Generate Data Points</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Points: {numPoints}
              </label>
              <input
                type="range"
                min="10"
                max="500"
                value={numPoints}
                onChange={(e) => setNumPoints(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Noise Level: {noiseLevel.toFixed(1)}
              </label>
              <input
                type="range"
                min="0"
                max="3"
                step="0.1"
                value={noiseLevel}
                onChange={(e) => setNoiseLevel(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
          
          <h3 className="text-lg font-medium mt-6 mb-4">Regression Coefficients</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                X Coefficient: {xCoefficient.toFixed(2)}
              </label>
              <input
                type="range"
                min="-5"
                max="5"
                step="0.1"
                value={xCoefficient}
                onChange={(e) => setXCoefficient(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Y Coefficient: {yCoefficient.toFixed(2)}
              </label>
              <input
                type="range"
                min="-5"
                max="5"
                step="0.1"
                value={yCoefficient}
                onChange={(e) => setYCoefficient(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Intercept: {interceptValue.toFixed(2)}
              </label>
              <input
                type="range"
                min="-10"
                max="10"
                step="0.1"
                value={interceptValue}
                onChange={(e) => setInterceptValue(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
          
          <div className="mt-6">
            <button
              onClick={handleGenerateData}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Generate New Data
            </button>
          </div>
        </div>
      )}

      {editMode === 'manual' && (
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-medium mb-4">Add Custom Data Points</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">X Value</label>
              <input
                type="number"
                step="0.1"
                value={newPoint.x}
                onChange={(e) => setNewPoint({ ...newPoint, x: parseFloat(e.target.value) })}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Y Value</label>
              <input
                type="number"
                step="0.1"
                value={newPoint.y}
                onChange={(e) => setNewPoint({ ...newPoint, y: parseFloat(e.target.value) })}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Z Value</label>
              <input
                type="number"
                step="0.1"
                value={newPoint.z}
                onChange={(e) => setNewPoint({ ...newPoint, z: parseFloat(e.target.value) })}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
          
          <div className="flex space-x-2 mb-6">
            <button
              onClick={handleAddPoint}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Add Point
            </button>
            
            <button
              onClick={handleClearPoints}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
            >
              Clear All Points
            </button>
          </div>
          
          {manualPoints.length > 0 ? (
            <div className="overflow-auto max-h-64">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">X</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Y</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Z</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {manualPoints.map((point, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">{point.x.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{point.y.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{point.z.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          point.class === 1 ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {point.class === 1 ? 'Class 1' : 'Class 0'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleRemovePoint(index)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 italic">No custom points added yet.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default DataEditor;
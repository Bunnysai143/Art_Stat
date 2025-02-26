import React, { useState } from 'react';
import RegressionPlot3D from '../../lib/RegressionPlot3D';
import DataEditor from '../../lib/DataEditor';
import RegressionGame from '../../lib/RegressionGame';

function MultipleRegression() {
  const [activeTab, setActiveTab] = useState('visualization');
  const [customData, setCustomData] = useState(null);
  const [coefficients, setCoefficients] = useState({ x: 2, y: -1.5, intercept: 3 });
  const [gameScore, setGameScore] = useState(0);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h2 className="text-2xl font-semibold mb-6">
          3D Multiple Linear Regression Interactive Learning
        </h2>
        
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('visualization')}
                className={`${
                  activeTab === 'visualization'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Visualization
              </button>
              <button
                onClick={() => setActiveTab('editor')}
                className={`${
                  activeTab === 'editor'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Data Editor
              </button>
              <button
                onClick={() => setActiveTab('game')}
                className={`${
                  activeTab === 'game'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Learning Game
              </button>
            </nav>
          </div>
        </div>
        
        {activeTab === 'visualization' && (
          <>
            <RegressionPlot3D customData={customData} coefficients={coefficients} />
            <div className="mt-6 prose max-w-none">
              <h3>Understanding the Visualization</h3>
              <ul>
                <li><strong>Data Points:</strong> Each point represents an observation with X, Y coordinates and a Z value</li>
                <li><strong>Colors:</strong> Points are colored based on their class (blue for class 1, red for class 0)</li>
                <li><strong>Green Plane:</strong> The fitted regression plane showing the predicted Z values</li>
                <li><strong>Grid:</strong> The base grid helps visualize the X-Y plane</li>
                <li><strong>Interaction:</strong> Use your mouse to rotate, zoom, and pan the visualization</li>
              </ul>
              
              <p>
                This visualization demonstrates how multiple linear regression can be used to model
                relationships between two independent variables (X and Y) and a dependent variable (Z).
                The semi-transparent green plane represents the best-fit surface that minimizes the
                distance between the actual data points and their predicted values.
              </p>
            </div>
          </>
        )}
        
        {activeTab === 'editor' && (
          <DataEditor 
            onDataChange={setCustomData} 
            onCoefficientChange={setCoefficients}
            coefficients={coefficients}
          />
        )}
        
        {activeTab === 'game' && (
          <RegressionGame 
            onScoreChange={setGameScore} 
            score={gameScore}
            onCoefficientChange={setCoefficients}
          />
        )}
      </div>
    </div>
  );
}

export default MultipleRegression;
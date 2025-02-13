import React from 'react';
import RegressionPlot3D from '../../lib/RegressionPlot3D';


function MultipleRegression() {
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h2 className="text-2xl font-semibold mb-6">
          3D Multiple Linear Regression Visualization
        </h2>
        
        <RegressionPlot3D />
        
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
      </div>
    </div>
  );
}

export default MultipleRegression;
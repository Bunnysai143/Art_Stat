import React, { useState, useEffect, useCallback } from 'react';
import { generateRegressionData } from '../../utils/dataGeneartor';

function ExploreRegression() {
  const [data, setData] = useState(generateRegressionData());
  const [slope, setSlope] = useState(1);
  const [intercept, setIntercept] = useState(0);
  const [animationProgress, setAnimationProgress] = useState(0);

  useEffect(() => {
    let animationFrame;
    const animate = () => {
      setAnimationProgress(prev => {
        if (prev >= 1) return 1;
        return prev + 0.02;
      });
    };
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [data]);

  const handleSlopeChange = useCallback((newSlope) => {
    setSlope(newSlope);
    setAnimationProgress(0);
  }, []);

  const handleInterceptChange = useCallback((newIntercept) => {
    setIntercept(newIntercept);
    setAnimationProgress(0);
  }, []);

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Explore Linear Regression</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <canvas
              id="exploreRegressionPlot"
              width="400"
              height="400"
              className="w-full rounded-lg"
            />
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Slope: {slope.toFixed(2)}
              </label>
              <input
                type="range"
                min="-5"
                max="5"
                step="0.1"
                value={slope}
                onChange={(e) => handleSlopeChange(parseFloat(e.target.value))}
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
                Regression Equation
              </h3>
              <p className="font-mono">
                y = {slope.toFixed(2)}x + {intercept.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExploreRegression;
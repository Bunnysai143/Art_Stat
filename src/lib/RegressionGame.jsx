import React, { useState, useEffect } from 'react';
// import { DataPoint } from './RegressionPlot3D';



const RegressionGame = ({ onScoreChange, score, onCoefficientChange }) => {
  const [gameLevel, setGameLevel] = useState(1);
  const [targetCoefficients, setTargetCoefficients] = useState({ x: 0, y: 0, intercept: 0 });
  const [userCoefficients, setUserCoefficients] = useState({ x: 0, y: 0, intercept: 0 });
  const [gameStatus, setGameStatus] = useState('playing');
  const [attempts, setAttempts] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameActive, setGameActive] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // Generate random coefficients based on level
  const generateTargetCoefficients = (level) => {
    const range = Math.min(level * 0.5, 5);
    const precision = level <= 3 ? 0.5 : 0.1;
    
    const randomCoefficient = () => {
      const value = (Math.random() * 2 * range - range);
      return Math.round(value / precision) * precision;
    };
    
    return {
      x: randomCoefficient(),
      y: randomCoefficient(),
      intercept: randomCoefficient() * 2
    };
  };

  // Start a new game level
  const startLevel = () => {
    const newTargetCoefficients = generateTargetCoefficients(gameLevel);
    setTargetCoefficients(newTargetCoefficients);
    setUserCoefficients({ x: 0, y: 0, intercept: 0 });
    setGameStatus('playing');
    setAttempts(0);
    setFeedback('');
    setTimeLeft(60);
    setGameActive(true);
    setShowHint(false);
    
    // Update the visualization with the target coefficients
    onCoefficientChange(newTargetCoefficients);
  };

  // Check user's guess
  const checkGuess = () => {
    setAttempts(attempts + 1);
    
    // Calculate error between user's guess and target
    const xError = Math.abs(userCoefficients.x - targetCoefficients.x);
    const yError = Math.abs(userCoefficients.y - targetCoefficients.y);
    const interceptError = Math.abs(userCoefficients.intercept - targetCoefficients.intercept);
    
    const totalError = xError + yError + interceptError;
    
    // Determine accuracy threshold based on level
    const threshold = gameLevel <= 3 ? 0.5 : 0.3;
    
    if (totalError <= threshold) {
      // Success!
      const pointsEarned = Math.max(10 - attempts + Math.floor(timeLeft / 10), 1) * gameLevel;
      onScoreChange(score + pointsEarned);
      setGameStatus('success');
      setFeedback(`Great job! You found the coefficients with ${totalError.toFixed(2)} total error. +${pointsEarned} points!`);
    } else if (attempts >= 5) {
      // Too many attempts
      setGameStatus('failed');
      setFeedback(`You've used all your attempts. The correct coefficients were: X=${targetCoefficients.x}, Y=${targetCoefficients.y}, Intercept=${targetCoefficients.intercept}`);
    } else {
      // Provide feedback
      let feedbackMsg = `Not quite right. Total error: ${totalError.toFixed(2)}. `;
      
      if (xError > threshold) {
        feedbackMsg += userCoefficients.x > targetCoefficients.x ? 'X coefficient is too high. ' : 'X coefficient is too low. ';
      }
      
      if (yError > threshold) {
        feedbackMsg += userCoefficients.y > targetCoefficients.y ? 'Y coefficient is too high. ' : 'Y coefficient is too low. ';
      }
      
      if (interceptError > threshold) {
        feedbackMsg += userCoefficients.intercept > targetCoefficients.intercept ? 'Intercept is too high. ' : 'Intercept is too low. ';
      }
      
      setFeedback(feedbackMsg);
    }
  };

  // Timer effect
  useEffect(() => {
    let timer;
    
    if (gameActive && gameStatus === 'playing' && timeLeft > 0) {
      timer = window.setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0 && gameStatus === 'playing') {
      setGameStatus('failed');
      setFeedback(`Time's up! The correct coefficients were: X=${targetCoefficients.x}, Y=${targetCoefficients.y}, Intercept=${targetCoefficients.intercept}`);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [timeLeft, gameActive, gameStatus, targetCoefficients]);

  // Update visualization with user's coefficients
  useEffect(() => {
    if (gameStatus === 'playing') {
      onCoefficientChange(userCoefficients);
    }
  }, [userCoefficients, onCoefficientChange, gameStatus]);

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 p-6 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Regression Equation Guessing Game</h3>
          <div className="flex items-center space-x-4">
            <div className="text-sm font-medium">Level: {gameLevel}</div>
            <div className="text-sm font-medium">Score: {score}</div>
            <div className={`text-sm font-medium ${timeLeft <= 10 ? 'text-red-500' : ''}`}>
              Time: {timeLeft}s
            </div>
          </div>
        </div>
        
        {!gameActive ? (
          <div className="text-center py-8">
            <h4 className="text-xl font-medium mb-4">Regression Coefficient Guessing Game</h4>
            <p className="mb-6">
              Try to guess the coefficients of the regression equation that generated the data points.
              You'll have 60 seconds and 5 attempts per level. Higher levels are more challenging!
            </p>
            <button
              onClick={startLevel}
              className="px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Start Game
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-lg font-medium mb-2">
                Find the coefficients for the equation: Z = aX + bY + c
              </p>
              <p className="text-sm text-gray-600 mb-4">
                Adjust the sliders to match the regression plane to the data points.
                You have {5 - attempts} attempts left.
              </p>
              
              {feedback && (
                <div className={`p-3 rounded-md mb-4 ${
                  gameStatus === 'success' ? 'bg-green-100 text-green-800' : 
                  gameStatus === 'failed' ? 'bg-red-100 text-red-800' : 
                  'bg-blue-100 text-blue-800'
                }`}>
                  {feedback}
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    X Coefficient (a): {userCoefficients.x.toFixed(1)}
                  </label>
                  <input
                    type="range"
                    min="-5"
                    max="5"
                    step="0.1"
                    disabled={gameStatus !== 'playing'}
                    value={userCoefficients.x}
                    onChange={(e) => setUserCoefficients({
                      ...userCoefficients,
                      x: parseFloat(e.target.value)
                    })}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Y Coefficient (b): {userCoefficients.y.toFixed(1)}
                  </label>
                  <input
                    type="range"
                    min="-5"
                    max="5"
                    step="0.1"
                    disabled={gameStatus !== 'playing'}
                    value={userCoefficients.y}
                    onChange={(e) => setUserCoefficients({
                      ...userCoefficients,
                      y: parseFloat(e.target.value)
                    })}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Intercept (c): {userCoefficients.intercept.toFixed(1)}
                  </label>
                  <input
                    type="range"
                    min="-10"
                    max="10"
                    step="0.1"
                    disabled={gameStatus !== 'playing'}
                    value={userCoefficients.intercept}
                    onChange={(e) => setUserCoefficients({
                      ...userCoefficients,
                      intercept: parseFloat(e.target.value)
                    })}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex space-x-4">
              {gameStatus === 'playing' && (
                <>
                  <button
                    onClick={checkGuess}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                  >
                    Submit Guess
                  </button>
                  
                  <button
                    onClick={() => setShowHint(!showHint)}
                    className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors"
                  >
                    {showHint ? 'Hide Hint' : 'Get Hint'}
                  </button>
                </>
              )}
              
              {gameStatus !== 'playing' && (
                <>
                  <button
                    onClick={() => {
                      if (gameStatus === 'success') {
                        setGameLevel(gameLevel + 1);
                      }
                      startLevel();
                    }}
                    className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                  >
                    {gameStatus === 'success' ? 'Next Level' : 'Try Again'}
                  </button>
                  
                  <button
                    onClick={() => {
                      setGameActive(false);
                      setGameLevel(1);
                      onScoreChange(0);
                    }}
                    className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                  >
                    Reset Game
                  </button>
                </>
              )}
            </div>
            
            {showHint && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800">
                  Hint: Look at how the plane intersects with the axes. The X coefficient affects the slope in the X direction,
                  the Y coefficient affects the slope in the Y direction, and the intercept shifts the entire plane up or down.
                </p>
              </div>
            )}
          </>
        )}
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-medium mb-4">How to Play</h3>
        <ol className="list-decimal list-inside space-y-2">
          <li>Observe the 3D scatter plot with data points and a regression plane</li>
          <li>Adjust the sliders to change the coefficients of the regression equation</li>
          <li>Try to match your plane with the one that generated the data</li>
          <li>Submit your guess and receive feedback</li>
          <li>You have 5 attempts and 60 seconds per level</li>
          <li>Higher levels have more complex coefficients</li>
        </ol>
        
        <div className="mt-6">
          <h4 className="text-md font-medium mb-2">Learning Objectives:</h4>
          <ul className="list-disc list-inside space-y-1">
            <li>Understand how coefficients affect the regression plane</li>
            <li>Visualize the relationship between variables in 3D space</li>
            <li>Develop intuition for multiple linear regression</li>
            <li>Practice parameter estimation by visual inspection</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RegressionGame;
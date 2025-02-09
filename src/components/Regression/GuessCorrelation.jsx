import React, { useState, useEffect, useCallback } from 'react';
import { generateCorrelationData, calculateCorrelation } from '../../utils/correlationUtils';
import { ScatterPlot } from '../../lib/ScatterPlot';

function GuessCorrelation() {
  const [data, setData] = useState(generateCorrelationData());
  const [guess, setGuess] = useState('');
  const [actualCorrelation, setActualCorrelation] = useState(null);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [animationProgress, setAnimationProgress] = useState(0);

  useEffect(() => {
    let animationFrame;
    const startTime = Date.now();
    const duration = 800; // 0.8 second animation - more responsive

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setAnimationProgress(progress);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [data]);

  const handleGuess = useCallback(() => {
    const guessNum = parseFloat(guess);
    if (isNaN(guessNum) || guessNum < -1 || guessNum > 1) {
      setFeedback('Please enter a valid correlation coefficient between -1 and 1');
      return;
    }

    const actual = calculateCorrelation(data);
    setActualCorrelation(actual);
    const error = Math.abs(actual - guessNum);
    const points = Math.max(0, 10 - Math.floor(error * 20));
    setScore(prev => prev + points);
    setAttempts(prev => prev + 1);
    
    let feedbackText = `The actual correlation was ${actual.toFixed(2)}. `;
    if (error < 0.1) {
      feedbackText += 'Excellent guess! ';
    } else if (error < 0.2) {
      feedbackText += 'Good guess! ';
    } else if (error < 0.3) {
      feedbackText += 'Not bad! ';
    } else {
      feedbackText += 'Keep practicing! ';
    }
    feedbackText += `You earned ${points} points!`;
    
    setFeedback(feedbackText);
  }, [guess, data]);

  const generateNewPlot = useCallback(() => {
    setData(generateCorrelationData());
    setGuess('');
    setActualCorrelation(null);
    setFeedback('');
    setAnimationProgress(0);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">Guess the Correlation</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Try to guess the correlation coefficient between the points (-1 to 1)
                </p>
              </div>
              <div className="flex items-center gap-4 sm:text-right">
                <div className="bg-indigo-50 px-4 py-2 rounded-lg">
                  <div className="text-2xl font-bold text-indigo-600">{score}</div>
                  <div className="text-sm text-indigo-600">Total Score</div>
                </div>
                <div className="bg-gray-50 px-4 py-2 rounded-lg">
                  <div className="text-2xl font-bold text-gray-600">{attempts}</div>
                  <div className="text-sm text-gray-600">Attempts</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="aspect-square w-full max-w-[600px] mx-auto bg-gray-50 rounded-lg p-4">
                  <ScatterPlot
                    data={data}
                    width={500}
                    height={500}
                    animationProgress={animationProgress}
                  />
                </div>
                <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
                  <p className="font-medium bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">How to interpret the graph:</p>
                  <ul className="mt-2 space-y-1 list-disc list-inside">
                    <li>Each point represents an (x, y) coordinate pair</li>
                    <li>Perfect positive correlation (1.0): Points form a line from bottom-left to top-right</li>
                    <li>Perfect negative correlation (-1.0): Points form a line from top-left to bottom-right</li>
                    <li>No correlation (0.0): Points appear randomly scattered</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700">
                    Your Guess (between -1 and 1)
                  </label>
                  <div className="mt-3">
                    <input
                      type="number"
                      step="0.1"
                      min="-1"
                      max="1"
                      value={guess}
                      onChange={(e) => setGuess(e.target.value)}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500  block w-full sm:text-sm border-gray-300 rounded-md h-10 indent-2"
                      placeholder="Enter your guess..."
                    />
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-gray-500 font-medium">Correlation Guide:</p>
                    <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
                      <div className="bg-white p-2 rounded">
                        <div className="font-medium">-1.0</div>
                        <div className="text-gray-500">Perfect negative</div>
                      </div>
                      <div className="bg-white p-2 rounded">
                        <div className="font-medium">-0.5</div>
                        <div className="text-gray-500">Moderate negative</div>
                      </div>
                      <div className="bg-white p-2 rounded">
                        <div className="font-medium">0.0</div>
                        <div className="text-gray-500">No correlation</div>
                      </div>
                      <div className="bg-white p-2 rounded">
                        <div className="font-medium">0.5</div>
                        <div className="text-gray-500">Moderate positive</div>
                      </div>
                      <div className="bg-white p-2 rounded">
                        <div className="font-medium">1.0</div>
                        <div className="text-gray-500">Perfect positive</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={handleGuess}
                    className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Submit Guess
                  </button>

                  <button
                    onClick={generateNewPlot}
                    className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    New Plot
                  </button>
                </div>

                {feedback && (
                  <div className="rounded-md bg-blue-50 p-4">
                    <p className="text-sm font-medium text-blue-800">{feedback}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GuessCorrelation;
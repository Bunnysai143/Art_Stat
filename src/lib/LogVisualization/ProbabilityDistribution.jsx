import React, { useMemo } from 'react';
import { BarChart3, Info } from 'lucide-react';

const ProbabilityDistribution = ({ data }) => {
  const { bins, maxCount } = useMemo(() => {
    const sigmoid = (z) => 1 / (1 + Math.exp(-z));
    
    const { w1, w2, bias } = data.weights;
    const probabilities = data.points.map(point => ({
      probability: sigmoid(w1 * point.x + w2 * point.y + bias),
      class: point.class
    }));
    
    const numBins = 20;
    const binWidth = 1 / numBins;
    const bins = Array(numBins).fill(0).map(() => ({ 
      class0: 0, 
      class1: 0,
      start: 0,
      end: 0
    }));
    
    probabilities.forEach(item => {
      const binIndex = Math.min(Math.floor(item.probability / binWidth), numBins - 1);
      bins[binIndex].start = binIndex * binWidth;
      bins[binIndex].end = (binIndex + 1) * binWidth;
      if (item.class === 0) {
        bins[binIndex].class0++;
      } else {
        bins[binIndex].class1++;
      }
    });
    
    const maxCount = Math.max(...bins.map(bin => Math.max(bin.class0, bin.class1)));
    
    return { bins, maxCount };
  }, [data]);

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl p-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-indigo-100 p-3 rounded-xl">
          <BarChart3 className="w-6 h-6 text-indigo-600" />
        </div>
        <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">
          Probability Distribution
        </h3>
      </div>
      
      <div className="flex-grow relative">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-16 w-12 flex flex-col justify-between">
          {[maxCount, Math.floor(maxCount * 2/3), Math.floor(maxCount * 1/3), 0].map((value, i) => (
            <span key={i} className="text-xs text-gray-500 transform -translate-y-1/2">
              {value}
            </span>
          ))}
        </div>
        
        {/* Chart area */}
        <div className="ml-12 h-full pb-16 grid grid-cols-20 gap-1.5">
          {bins.map((bin, i) => (
            <div key={i} className="relative flex flex-col justify-end h-full group">
              {/* Hover tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                <div className="bg-gray-800 text-white text-xs rounded-lg p-2 whitespace-nowrap">
                  <div>Range: {bin.start.toFixed(2)} - {bin.end.toFixed(2)}</div>
                  <div>Class 1: {bin.class1}</div>
                  <div>Class 0: {bin.class0}</div>
                </div>
                <div className="border-8 border-transparent border-t-gray-800 w-0 h-0 absolute left-1/2 transform -translate-x-1/2" />
              </div>

              {/* Class 1 bar */}
              <div 
                className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg shadow-lg transform origin-bottom transition-all duration-500 ease-out hover:scale-x-110 group-hover:from-blue-600 group-hover:to-blue-500"
                style={{ 
                  height: `${(bin.class1 / maxCount) * 100}%`,
                  animation: `grow-up 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 50}ms`
                }}
              />
              
              {/* Class 0 bar */}
              <div 
                className="w-full bg-gradient-to-t from-red-500 to-red-400 rounded-t-lg shadow-lg transform origin-bottom transition-all duration-500 ease-out hover:scale-x-110 group-hover:from-red-600 group-hover:to-red-500"
                style={{ 
                  height: `${(bin.class0 / maxCount) * 100}%`,
                  animation: `grow-up 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 50}ms`
                }}
              />
              
              {/* X-axis label */}
              {i % 4 === 0 && (
                <span className="absolute bottom-[-2.5rem] left-1/2 transform -translate-x-1/2 text-xs text-gray-500">
                  {bin.start.toFixed(1)}
                </span>
              )}
            </div>
          ))}
          
          {/* Decision threshold line */}
          <div 
            className="absolute top-0 bottom-16 border-l-2 border-dashed border-emerald-500 transition-all duration-1000"
            style={{ 
              left: '50%',
              animation: 'threshold-appear 1s ease-out forwards'
            }}
          >
            <div className="absolute top-2 left-2 flex items-center gap-1 text-xs text-emerald-600 whitespace-nowrap bg-emerald-50 px-2 py-1 rounded-full shadow-sm">
              <Info className="w-3 h-3" />
              <span>Decision Threshold (p=0.5)</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Legend */}
      <div className="mt-8 flex items-center justify-center gap-8">
        <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm transition-transform hover:scale-105">
          <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-blue-500 to-blue-400" />
          <span className="text-sm font-medium text-gray-700">Class 1</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm transition-transform hover:scale-105">
          <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-red-500 to-red-400" />
          <span className="text-sm font-medium text-gray-700">Class 0</span>
        </div>
      </div>
      
      <div className="mt-6 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-gray-600 leading-relaxed">
            This histogram visualizes the distribution of predicted probabilities for each class.
            Blue bars represent class 1 points, and red bars represent class 0 points.
            A well-performing model will show class 0 points clustered near probability 0 and class 1 points near probability 1.
            Hover over any bar to see detailed statistics.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProbabilityDistribution;
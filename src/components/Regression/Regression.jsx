import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
// import Regression from './components/Regression';
import CategoricalAssociastion from './CategoricalAssociation';
import Correlation from './Correlation';
import GuessCorrelation from './GuessCorrelation';
import ExploreRegression from './ExploreRegression';
import MultipleRegression from './MultipleRegression';
import Regressionmain from './Regressionmain';

const visualizations = [
  { id: 'categorical', name: 'Association Between Two Categorical Variables (2x2 tables)', component: CategoricalAssociastion },
  { id: 'correlation', name: 'Scatterplots & Correlation', component: Correlation },
  { id: 'guess-correlation', name: 'Guess the Correlation', component: GuessCorrelation },
  { id: 'explore-regression', name: 'Explore Linear Regression', component: ExploreRegression },
  { id: 'multiple', name: 'Multiple Linear Regression', component: MultipleRegression },
  { id: 'exponential', name: 'Exponential Regression', component: Regressionmain },
  { id: 'logistic', name: 'Logistic Regression', component: Regressionmain }
];

function Regression() {
  const [selectedViz, setSelectedViz] = useState(visualizations[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const SelectedComponent = selectedViz.component;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full flex items-center justify-between bg-white border border-gray-300 rounded-lg px-4 py-2 text-left hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <span className="block truncate">{selectedViz.name}</span>
              <ChevronDown className={`ml-2 h-5 w-5 text-gray-400 transition-transform ${isDropdownOpen ? 'transform rotate-180' : ''}`} />
            </button>

            {isDropdownOpen && (
              <div className="absolute mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm z-50">
                {visualizations.map((viz) => (
                  <button
                    key={viz.id}
                    className={`w-full text-left px-4 py-2 hover:bg-indigo-50 ${
                      selectedViz.id === viz.id ? 'bg-indigo-100' : ''
                    }`}
                    onClick={() => {
                      setSelectedViz(viz);
                      setIsDropdownOpen(false);
                    }}
                  >
                    {viz.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <SelectedComponent type={selectedViz.id} />
      </main>
    </div>
  );
}

export default Regression;
import React, { useState } from 'react';
import { ChevronDown, ChevronUp, BarChart3, TrendingUp, Sigma, Dices, Brain, Table2 } from 'lucide-react';
import DecisionBoundary from '../../lib/LogVisualization/DecisionBoundary';
import SigmoidFunction from '../../lib/LogVisualization/SigmoidFunction';
import ProbabilityDistribution from '../../lib/LogVisualization/ProbabilityDistribution';
import CostFunction from '../../lib/LogVisualization/CostFunction';
import GradientDescent from '../../lib/LogVisualization/GradientDescent';
import LearningGame from '../../lib/LogVisualization/LearningGame';
import DataEditor from '../../lib/LogisticDataEditor';



function LogisticRegressionDashboard() {
  const [expandedCard, setExpandedCard] = useState(null);
  const [data, setData] = useState({
    points: Array.from({ length: 100 }, () => {
      const x = (Math.random() - 0.5) * 10;
      const y = (Math.random() - 0.5) * 10;
      // Simple linear decision boundary for initial data
      const linearValue = 1.5 * x - y + 2;
      // Add some noise
      const noise = (Math.random() - 0.5) * 3;
      // Determine class based on sigmoid of linear value + noise
      const probability = 1 / (1 + Math.exp(-(linearValue + noise)));
      const classValue = probability > 0.5 ? 1 : 0;
      
      return { x, y, class: classValue };
    }),
    weights: {
      w1: 1.5,
      w2: -1.0,
      bias: 2.0
    },
    learningRate: 0.1
  });

  const toggleCard = (cardId) => {
    if (expandedCard === cardId) {
      setExpandedCard(null);
    } else {
      setExpandedCard(cardId);
    }
  };

  const updateData = (newData) => {
    setData(prevData => ({
      ...prevData,
      ...newData
    }));
  };

  const cards = [
    {
      id: 'decision-boundary' ,
      title: 'Decision Boundary',
      description: 'Visualize how logistic regression separates data points into classes',
      icon: <BarChart3 className="h-6 w-6" />,
      component: <DecisionBoundary data={data} />
    },
    {
      id: 'sigmoid-function' ,
      title: 'Sigmoid Function',
      description: 'Explore the S-shaped curve that maps values to probabilities',
      icon: <TrendingUp className="h-6 w-6" />,
      component: <SigmoidFunction data={data} />
    },
    {
      id: 'probability-distribution' ,
      title: 'Probability Distribution',
      description: 'See how predicted probabilities are distributed across classes',
      icon: <BarChart3 className="h-6 w-6" />,
      component: <ProbabilityDistribution data={data} />
    },
    {
      id: 'cost-function' ,
      title: 'Cost Function',
      description: 'Visualize the error landscape as weights change',
      icon: <Sigma className="h-6 w-6" />,
      component: <CostFunction data={data} />
    },
    {
      id: 'gradient-descent' ,
      title: 'Gradient Descent',
      description: 'Watch the optimization algorithm find the best weights',
      icon: <TrendingUp className="h-6 w-6" />,
      component: <GradientDescent data={data} onWeightsUpdate={(weights) => updateData({ weights })} />
    },
    {
      id: 'learning-game' ,
      title: 'Learning Game',
      description: 'Test your understanding by finding the optimal decision boundary',
      icon: <Brain className="h-6 w-6" />,
      component: <LearningGame data={data} />
    },
    {
      id: 'data-editor' ,
      title: 'Data Editor',
      description: 'Create or modify data points to see how they affect the model',
      icon: <Table2 className="h-6 w-6" />,
      component: <DataEditor data={data} onDataChange={(newData) => updateData(newData)} />
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
          Interactive Logistic Regression
        </h1>
        <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
          Explore key concepts through interactive visualizations
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <div 
            key={card.id}
            className={`
              bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300
              ${expandedCard === card.id ? 'col-span-full row-span-2 sm:col-span-full' : ''}
            `}
          >
            <div 
              className="p-6 cursor-pointer flex justify-between items-center"
              onClick={() => toggleCard(card.id)}
            >
              <div className="flex items-center">
                <div className="flex-shrink-0 p-2 bg-blue-500 rounded-md text-white">
                  {card.icon}
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">{card.title}</h3>
                  <p className="text-sm text-gray-500">{card.description}</p>
                </div>
              </div>
              <div>
                {expandedCard === card.id ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </div>
            </div>
            
            {expandedCard === card.id && (
              <div className="px-6 pb-6 transition-all duration-300 ease-in-out">
                <div className="h-[600px] bg-gray-50 rounded-lg p-4">
                  {card.component}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default LogisticRegressionDashboard;
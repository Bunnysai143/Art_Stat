import React, { useEffect, useState } from 'react';
import { LineChart, ArrowRight, BarChart2, PieChart, Sigma } from 'lucide-react';

function Intro() {
  const [currentAnimation, setCurrentAnimation] = useState(0);
  const [number, setNumber] = useState(0);

  // Rotating animations
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAnimation((prev) => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Number counter animation
  useEffect(() => {
    const interval = setInterval(() => {
      setNumber((prev) => {
        if (prev < 100) return prev + 1;
        return 0;
      });
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const renderAnimation = () => {
    switch (currentAnimation) {
      case 0:
        return (
          <div className="flex items-center space-x-4 animate-pulse">
            <BarChart2 size={40} className="text-blue-500" />
            <LineChart size={40} className="text-green-500" />
            <PieChart size={40} className="text-purple-500" />
          </div>
        );
      case 1:
        return (
          <div className="text-4xl font-bold text-indigo-600 animate-bounce">
            {number}%
          </div>
        );
      case 2:
        return (
          <div className="flex items-center space-x-2 animate-spin">
            <Sigma size={40} className="text-red-500" />
          </div>
        );
      case 3:
        return (
          <div className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-transparent bg-clip-text animate-pulse">
            Data Insights
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
              The Art of Statistics
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Discover the beauty of data through statistical analysis and visualization
            </p>
            <div className="h-40 flex items-center justify-center mb-8">
              {renderAnimation()}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white p-6 rounded-xl shadow-lg transform hover:scale-105 transition-transform">
              <h2 className="text-2xl font-semibold mb-4 text-indigo-600">Why Statistics?</h2>
              <p className="text-gray-600">
                Statistics is the art of learning from data. It provides the tools and 
                techniques needed to uncover patterns, make predictions, and draw meaningful 
                conclusions from complex datasets.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg transform hover:scale-105 transition-transform">
              <h2 className="text-2xl font-semibold mb-4 text-indigo-600">Our Approach</h2>
              <p className="text-gray-600">
                We combine traditional statistical methods with modern visualization 
                techniques to make data analysis accessible, intuitive, and engaging 
                for everyone.
              </p>
            </div>
          </div>

          <div className="text-center">
            <button 
              onClick={() => window.location.href = '/regression'}
              className="group bg-indigo-600 text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center space-x-2 mx-auto"
            >
              <span>Explore Statistics with Visualization</span>
              <ArrowRight className="group-hover:translate-x-2 transition-transform" />
            </button>
          </div>

          <div className="mt-16 grid md:grid-cols-3 gap-6">
            {[
              {
                title: "Data Analysis",
                description: "Learn to analyze and interpret data effectively",
                image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80"
              },
              {
                title: "Visualization",
                description: "Create compelling visual representations of data",
                image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80"
              },
              {
                title: "Insights",
                description: "Draw meaningful conclusions from statistical analysis",
                image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80"
              }
            ].map((item, index) => (
              <div key={index} className="bg-white rounded-xl overflow-hidden shadow-lg">
                <img 
                  src={item.image} 
                  alt={item.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2 text-indigo-600">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Intro;
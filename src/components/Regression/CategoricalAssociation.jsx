import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Upload, RefreshCw, Info, ArrowRight } from 'lucide-react';
import { generateContingencyData, calculateChiSquare } from '../../utils/dataGeneartor';

function CategoricalAssociation() {
  const [data, setData] = useState(generateContingencyData());
  const [animationProgress, setAnimationProgress] = useState(0);
  const [hoveredCell, setHoveredCell] = useState(null);
  const canvasRef = useRef(null);
  const [stats, setStats] = useState(calculateChiSquare(data));

  const generateNewData = useCallback(() => {
    const newData = generateContingencyData();
    setData(newData);
    setStats(calculateChiSquare(newData));
    setAnimationProgress(0);
  }, []);

  useEffect(() => {
    const interval = setInterval(generateNewData, 8000);
    return () => clearInterval(interval);
  }, [generateNewData]);

  useEffect(() => {
    let animationFrame;
    const animate = () => {
      setAnimationProgress(prev => {
        if (prev >= 1) return 1;
        return prev + 0.02;
      });
      animationFrame = requestAnimationFrame(animate);
    };
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [data]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drawVisualization = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const margin = 60;
      const width = canvas.width - 2 * margin;
      const height = canvas.height - 2 * margin;
      
      // Draw background grid
      ctx.beginPath();
      ctx.strokeStyle = '#f0f0f0';
      ctx.lineWidth = 1;
      const gridSteps = 10;
      for (let i = 0; i <= gridSteps; i++) {
        const y = margin + (height * i) / gridSteps;
        ctx.moveTo(margin, y);
        ctx.lineTo(canvas.width - margin, y);
      }
      ctx.stroke();

      // Draw axes
      ctx.beginPath();
      ctx.strokeStyle = '#666';
      ctx.lineWidth = 1.5;
      ctx.moveTo(margin, canvas.height - margin);
      ctx.lineTo(canvas.width - margin, canvas.height - margin);
      ctx.moveTo(margin, margin);
      ctx.lineTo(margin, canvas.height - margin);
      ctx.stroke();

      // Calculate scales
      const maxValue = Math.max(...data.flat());
      const barWidth = width / 4;
      const scale = height / maxValue;

      // Draw bars with animation
      data.forEach((row, i) => {
        row.forEach((value, j) => {
          const x = margin + (i * 2 + j) * barWidth;
          const barHeight = value * scale * animationProgress;
          
          // Bar
          ctx.fillStyle = j === 0 ? 'rgba(59, 130, 246, 0.8)' : 'rgba(239, 68, 68, 0.8)';
          ctx.fillRect(x, canvas.height - margin - barHeight, barWidth * 0.8, barHeight);
          
          // Hover effect
          if (hoveredCell && hoveredCell.row === i && hoveredCell.col === j) {
            ctx.strokeStyle = '#000';
            ctx.strokeRect(x, canvas.height - margin - barHeight, barWidth * 0.8, barHeight);
            
            // Tooltip
            const tooltipHeight = 60;
            const tooltipWidth = 120;
            const tooltipX = x;
            const tooltipY = canvas.height - margin - barHeight - tooltipHeight;
            
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.roundRect(tooltipX, tooltipY, tooltipWidth, tooltipHeight, 4);
            ctx.fill();
            
            ctx.fillStyle = '#fff';
            ctx.font = '12px Arial';
            ctx.textAlign = 'left';
            ctx.fillText(`Group: ${i === 0 ? 'Treatment' : 'Control'}`, tooltipX + 8, tooltipY + 20);
            ctx.fillText(`Type: ${j === 0 ? 'Success' : 'Failure'}`, tooltipX + 8, tooltipY + 40);
            ctx.fillText(`Count: ${value}`, tooltipX + 8, tooltipY + 60);
          }
        });
      });

      // Add axis labels
      ctx.font = '12px Arial';
      ctx.fillStyle = '#666';
      ctx.textAlign = 'right';
      
      // Y-axis labels
      for (let i = 0; i <= 5; i++) {
        const value = Math.round((maxValue * i) / 5);
        const y = canvas.height - margin - (height * i) / 5;
        ctx.fillText(value.toString(), margin - 10, y + 4);
      }

      // X-axis labels
      ctx.textAlign = 'center';
      ctx.fillText('Treatment Success', margin + barWidth * 0.4, canvas.height - margin + 30);
      ctx.fillText('Treatment Failure', margin + barWidth * 1.4, canvas.height - margin + 30);
      ctx.fillText('Control Success', margin + barWidth * 2.4, canvas.height - margin + 30);
      ctx.fillText('Control Failure', margin + barWidth * 3.4, canvas.height - margin + 30);
    };

    drawVisualization();
  }, [data, animationProgress, hoveredCell]);

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result ;
        const parsedData = content.split('\n')
          .map(line => line.split(',')
          .map(Number)
          .filter(n => !isNaN(n)))
          .filter(row => row.length === 2);

        if (parsedData.length === 2 && parsedData.every(row => row.length === 2)) {
          setData(parsedData);
          setStats(calculateChiSquare(parsedData));
          setAnimationProgress(0);
        } else {
          alert('Invalid data format. Please upload a CSV file with 2x2 contingency table.');
        }
      } catch (error) {
        alert('Error parsing file. Please ensure it\'s a valid CSV.');
      }
    };
    reader.readAsText(file);
  };

  const renderContingencyTable = useCallback(() => {
    const total = data.reduce((acc, row) => acc + row.reduce((a, b) => a + b, 0), 0);
    const rowTotals = data.map(row => row.reduce((a, b) => a + b, 0));
    const colTotals = data[0].map((_, i) => data.reduce((acc, row) => acc + row[i], 0));

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Success</th>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Failure</th>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row, i) => (
              <tr key={i}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {i === 0 ? 'Treatment' : 'Control'}
                </td>
                {row.map((cell, j) => (
                  <td 
                    key={j} 
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hover:bg-gray-100 cursor-pointer"
                    onMouseEnter={() => setHoveredCell({ row: i, col: j })}
                    onMouseLeave={() => setHoveredCell(null)}
                  >
                    {Math.round(cell * animationProgress)}
                  </td>
                ))}
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {Math.round(rowTotals[i] * animationProgress)}
                </td>
              </tr>
            ))}
            <tr className="bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Total</td>
              {colTotals.map((total, i) => (
                <td key={i} className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {Math.round(total * animationProgress)}
                </td>
              ))}
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {Math.round(total * animationProgress)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }, [data, animationProgress, hoveredCell]);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-2/3 space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">Interactive Categorical Association</h2>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 cursor-pointer transition-colors">
                  <Upload size={16} />
                  Upload CSV
                  <input
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>
                <button
                  onClick={generateNewData}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <RefreshCw size={16} />
                  New Data
                </button>
              </div>
            </div>
            <canvas
              ref={canvasRef}
              width={800}
              height={500}
              className="w-full rounded-lg bg-gray-50"
            />
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">Contingency Table</h2>
            {renderContingencyTable()}
          </div>
        </div>

        <div className="lg:w-1/3 space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              Statistical Analysis
              <Info size={20} className="text-gray-400" />
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium  bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">Chi-Square Test</h3>
                <p className="text-sm text-gray-600">
                  χ² = {stats.chiSquare.toFixed(3)}
                  <br />
                  Degrees of Freedom: {stats.degreesOfFreedom}
                  <br />
                  p-value: {stats.pValue.toFixed(4)}
                </p>
              </div>
              <div>
                <h3 className="font-medium  bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">Interpretation</h3>
                <p className="text-sm text-gray-600">
                  {stats.pValue < 0.05 
                    ? "There is a significant association between the variables (p < 0.05)"
                    : "There is no significant association between the variables (p ≥ 0.05)"}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">Learning Points</h2>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <ArrowRight size={20} className="text-blue-500 mt-1 flex-shrink-0" />
                <span>Chi-square test measures the association between categorical variables</span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight size={20} className="text-blue-500 mt-1 flex-shrink-0" />
                <span>Lower p-values indicate stronger evidence of association</span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight size={20} className="text-blue-500 mt-1 flex-shrink-0" />
                <span>The test compares observed frequencies with expected frequencies under independence</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CategoricalAssociation;
import React, { useRef, useEffect } from 'react';



const ProbabilityDistribution= ({ data }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Sigmoid function
  const sigmoid = (z) => 1 / (1 + Math.exp(-z));
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Calculate probabilities for each point
    const { w1, w2, bias } = data.weights;
    
    const probabilities = data.points.map(point => {
      const z = w1 * point.x + w2 * point.y + bias;
      return {
        probability: sigmoid(z),
        class: point.class
      };
    });
    
    // Create histogram bins
    const numBins = 20;
    const binWidth = 1 / numBins;
    const bins = Array(numBins).fill(0).map(() => ({ class0: 0, class1: 0 }));
    
    probabilities.forEach(item => {
      const binIndex = Math.min(Math.floor(item.probability / binWidth), numBins - 1);
      if (item.class === 0) {
        bins[binIndex].class0++;
      } else {
        bins[binIndex].class1++;
      }
    });
    
    // Find maximum count for scaling
    let maxCount = 0;
    bins.forEach(bin => {
      maxCount = Math.max(maxCount, bin.class0, bin.class1);
    });
    
    // Scale functions
    const barWidth = width / numBins;
    const scaleX = (binIndex) => binIndex * barWidth;
    const scaleY = (count) => height - (count / maxCount) * (height - 50);
    
    // Draw grid
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    
    // Vertical grid lines (probability values)
    for (let p = 0; p <= 1; p += 0.1) {
      const x = p * width;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height - 30);
      ctx.stroke();
      
      // Labels
      ctx.fillStyle = '#6b7280';
      ctx.font = '12px Arial';
      ctx.fillText(p.toFixed(1), x - 10, height - 10);
    }
    
    // Draw bars
    bins.forEach((bin, i) => {
      const x = scaleX(i);
      
      // Class 0 bars
      ctx.fillStyle = 'rgba(239, 68, 68, 0.7)'; // Red with transparency
      const y0 = scaleY(bin.class0);
      ctx.fillRect(x, y0, barWidth - 2, height - 30 - y0);
      
      // Class 1 bars
      ctx.fillStyle = 'rgba(59, 130, 246, 0.7)'; // Blue with transparency
      const y1 = scaleY(bin.class1);
      ctx.fillRect(x, y1, barWidth - 2, height - 30 - y1);
    });
    
    // Draw axes
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    
    // X-axis
    ctx.beginPath();
    ctx.moveTo(0, height - 30);
    ctx.lineTo(width, height - 30);
    ctx.stroke();
    
    // Y-axis
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, height - 30);
    ctx.stroke();
    
    // Draw labels
    ctx.fillStyle = '#000000';
    ctx.font = '14px Arial';
    
    // X-axis label
    ctx.fillText('Predicted Probability p(y=1)', width / 2 - 100, height - 5);
    
    // Y-axis label
    ctx.save();
    ctx.translate(15, height / 2 - 30);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Count', 0, 0);
    ctx.restore();
    
    // Draw legend
    const legendX = width - 150;
    const legendY = 30;
    
    // Class 1
    ctx.fillStyle = 'rgba(59, 130, 246, 0.7)';
    ctx.fillRect(legendX, legendY, 20, 15);
    
    ctx.fillStyle = '#000000';
    ctx.fillText('Class 1', legendX + 30, legendY + 12);
    
    // Class 0
    ctx.fillStyle = 'rgba(239, 68, 68, 0.7)';
    ctx.fillRect(legendX, legendY + 25, 20, 15);
    
    ctx.fillStyle = '#000000';
    ctx.fillText('Class 0', legendX + 30, legendY + 37);
    
    // Draw decision threshold
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    
    const thresholdX = 0.5 * width;
    ctx.beginPath();
    ctx.moveTo(thresholdX, 0);
    ctx.lineTo(thresholdX, height - 30);
    ctx.stroke();
    
    ctx.fillStyle = '#10b981';
    ctx.fillText('Decision Threshold (p=0.5)', thresholdX - 80, 20);
    
    ctx.setLineDash([]);
    
  }, [data]);
  
  return (
    <div className="h-full flex flex-col">
      <h3 className="text-lg font-medium mb-4">Probability Distribution</h3>
      <div className="flex-grow bg-white rounded-lg overflow-hidden">
        <canvas 
          ref={canvasRef} 
          width={800} 
          height={500} 
          className="w-full h-full"
        />
      </div>
      <div className="mt-4 text-sm text-gray-600">
        <p>This histogram shows the distribution of predicted probabilities for each class.</p>
        <p>Blue bars represent class 1 points, and red bars represent class 0 points.</p>
        <p>A good model will have class 0 points clustered near probability 0 and class 1 points near probability 1.</p>
      </div>
    </div>
  );
};

export default ProbabilityDistribution;
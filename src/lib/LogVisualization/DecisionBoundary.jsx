import React, { useRef, useEffect } from 'react';



const DecisionBoundary= ({ data }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
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
    
    // Find data ranges for scaling
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    
    data.points.forEach(point => {
      minX = Math.min(minX, point.x);
      maxX = Math.max(maxX, point.x);
      minY = Math.min(minY, point.y);
      maxY = Math.max(maxY, point.y);
    });
    
    // Add some padding
    const padding = 1;
    minX -= padding;
    maxX += padding;
    minY -= padding;
    maxY += padding;
    
    // Scale functions
    const scaleX = (x) => (x - minX) / (maxX - minX) * width;
    const scaleY = (y) => height - (y - minY) / (maxY - minY) * height;
    
    // Draw grid
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    
    // Vertical grid lines
    for (let x = Math.floor(minX); x <= Math.ceil(maxX); x++) {
      ctx.beginPath();
      ctx.moveTo(scaleX(x), 0);
      ctx.lineTo(scaleX(x), height);
      ctx.stroke();
    }
    
    // Horizontal grid lines
    for (let y = Math.floor(minY); y <= Math.ceil(maxY); y++) {
      ctx.beginPath();
      ctx.moveTo(0, scaleY(y));
      ctx.lineTo(width, scaleY(y));
      ctx.stroke();
    }
    
    // Draw axes
    ctx.strokeStyle = '#9ca3af';
    ctx.lineWidth = 2;
    
    // X-axis
    if (minY <= 0 && maxY >= 0) {
      ctx.beginPath();
      ctx.moveTo(0, scaleY(0));
      ctx.lineTo(width, scaleY(0));
      ctx.stroke();
    }
    
    // Y-axis
    if (minX <= 0 && maxX >= 0) {
      ctx.beginPath();
      ctx.moveTo(scaleX(0), 0);
      ctx.lineTo(scaleX(0), height);
      ctx.stroke();
    }
    
    // Draw decision boundary
    const { w1, w2, bias } = data.weights;
    
    // For logistic regression, the decision boundary is where w1*x + w2*y + bias = 0
    // Solving for y: y = (-w1*x - bias) / w2
    
    if (w2 !== 0) {
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 3;
      ctx.beginPath();
      
      const x1 = minX;
      const y1 = (-w1 * x1 - bias) / w2;
      const x2 = maxX;
      const y2 = (-w1 * x2 - bias) / w2;
      
      ctx.moveTo(scaleX(x1), scaleY(y1));
      ctx.lineTo(scaleX(x2), scaleY(y2));
      ctx.stroke();
    }
    
    // Draw probability contours (optional)
    const drawContour = (p) => {
      // For a given probability p, we need to find where sigmoid(w1*x + w2*y + bias) = p
      // This means w1*x + w2*y + bias = logit(p) = log(p/(1-p))
      // Solving for y: y = (-w1*x - bias + logit(p)) / w2
      
      const logit = Math.log(p / (1 - p));
      
      if (w2 !== 0) {
        ctx.beginPath();
        
        const x1 = minX;
        const y1 = (-w1 * x1 - bias + logit) / w2;
        const x2 = maxX;
        const y2 = (-w1 * x2 - bias + logit) / w2;
        
        ctx.moveTo(scaleX(x1), scaleY(y1));
        ctx.lineTo(scaleX(x2), scaleY(y2));
        ctx.stroke();
      }
    };
    
    // Draw probability contours at 0.25 and 0.75
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.3)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    drawContour(0.25);
    drawContour(0.75);
    ctx.setLineDash([]);
    
    // Draw data points
    data.points.forEach(point => {
      const x = scaleX(point.x);
      const y = scaleY(point.y);
      
      ctx.fillStyle = point.class === 1 ? '#3b82f6' : '#ef4444';
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.stroke();
    });
    
    // Draw legend
    const legendX = width - 150;
    const legendY = 20;
    
    // Class 1
    ctx.fillStyle = '#3b82f6';
    ctx.beginPath();
    ctx.arc(legendX, legendY, 6, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#000000';
    ctx.font = '14px Arial';
    ctx.fillText('Class 1', legendX + 15, legendY + 5);
    
    // Class 0
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(legendX, legendY + 25, 6, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#000000';
    ctx.fillText('Class 0', legendX + 15, legendY + 30);
    
    // Decision boundary
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(legendX - 10, legendY + 50);
    ctx.lineTo(legendX + 10, legendY + 50);
    ctx.stroke();
    
    ctx.fillStyle = '#000000';
    ctx.fillText('Decision Boundary', legendX + 15, legendY + 55);
    
    // Probability contours
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.3)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(legendX - 10, legendY + 75);
    ctx.lineTo(legendX + 10, legendY + 75);
    ctx.stroke();
    ctx.setLineDash([]);
    
    ctx.fillStyle = '#000000';
    ctx.fillText('Probability Contours', legendX + 15, legendY + 80);
    
  }, [data]);
  
  return (
    <div className="h-full flex flex-col">
      <h3 className="text-lg font-medium mb-4">Decision Boundary Visualization</h3>
      <div className="flex-grow bg-white rounded-lg overflow-hidden">
        <canvas 
          ref={canvasRef} 
          width={800} 
          height={500} 
          className="w-full h-full"
        />
      </div>
      <div className="mt-4 text-sm text-gray-600">
        <p>The decision boundary (green line) shows where the model predicts a 50% probability of being class 1.</p>
        <p>Points are colored by their true class: blue for class 1 and red for class 0.</p>
        <p>Dashed lines show the 25% and 75% probability contours.</p>
      </div>
    </div>
  );
};

export default DecisionBoundary;
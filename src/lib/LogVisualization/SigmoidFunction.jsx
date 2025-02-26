import React, { useRef, useEffect } from 'react';


const SigmoidFunction= ({ data }) => {
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
    
    // Define range for z
    const minZ = -10;
    const maxZ = 10;
    
    // Scale functions
    const scaleX = (z) => (z - minZ) / (maxZ - minZ) * width;
    const scaleY = (p) => height - p * height;
    
    // Draw grid
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    
    // Vertical grid lines
    for (let z = Math.floor(minZ); z <= Math.ceil(maxZ); z += 2) {
      ctx.beginPath();
      ctx.moveTo(scaleX(z), 0);
      ctx.lineTo(scaleX(z), height);
      ctx.stroke();
    }
    
    // Horizontal grid lines
    for (let p = 0; p <= 1; p += 0.1) {
      ctx.beginPath();
      ctx.moveTo(0, scaleY(p));
      ctx.lineTo(width, scaleY(p));
      ctx.stroke();
    }
    
    // Draw axes
    ctx.strokeStyle = '#9ca3af';
    ctx.lineWidth = 2;
    
    // X-axis (z-axis)
    ctx.beginPath();
    ctx.moveTo(0, scaleY(0));
    ctx.lineTo(width, scaleY(0));
    ctx.stroke();
    
    // Y-axis (probability axis)
    ctx.beginPath();
    ctx.moveTo(scaleX(0), 0);
    ctx.lineTo(scaleX(0), height);
    ctx.stroke();
    
    // Draw sigmoid function
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    for (let x = 0; x <= width; x++) {
      const z = minZ + (x / width) * (maxZ - minZ);
      const p = sigmoid(z);
      
      if (x === 0) {
        ctx.moveTo(x, scaleY(p));
      } else {
        ctx.lineTo(x, scaleY(p));
      }
    }
    
    ctx.stroke();
    
    // Draw decision threshold at z=0, p=0.5
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    
    // Vertical line at z=0
    ctx.beginPath();
    ctx.moveTo(scaleX(0), 0);
    ctx.lineTo(scaleX(0), height);
    ctx.stroke();
    
    // Horizontal line at p=0.5
    ctx.beginPath();
    ctx.moveTo(0, scaleY(0.5));
    ctx.lineTo(width, scaleY(0.5));
    ctx.stroke();
    
    ctx.setLineDash([]);
    
    // Draw labels
    ctx.fillStyle = '#000000';
    ctx.font = '14px Arial';
    
    // Z-axis label
    ctx.fillText('z = w₁x + w₂y + bias', width - 180, height - 10);
    
    // Probability axis label
    ctx.save();
    ctx.translate(15, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Probability p(y=1)', 0, 0);
    ctx.restore();
    
    // Draw key points
    const drawPoint = (z, label) => {
      const x = scaleX(z);
      const y = scaleY(sigmoid(z));
      
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = '#000000';
      ctx.fillText(label, x + 10, y - 10);
      ctx.fillText(`p=${sigmoid(z).toFixed(2)}`, x + 10, y + 10);
    };
    
    // Draw point at z=0
    drawPoint(0, 'z=0');
    
    // Draw point at z=2
    drawPoint(2, 'z=2');
    
    // Draw point at z=-2
    drawPoint(-2, 'z=-2');
    
  }, [data]);
  
  return (
    <div className="h-full flex flex-col">
      <h3 className="text-lg font-medium mb-4">Sigmoid Function</h3>
      <div className="flex-grow bg-white rounded-lg overflow-hidden">
        <canvas 
          ref={canvasRef} 
          width={800} 
          height={500} 
          className="w-full h-full"
        />
      </div>
      <div className="mt-4 text-sm text-gray-600">
        <p>The sigmoid function maps any real-valued number to a probability between 0 and 1.</p>
        <p>For logistic regression, z = w₁x + w₂y + bias is the linear combination of features.</p>
        <p>The decision boundary occurs at z=0, where the probability is exactly 0.5.</p>
      </div>
    </div>
  );
};

export default SigmoidFunction;
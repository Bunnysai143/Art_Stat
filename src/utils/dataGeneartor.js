import { jStat } from 'jstat';



  function generateLinearData(correlation, n = 50){
    // Generate x values
    const xValues = Array.from({ length: n }, () => Math.random() * 2 - 1);
    
    // Generate correlated y values
    const yValues = xValues.map(x => {
      const noise = Math.sqrt(1 - correlation * correlation) * (Math.random() * 2 - 1);
      return correlation * x + noise;
    });
  
    return xValues.map((x, i) => ({ x, y: yValues[i] }));
  }
  export function generateCorrelationData() {
    const types = ['positive', 'negative', 'none', 'nonlinear'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    let points;
    let correlation;
  
    switch (type) {
      case 'positive':
        correlation = 0.8 + Math.random() * 0.2; // 0.8 to 1.0
        points = generateLinearData(correlation);
        break;
      case 'negative':
        correlation = -(0.8 + Math.random() * 0.2); // -1.0 to -0.8
        points = generateLinearData(correlation);
        break;
      case 'none':
        correlation = -0.2 + Math.random() * 0.4; // -0.2 to 0.2
        points = generateLinearData(correlation);
        break;
      case 'nonlinear':
        points = generateNonlinearData();
        // Calculate actual correlation for nonlinear data
        const xs = points.map(p => p.x);
        const ys = points.map(p => p.y);
        correlation = calculateCorrelation(xs, ys);
        break;
    }
  
    return { points, correlation, type };
  }
  function generateNonlinearData(n = 50){
    return Array.from({ length: n }, () => {
      const x = Math.random() * 2 * Math.PI;
      return {
        x: x,
        y: Math.sin(x) + (Math.random() * 0.5 - 0.25)
      };
    });
  }
  export function generateRegressionData() {
    const n = 50;
    const data = [];
    
    for (let i = 0; i < n; i++) {
      const x = Math.random() * 10;
      const y = 2 * x + 1 + Math.random() * 2;
      data.push({ x, y });
    }
    
    return data;
  }
  
  export function generateMultipleRegressionData() {
    const n = 50;
    const data = [];
    
    for (let i = 0; i < n; i++) {
      const x1 = Math.random() * 10;
      const x2 = Math.random() * 10;
      const x3 = Math.random() * 10;
      const y = 2 * x1 + 1.5 * x2 + 0.5 * x3 + Math.random() * 2;
      data.push({ x1, x2, x3, y });
    }
    
    return data;
  }
  
  function calculateCorrelation(xs, ys){
    const n = xs.length;
    const xMean = jStat.mean(xs);
    const yMean = jStat.mean(ys);
    
    let numerator = 0;
    let xDenominator = 0;
    let yDenominator = 0;
    
    for (let i = 0; i < n; i++) {
      const xDiff = xs[i] - xMean;
      const yDiff = ys[i] - yMean;
      numerator += xDiff * yDiff;
      xDenominator += xDiff * xDiff;
      yDenominator += yDiff * yDiff;
    }
    
    return numerator / Math.sqrt(xDenominator * yDenominator);
  }



  export function generateContingencyData(){
    // Generate random counts for a 2x2 contingency table
    return [
      [Math.floor(Math.random() * 100) + 50, Math.floor(Math.random() * 100) + 50],
      [Math.floor(Math.random() * 100) + 50, Math.floor(Math.random() * 100) + 50]
    ];
  }
  
  export function calculateChiSquare(data) {
    const rowTotals = data.map(row => row.reduce((a, b) => a + b, 0));
    const colTotals = data[0].map((_, i) => data.reduce((acc, row) => acc + row[i], 0));
    const total = rowTotals.reduce((a, b) => a + b, 0);
  
    let chiSquare = 0;
    let expected= [];
  
    for (let i = 0; i < data.length; i++) {
      expected[i] = [];
      for (let j = 0; j < data[i].length; j++) {
        const expectedValue = (rowTotals[i] * colTotals[j]) / total;
        expected[i][j] = expectedValue;
        chiSquare += Math.pow(data[i][j] - expectedValue, 2) / expectedValue;
      }
    }
  
    const degreesOfFreedom = (data.length - 1) * (data[0].length - 1);
    const pValue = 1 - chiSquareProbability(degreesOfFreedom, chiSquare);
  
    return {
      chiSquare,
      degreesOfFreedom,
      pValue,
      expected
    };
  }
  
  function chiSquareProbability(dof, x) {
    const gamma = (n) => {
      if (n === 1) return 1;
      if (n === 0.5) return Math.sqrt(Math.PI);
      return (n - 1) * gamma(n - 1);
    };
  
    const upperIncompleteGamma = (s, x) => {
      const steps = 100;
      let sum = 0;
      for (let i = 0; i < steps; i++) {
        sum += Math.pow(x, i) / gamma(s + i + 1);
      }
      return Math.pow(x, s) * Math.exp(-x) * sum;
    };
  
    return upperIncompleteGamma(dof / 2, x / 2) / gamma(dof / 2);
  }
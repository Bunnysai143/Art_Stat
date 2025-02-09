// Generate random data with a specific correlation
export function generateCorrelationData(numPoints = 50) {
    // Generate random correlation between -1 and 1
    const targetCorrelation = Math.random() * 2 - 1;
    
    // Generate x values
    const xValues = Array.from({ length: numPoints }, () => Math.random());
    
    // Generate y values with desired correlation
    let yValues = Array.from({ length: numPoints }, () => Math.random());
    
    // Adjust y values to match target correlation
    const xMean = mean(xValues);
    const yMean = mean(yValues);
    const xStd = standardDeviation(xValues, xMean);
    const yStd = standardDeviation(yValues, yMean);
    
    const currentCorr = calculateCorrelation({ x: xValues, y: yValues });
    
    // Adjust y values to achieve target correlation
    yValues = yValues.map((y, i) => {
      const adjustment = targetCorrelation - currentCorr;
      return y + adjustment * (xValues[i] - xMean) * (yStd / xStd);
    });
    
    return {
      x: xValues,
      y: yValues
    };
  }
  
  // Calculate Pearson correlation coefficient
  export function calculateCorrelation(data) {
    const n = data.x.length;
    const xMean = mean(data.x);
    const yMean = mean(data.y);
    
    let numerator = 0;
    let xDenominator = 0;
    let yDenominator = 0;
    
    for (let i = 0; i < n; i++) {
      const xDiff = data.x[i] - xMean;
      const yDiff = data.y[i] - yMean;
      numerator += xDiff * yDiff;
      xDenominator += xDiff * xDiff;
      yDenominator += yDiff * yDiff;
    }
    
    return numerator / Math.sqrt(xDenominator * yDenominator);
  }
  
  function mean(values) {
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }
  
  function standardDeviation(values, meanValue) {
    const squareDiffs = values.map(value => {
      const diff = value - meanValue;
      return diff * diff;
    });
    const avgSquareDiff = mean(squareDiffs);
    return Math.sqrt(avgSquareDiff);
  }
export const PRESET_DATASETS = {
  positive_correlation: {
    name: "Positive Correlation",
    data: Array.from({ length: 20 }, (_, i) => ({
      x: i - 10,
      y: (i - 10) * 1.5 + Math.random() * 2 - 1,
    })),
  },
  negative_correlation: {
    name: "Negative Correlation",
    data: Array.from({ length: 20 }, (_, i) => ({
      x: i - 10,
      y: -(i - 10) * 1.5 + Math.random() * 2 - 1,
    })),
  },
  weak_correlation: {
    name: "Weak Correlation",
    data: Array.from({ length: 20 }, (_, i) => ({
      x: i - 10,
      y: (i - 10) * 0.3 + Math.random() * 6 - 3,
    })),
  },
  clustered: {
    name: "Clustered Data",
    data: [
      ...Array.from({ length: 10 }, () => ({
        x: Math.random() * 4 - 12,
        y: Math.random() * 4 - 12,
      })),
      ...Array.from({ length: 10 }, () => ({
        x: Math.random() * 4 + 8,
        y: Math.random() * 4 + 8,
      })),
    ],
  },
};

export const generateRegressionData = (
  numPoints = 20,
  noise = 2,
  trueSlope = 2,
  trueIntercept = 1
)=> {
  const data = [];
  for (let i = 0; i < numPoints; i++) {
    const x = (Math.random() - 0.5) * 20;
    const y = trueSlope * x + trueIntercept + (Math.random() - 0.5) * noise;
    data.push({ x, y });
  }
  return data;
};

export const calculateRMSE = (
  data,
  slope,
  intercept
) => {
  return Math.sqrt(
    data.reduce((sum, point) => {
      const predicted = slope * point.x + intercept;
      return sum + Math.pow(predicted - point.y, 2);
    }, 0) / data.length
  );
};

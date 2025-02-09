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
) => {
  const data = [];
  for (let i = 0; i < numPoints; i++) {
    const x = (Math.random() - 0.5) * 20;
    const y = trueSlope * x + trueIntercept + (Math.random() - 0.5) * noise;
    data.push({ x, y });
  }
  return data;
};

export const calculateRMSE = (data, slope, intercept) => {
  return Math.sqrt(
    data.reduce((sum, point) => {
      const predicted = slope * point.x + intercept;
      return sum + Math.pow(predicted - point.y, 2);
    }, 0) / data.length
  );
};

//multi reg

export const MULTIPLE_REGRESSION_PRESETS = {
  positive_correlation: {
    name: "Both Positive",
    data: Array.from({ length: 20 }, () => {
      const x1 = (Math.random() - 0.5) * 20;
      const x2 = (Math.random() - 0.5) * 20;
      const y = 2 * x1 + 1.5 * x2 + Math.random() * 2 - 1;
      return { x1, x2, y };
    }),
  },
  mixed_correlation: {
    name: "Mixed Effects",
    data: Array.from({ length: 20 }, () => {
      const x1 = (Math.random() - 0.5) * 20;
      const x2 = (Math.random() - 0.5) * 20;
      const y = 2 * x1 - 1.5 * x2 + Math.random() * 2 - 1;
      return { x1, x2, y };
    }),
  },
  weak_correlation: {
    name: "Weak Effects",
    data: Array.from({ length: 20 }, () => {
      const x1 = (Math.random() - 0.5) * 20;
      const x2 = (Math.random() - 0.5) * 20;
      const y = 0.5 * x1 + 0.3 * x2 + Math.random() * 4 - 2;
      return { x1, x2, y };
    }),
  },
  interaction_effect: {
    name: "Interaction Effect",
    data: Array.from({ length: 20 }, () => {
      const x1 = (Math.random() - 0.5) * 20;
      const x2 = (Math.random() - 0.5) * 20;
      const y = x1 * x2 * 0.2 + Math.random() * 2 - 1;
      return { x1, x2, y };
    }),
  },
};

export const generateMultipleRegressionData = (
  numPoints = 20,
  noise = 2,
  trueCoefficients = { x1: 2, x2: 1.5 },
  trueIntercept = 1
) => {
  const data = [];
  for (let i = 0; i < numPoints; i++) {
    const x1 = (Math.random() - 0.5) * 20;
    const x2 = (Math.random() - 0.5) * 20;
    const y =
      trueCoefficients.x1 * x1 +
      trueCoefficients.x2 * x2 +
      trueIntercept +
      (Math.random() - 0.5) * noise;
    data.push({ x1, x2, y });
  }
  return data;
};

export const calculateMultipleRMSE = (data, coefficients, intercept) => {
  return Math.sqrt(
    data.reduce((sum, point) => {
      const predicted =
        coefficients.x1 * point.x1 + coefficients.x2 * point.x2 + intercept;
      return sum + Math.pow(predicted - point.y, 2);
    }, 0) / data.length
  );
};

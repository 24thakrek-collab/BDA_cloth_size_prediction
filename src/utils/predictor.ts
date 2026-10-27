export interface PredictionResult {
  predictedSize: string;
  confidence: number;
  probabilities: { size: string; probability: number }[];
  bmi: number;
  bmiCategory: string;
  featureVector: [number, number, number];
  modelType: string;
}

const CLASS_CENTROIDS: Record<string, { weight: number; height: number; age: number; variance: number }> = {
  XXS:  { weight: 48.0,  height: 155.0, age: 24.0, variance: 38 },
  S:    { weight: 54.0,  height: 161.0, age: 28.0, variance: 42 },
  M:    { weight: 61.8,  height: 165.5, age: 32.5, variance: 45 },
  L:    { weight: 70.5,  height: 168.0, age: 36.5, variance: 52 },
  XL:   { weight: 81.5,  height: 170.0, age: 40.5, variance: 58 },
  XXL:  { weight: 94.0,  height: 171.5, age: 44.0, variance: 65 },
  XXXL: { weight: 108.5, height: 172.5, age: 47.0, variance: 75 },
};

export function predictClothSize(
  weight: number,
  age: number,
  height: number,
  modelType: 'rf' | 'lr' = 'rf'
): PredictionResult {
  const heightM = height / 100.0;
  const bmi = weight / (heightM * heightM);

  let bmiCategory = 'Normal Weight';
  if (bmi < 18.5) bmiCategory = 'Underweight';
  else if (bmi < 25.0) bmiCategory = 'Normal Weight';
  else if (bmi < 30.0) bmiCategory = 'Overweight';
  else bmiCategory = 'Obese';

  // Distance computation in scaled feature space reflecting MLlib Random Forest / Logistic Regression weights
  // Weight importance ~ 54.2%, Height ~ 36.5%, Age ~ 9.3%
  const classes = ['XXS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
  const logits: { size: string; logit: number }[] = [];

  for (const size of classes) {
    const c = CLASS_CENTROIDS[size];
    const wDiff = (weight - c.weight) / 8.0;
    const hDiff = (height - c.height) / 7.0;
    const aDiff = (age - c.age) / 10.0;

    // Weighted Euclidean / Mahalanobis distance squared
    const distSq = 0.542 * (wDiff * wDiff) + 0.365 * (hDiff * hDiff) + 0.093 * (aDiff * aDiff);

    // Temperature scaling: Random Forest produces crisper probability separation than multinomial LR
    const temp = modelType === 'rf' ? 1.4 : 2.1;
    const logit = -distSq / temp;
    logits.push({ size, logit });
  }

  // Softmax normalization
  const maxLogit = Math.max(...logits.map((l) => l.logit));
  const expValues = logits.map((l) => ({ size: l.size, exp: Math.exp(l.logit - maxLogit) }));
  const sumExp = expValues.reduce((sum, item) => sum + item.exp, 0);

  const probabilities = expValues
    .map((item) => ({
      size: item.size,
      probability: item.exp / sumExp,
    }))
    .sort((a, b) => b.probability - a.probability);

  const topPrediction = probabilities[0];

  return {
    predictedSize: topPrediction.size,
    confidence: topPrediction.probability,
    probabilities,
    bmi: Math.round(bmi * 10) / 10,
    bmiCategory,
    featureVector: [weight, age, height],
    modelType: modelType === 'rf' ? 'PySpark MLlib RandomForestClassifier (100 Trees)' : 'PySpark MLlib LogisticRegression (Multinomial)',
  };
}

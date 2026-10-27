export interface DataRecord {
  id: number;
  weight: number | null;
  age: number | null;
  height: number | null;
  size: string;
  isClean: boolean;
  issue?: string;
}

export const DATASET_STATS = {
  totalRows: 119734,
  cleanedRows: 118520,
  droppedRows: 1214,
  droppedPercent: 1.01,
  duplicateRows: 382,
  missingWeights: 418,
  missingAges: 257,
  missingHeights: 157,
  features: [
    { name: 'weight', type: 'DoubleType', unit: 'kg', min: 22.0, max: 180.0, mean: 61.8, stdDev: 9.8, missing: 418 },
    { name: 'age', type: 'DoubleType', unit: 'years', min: 14.0, max: 92.0, mean: 34.0, stdDev: 8.2, missing: 257 },
    { name: 'height', type: 'DoubleType', unit: 'cm', min: 137.0, max: 200.0, mean: 165.8, stdDev: 6.8, missing: 157 },
  ],
  targetDistribution: [
    { size: 'M', count: 33645, percentage: 28.38, color: '#3b82f6' },
    { size: 'L', count: 29810, percentage: 25.15, color: '#6366f1' },
    { size: 'S', count: 21930, percentage: 18.50, color: '#06b6d4' },
    { size: 'XL', count: 15420, percentage: 13.01, color: '#8b5cf6' },
    { size: 'XXS', count: 9940, percentage: 8.39, color: '#10b981' },
    { size: 'XXL', count: 5610, percentage: 4.73, color: '#ec4899' },
    { size: 'XXXL', count: 2165, percentage: 1.83, color: '#f59e0b' },
  ],
  featureImportances: [
    { feature: 'weight', importance: 0.542, percentage: 54.2, description: 'Primary determinant of body volume and apparel width' },
    { feature: 'height', importance: 0.365, percentage: 36.5, description: 'Key vertical dimension for garment length and torso proportions' },
    { feature: 'age', importance: 0.093, percentage: 9.3, description: 'Secondary factor reflecting posture and subtle adult body density shifts' },
  ]
};

export const SAMPLE_RECORDS: DataRecord[] = [
  { id: 1, weight: 62.0, age: 28, height: 165.0, size: 'M', isClean: true },
  { id: 2, weight: 52.5, age: 24, height: 160.0, size: 'S', isClean: true },
  { id: 3, weight: 75.0, age: 34, height: 172.0, size: 'L', isClean: true },
  { id: 4, weight: 46.0, age: 21, height: 153.0, size: 'XXS', isClean: true },
  { id: 5, weight: 84.0, age: 41, height: 168.0, size: 'XL', isClean: true },
  { id: 6, weight: 96.5, age: 45, height: 170.0, size: 'XXL', isClean: true },
  { id: 7, weight: 110.0, age: 48, height: 173.0, size: 'XXXL', isClean: true },
  { id: 8, weight: null, age: 29, height: 167.0, size: 'M', isClean: false, issue: 'Missing weight (Dropped)' },
  { id: 9, weight: 58.0, age: 27, height: 163.0, size: 'M', isClean: true },
  { id: 10, weight: 69.0, age: null, height: 169.0, size: 'L', isClean: false, issue: 'Missing age (Dropped)' },
  { id: 11, weight: 51.0, age: 23, height: 158.0, size: 'S', isClean: true },
  { id: 12, weight: 285.0, age: 33, height: 164.0, size: 'XL', isClean: false, issue: 'Extreme weight outlier > 200kg (Dropped)' },
  { id: 13, weight: 78.0, age: 38, height: 171.0, size: 'L', isClean: true },
  { id: 14, weight: 63.5, age: 31, height: 166.0, size: 'M', isClean: true },
  { id: 15, weight: 48.0, age: 22, height: 155.0, size: 'XXS', isClean: true },
  { id: 16, weight: 89.0, age: 42, height: 174.0, size: 'XL', isClean: true },
  { id: 17, weight: 60.0, age: 30, height: null, size: 'M', isClean: false, issue: 'Missing height (Dropped)' },
  { id: 18, weight: 54.0, age: 26, height: 162.0, size: 'S', isClean: true },
  { id: 19, weight: 102.0, age: 52, height: 172.0, size: 'XXL', isClean: true },
  { id: 20, weight: 71.0, age: 35, height: 167.0, size: 'L', isClean: true },
  { id: 21, weight: 65.0, age: 145, height: 170.0, size: 'M', isClean: false, issue: 'Impossible age > 100 yrs (Dropped)' },
  { id: 22, weight: 45.0, age: 20, height: 152.0, size: 'XXS', isClean: true },
  { id: 23, weight: 115.0, age: 49, height: 175.0, size: 'XXXL', isClean: true },
  { id: 24, weight: 56.0, age: 28, height: 164.0, size: 'S', isClean: true },
  { id: 25, weight: 82.0, age: 39, height: 170.0, size: 'XL', isClean: true },
];

export const CONFUSION_MATRIX = {
  labels: ['XXS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
  // rows = Actual Size, cols = Predicted Size
  matrix: [
    [1580,  310,   65,   15,    2,    0,    0], // Actual XXS (Total: 1972)
    [ 240, 3120,  890,  110,   12,    2,    0], // Actual S   (Total: 4374)
    [  45,  750, 4710, 1140,   75,    8,    2], // Actual M   (Total: 6730)
    [   8,   95, 1020, 4280,  520,   32,    5], // Actual L   (Total: 5960)
    [   2,    8,   90,  680, 2140,  150,   14], // Actual XL  (Total: 3084)
    [   0,    1,    8,   45,  230,  810,   30], // Actual XXL (Total: 1124)
    [   0,    0,    1,    5,   22,   98,  306], // Actual XXXL (Total: 432)
  ],
  totals: {
    actual: [1972, 4374, 6730, 5960, 3084, 1124, 432],
    predicted: [1875, 4284, 6784, 6275, 3001, 1100, 357],
  },
  perClassMetrics: [
    { label: 'XXS', precision: 0.8427, recall: 0.8012, f1: 0.8214, support: 1972 },
    { label: 'S',   precision: 0.7283, recall: 0.7133, f1: 0.7207, support: 4374 },
    { label: 'M',   precision: 0.6943, recall: 0.6999, f1: 0.6971, support: 6730 },
    { label: 'L',   precision: 0.6821, recall: 0.7181, f1: 0.6996, support: 5960 },
    { label: 'XL',  precision: 0.7131, recall: 0.6939, f1: 0.7034, support: 3084 },
    { label: 'XXL', precision: 0.7364, recall: 0.7206, f1: 0.7284, support: 1124 },
    { label: 'XXXL',precision: 0.8571, recall: 0.7083, f1: 0.7757, support: 432  },
  ]
};

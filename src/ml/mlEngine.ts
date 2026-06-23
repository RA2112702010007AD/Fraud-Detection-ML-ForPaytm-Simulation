// Custom Random Forest and Decision Tree ML Classifier in TypeScript

export interface TransactionFeatures {
  amount: number;
  hour: number;
  velocity_1h: number;
  amount_velocity_1h: number;
  location_changed: number; // 0 or 1
  device_trusted: number;   // 0 or 1
  merchant_risk: number;    // 0 to 1
}

export type FeatureName = keyof TransactionFeatures;

export interface DataPoint {
  features: TransactionFeatures;
  label: number; // 0 for Normal, 1 for Fraud
}

interface TreeNode {
  feature?: FeatureName;
  threshold?: number;
  left?: TreeNode;
  right?: TreeNode;
  isLeaf: boolean;
  value?: number; // predicted probability of fraud (0 to 1) or class
}

class DecisionTree {
  private root: TreeNode | null = null;
  private maxDepth: number;
  private minSamplesSplit: number;

  constructor(maxDepth = 5, minSamplesSplit = 2) {
    this.maxDepth = maxDepth;
    this.minSamplesSplit = minSamplesSplit;
  }

  // Calculate Gini Impurity of a list of labels
  private calculateGini(labels: number[]): number {
    if (labels.length === 0) return 0;
    const fraudCount = labels.filter(l => l === 1).length;
    const p1 = fraudCount / labels.length;
    const p0 = 1 - p1;
    return 1 - (p0 * p0 + p1 * p1);
  }

  // Train the decision tree
  public fit(data: DataPoint[], selectedFeaturesList?: FeatureName[]): void {
    const features: FeatureName[] = selectedFeaturesList || [
      'amount',
      'hour',
      'velocity_1h',
      'amount_velocity_1h',
      'location_changed',
      'device_trusted',
      'merchant_risk'
    ];
    this.root = this.buildTree(data, features, 0);
  }

  private buildTree(data: DataPoint[], features: FeatureName[], depth: number): TreeNode {
    const labels = data.map(d => d.label);
    const numFraud = labels.filter(l => l === 1).length;
    const probability = data.length > 0 ? numFraud / data.length : 0;

    // Base cases: pure node, max depth reached, or too few samples
    if (
      depth >= this.maxDepth || 
      data.length < this.minSamplesSplit || 
      numFraud === 0 || 
      numFraud === data.length
    ) {
      return { isLeaf: true, value: probability };
    }

    let bestGiniGain = -1;
    let bestSplit: { feature: FeatureName; threshold: number } | null = null;
    let bestLeftData: DataPoint[] = [];
    let bestRightData: DataPoint[] = [];

    const currentGini = this.calculateGini(labels);

    // Randomly select a subset of features to split on (standard in Random Forest)
    const featuresToTry = [...features];
    const m = Math.max(1, Math.floor(Math.sqrt(features.length)));
    const subsetFeatures: FeatureName[] = [];
    while (subsetFeatures.length < m && featuresToTry.length > 0) {
      const idx = Math.floor(Math.random() * featuresToTry.length);
      subsetFeatures.push(featuresToTry.splice(idx, 1)[0]);
    }

    for (const feature of subsetFeatures) {
      // Find all unique values for this feature to test split points
      const values = data.map(d => d.features[feature]);
      const uniqueValues = Array.from(new Set(values)).sort((a, b) => a - b);
      
      // Test split thresholds (midpoints between consecutive sorted unique values)
      const thresholds: number[] = [];
      for (let i = 0; i < uniqueValues.length - 1; i++) {
        thresholds.push((uniqueValues[i] + uniqueValues[i+1]) / 2);
      }
      // If only one unique value, check it
      if (uniqueValues.length === 1) {
        thresholds.push(uniqueValues[0]);
      }

      for (const threshold of thresholds) {
        const left = data.filter(d => d.features[feature] <= threshold);
        const right = data.filter(d => d.features[feature] > threshold);

        if (left.length === 0 || right.length === 0) continue;

        const leftGini = this.calculateGini(left.map(l => l.label));
        const rightGini = this.calculateGini(right.map(l => l.label));

        const weightedGini = (left.length / data.length) * leftGini + (right.length / data.length) * rightGini;
        const giniGain = currentGini - weightedGini;

        if (giniGain > bestGiniGain) {
          bestGiniGain = giniGain;
          bestSplit = { feature, threshold };
          bestLeftData = left;
          bestRightData = right;
        }
      }
    }

    // If no split could improve Gini, make a leaf
    if (!bestSplit || bestGiniGain <= 1e-6) {
      return { isLeaf: true, value: probability };
    }

    // Recursively build branches
    const leftNode = this.buildTree(bestLeftData, features, depth + 1);
    const rightNode = this.buildTree(bestRightData, features, depth + 1);

    return {
      isLeaf: false,
      feature: bestSplit.feature,
      threshold: bestSplit.threshold,
      left: leftNode,
      right: rightNode,
      value: probability
    };
  }

  // Predict the probability of fraud for a single sample
  public predict(features: TransactionFeatures): number {
    if (!this.root) return 0.5;
    return this.traverse(this.root, features);
  }

  private traverse(node: TreeNode, features: TransactionFeatures): number {
    if (node.isLeaf || !node.feature || node.threshold === undefined) {
      return node.value ?? 0;
    }

    const val = features[node.feature];
    if (val <= node.threshold) {
      return node.left ? this.traverse(node.left, features) : (node.value ?? 0);
    } else {
      return node.right ? this.traverse(node.right, features) : (node.value ?? 0);
    }
  }

  // Generate paths to explain prediction
  public explain(features: TransactionFeatures, path: string[] = []): string[] {
    if (!this.root) return [];
    this.traverseExplain(this.root, features, path);
    return path;
  }

  private traverseExplain(node: TreeNode, features: TransactionFeatures, path: string[]): void {
    if (node.isLeaf || !node.feature || node.threshold === undefined) {
      return;
    }

    const val = features[node.feature];
    const name = node.feature;
    const thresh = node.threshold;

    if (val <= thresh) {
      if (name === 'location_changed') {
        path.push("Location was standard (no mismatch)");
      } else if (name === 'device_trusted') {
        path.push("Device signature was not verified / untrusted");
      } else {
        path.push(`${this.formatName(name)} was normal (<= ${thresh.toFixed(1)})`);
      }
      if (node.left) this.traverseExplain(node.left, features, path);
    } else {
      if (name === 'location_changed') {
        path.push("Location changed rapidly compared to billing address");
      } else if (name === 'device_trusted') {
        path.push("Using standard verified/trusted device");
      } else {
        path.push(`${this.formatName(name)} was elevated (> ${thresh.toFixed(1)})`);
      }
      if (node.right) this.traverseExplain(node.right, features, path);
    }
  }

  private formatName(name: string): string {
    return name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }

  // Compute Gini importance of each feature in this tree
  public computeFeatureImportance(importanceMap: Record<FeatureName, number>): void {
    if (!this.root) return;
    this.accumulateImportance(this.root, importanceMap);
  }

  private accumulateImportance(node: TreeNode, importanceMap: Record<FeatureName, number>): void {
    if (node.isLeaf || !node.feature) return;
    // Simple metric: split features closer to root get more weight
    importanceMap[node.feature] = (importanceMap[node.feature] || 0) + 1;
    if (node.left) this.accumulateImportance(node.left, importanceMap);
    if (node.right) this.accumulateImportance(node.right, importanceMap);
  }
}

export class RandomForestClassifier {
  private trees: DecisionTree[] = [];
  private numTrees: number;
  private maxDepth: number;

  constructor(numTrees = 10, maxDepth = 5) {
    this.numTrees = numTrees;
    this.maxDepth = maxDepth;
  }

  // Train the Random Forest
  public fit(data: DataPoint[]): void {
    this.trees = [];
    const features: FeatureName[] = [
      'amount',
      'hour',
      'velocity_1h',
      'amount_velocity_1h',
      'location_changed',
      'device_trusted',
      'merchant_risk'
    ];

    for (let i = 0; i < this.numTrees; i++) {
      const tree = new DecisionTree(this.maxDepth, 2);
      // Create Bootstrap Sample (sample with replacement)
      const bootstrapSample: DataPoint[] = [];
      for (let j = 0; j < data.length; j++) {
        const randomIndex = Math.floor(Math.random() * data.length);
        bootstrapSample.push(data[randomIndex]);
      }
      tree.fit(bootstrapSample, features);
      this.trees.push(tree);
    }
  }

  // Predict average fraud probability (0 to 1) across all trees
  public predict(features: TransactionFeatures): number {
    if (this.trees.length === 0) return 0;
    const predictions = this.trees.map(tree => tree.predict(features));
    const sum = predictions.reduce((acc, val) => acc + val, 0);
    return sum / this.trees.length;
  }

  // Get explanations from trees that voted for fraud
  public explain(features: TransactionFeatures): string[] {
    const explanations: string[] = [];
    // Aggregate explanations from individual trees
    for (const tree of this.trees) {
      if (tree.predict(features) > 0.5) {
        const treePath = tree.explain(features);
        explanations.push(...treePath);
      }
    }
    // De-duplicate and return top explanations
    const counts: Record<string, number> = {};
    for (const exp of explanations) {
      counts[exp] = (counts[exp] || 0) + 1;
    }
    
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1]) // Sort by frequency of occurrence
      .slice(0, 4) // Return top 4 distinct reasons
      .map(entry => entry[0]);
  }

  // Calculate feature importances
  public getFeatureImportance(): Record<FeatureName, number> {
    const importanceMap: Record<FeatureName, number> = {
      amount: 0,
      hour: 0,
      velocity_1h: 0,
      amount_velocity_1h: 0,
      location_changed: 0,
      device_trusted: 0,
      merchant_risk: 0
    };

    for (const tree of this.trees) {
      tree.computeFeatureImportance(importanceMap);
    }

    // Normalize importance to sum up to 100%
    const total = Object.values(importanceMap).reduce((a, b) => a + b, 0);
    if (total > 0) {
      for (const key in importanceMap) {
        const fKey = key as FeatureName;
        importanceMap[fKey] = parseFloat(((importanceMap[fKey] / total) * 100).toFixed(1));
      }
    } else {
      // Default placeholder importances if trees are empty
      importanceMap.amount = 30;
      importanceMap.merchant_risk = 20;
      importanceMap.velocity_1h = 15;
      importanceMap.location_changed = 15;
      importanceMap.amount_velocity_1h = 10;
      importanceMap.device_trusted = 5;
      importanceMap.hour = 5;
    }

    return importanceMap;
  }

  // Evaluate the model on a test set
  public evaluate(testData: DataPoint[], threshold = 0.5) {
    let tp = 0; // True Positive
    let fp = 0; // False Positive
    let tn = 0; // True Negative
    let fn = 0; // False Negative

    for (const d of testData) {
      const prob = this.predict(d.features);
      const pred = prob >= threshold ? 1 : 0;
      const actual = d.label;

      if (pred === 1 && actual === 1) tp++;
      else if (pred === 1 && actual === 0) fp++;
      else if (pred === 0 && actual === 0) tn++;
      else if (pred === 0 && actual === 1) fn++;
    }

    const accuracy = (tp + tn) / (testData.length || 1);
    const precision = tp / ((tp + fp) || 1);
    const recall = tp / ((tp + fn) || 1);
    const f1 = (2 * precision * recall) / ((precision + recall) || 1);

    return {
      accuracy,
      precision,
      recall,
      f1,
      confusionMatrix: { tp, fp, tn, fn }
    };
  }
}

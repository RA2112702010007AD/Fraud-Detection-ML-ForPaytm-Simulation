import { DataPoint, TransactionFeatures } from './mlEngine';

// Generates a single normal transaction
export function generateNormalTransaction(): DataPoint {
  const amount = Math.random() < 0.1 
    ? parseFloat((Math.random() * 400 + 100).toFixed(2)) // 10% medium-high amounts
    : parseFloat((Math.random() * 80 + 3).toFixed(2)); // 90% typical small purchases ($3 to $80)

  // Hours: Peak daytime 8:00 to 22:00 (80%), rest is off-peak
  const hour = Math.random() < 0.8
    ? Math.floor(Math.random() * 14) + 8
    : Math.floor(Math.random() * 24);

  const velocity_1h = Math.random() < 0.9 ? Math.floor(Math.random() * 2) + 1 : Math.floor(Math.random() * 3) + 2;
  const amount_velocity_1h = parseFloat((velocity_1h * amount * (Math.random() * 0.5 + 0.8)).toFixed(2));
  
  const location_changed = Math.random() < 0.05 ? 1 : 0; // 5% chance of travel/location change
  const device_trusted = Math.random() < 0.90 ? 1 : 0; // 90% chance of using standard device
  
  // Normal merchants: grocery, utilities, coffee (low risk)
  const merchant_risk = parseFloat((Math.random() * 0.35).toFixed(2)); 

  return {
    features: {
      amount,
      hour,
      velocity_1h,
      amount_velocity_1h,
      location_changed,
      device_trusted,
      merchant_risk
    },
    label: 0
  };
}

// Generates a single fraudulent transaction
export function generateFraudulentTransaction(): DataPoint {
  const isHighAmount = Math.random() < 0.7;
  const amount = isHighAmount
    ? parseFloat((Math.random() * 4500 + 500).toFixed(2)) // 70% large ticket thefts ($500 to $5000)
    : parseFloat((Math.random() * 45 + 5).toFixed(2)); // 30% micro-charges for testing card

  // Hours: Late night/early morning 23:00 to 5:00 (70% probability)
  const hour = Math.random() < 0.7
    ? (Math.random() < 0.5 ? Math.floor(Math.random() * 5) : Math.floor(Math.random() * 2) + 22)
    : Math.floor(Math.random() * 24);

  // High velocity: rapid succession of transactions
  const velocity_1h = Math.floor(Math.random() * 7) + 3; // 3 to 10 transactions
  const amount_velocity_1h = parseFloat((velocity_1h * amount * (Math.random() * 0.3 + 0.95)).toFixed(2));

  const location_changed = Math.random() < 0.80 ? 1 : 0; // 80% location mismatch (stolen details used elsewhere)
  const device_trusted = Math.random() < 0.15 ? 1 : 0; // 85% untrusted devices (hackers/emulators)

  // Fraudulent merchants: cryptocurrency, foreign transfer, high-end electronics
  const merchant_risk = parseFloat((Math.random() * 0.4 + 0.60).toFixed(2)); // risk between 0.60 and 1.00

  return {
    features: {
      amount,
      hour,
      velocity_1h,
      amount_velocity_1h,
      location_changed,
      device_trusted,
      merchant_risk
    },
    label: 1
  };
}

// Generate full training and testing dataset
export function generateDataset(size = 1000, fraudRatio = 0.15): { train: DataPoint[]; test: DataPoint[] } {
  const data: DataPoint[] = [];
  const fraudCount = Math.floor(size * fraudRatio);
  const normalCount = size - fraudCount;

  for (let i = 0; i < normalCount; i++) {
    data.push(generateNormalTransaction());
  }
  for (let i = 0; i < fraudCount; i++) {
    data.push(generateFraudulentTransaction());
  }

  // Shuffle dataset
  const shuffled = data.sort(() => Math.random() - 0.5);

  // Split into train (70%) and test (30%)
  const splitIndex = Math.floor(shuffled.length * 0.7);
  return {
    train: shuffled.slice(0, splitIndex),
    test: shuffled.slice(splitIndex)
  };
}

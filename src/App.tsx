import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import WalletDashboard, { Transaction } from './components/WalletDashboard';
import TransactionModal from './components/TransactionModal';
import MlDashboard from './components/MlDashboard';
import LoginPage, { UserProfile } from './components/LoginPage';
import LiveWallpaper from './components/LiveWallpaper';
import { 
  RandomForestClassifier, 
  TransactionFeatures 
} from './ml/mlEngine';
import { generateDataset } from './ml/dataGenerator';
import { ShieldAlert, X, AlertTriangle } from 'lucide-react';

export default function App() {
  const [currentProfile, setCurrentProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'wallet' | 'ml'>('wallet');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [balance, setBalance] = useState(28450);
  const [postpaidBalance, setPostpaidBalance] = useState(4800);
  
  // Model state
  const [rfModel, setRfModel] = useState<RandomForestClassifier | null>(null);
  const [decisionThreshold, setDecisionThreshold] = useState(0.5);
  const [isRetraining, setIsRetraining] = useState(false);
  const [metrics, setMetrics] = useState({
    accuracy: 0.95,
    precision: 0.93,
    recall: 0.91,
    f1: 0.92,
    confusionMatrix: { tp: 39, fp: 3, tn: 246, fn: 12 }
  });
  const [featureImportance, setFeatureImportance] = useState<Record<string, number>>({
    amount: 32.5,
    merchant_risk: 22.1,
    velocity_1h: 15.3,
    location_changed: 14.8,
    amount_velocity_1h: 8.2,
    device_trusted: 4.5,
    hour: 2.6
  });

  // Modals and Alerts
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [defaultTxCategory, setDefaultTxCategory] = useState('UPI Transfer');
  const [defaultTxFeatures, setDefaultTxFeatures] = useState<Partial<TransactionFeatures> | undefined>(undefined);
  const [explanationTx, setExplanationTx] = useState<Transaction | null>(null);

  // Transactions ledger state
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Document theme handler
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.remove('light-theme');
    } else {
      document.documentElement.classList.add('light-theme');
    }
  }, [isDarkMode]);

  // Train the classifier on load
  useEffect(() => {
    initializeAndTrainModel();
  }, []);

  const initializeAndTrainModel = () => {
    const dataset = generateDataset(1000, 0.15);
    const forest = new RandomForestClassifier(10, 5);
    forest.fit(dataset.train);

    const evalResults = forest.evaluate(dataset.test, decisionThreshold);
    const importances = forest.getFeatureImportance();

    setRfModel(forest);
    setMetrics(evalResults);
    setFeatureImportance(importances);
  };

  // Re-evaluate on threshold change
  useEffect(() => {
    if (rfModel) {
      const dataset = generateDataset(300, 0.15);
      const evalResults = rfModel.evaluate(dataset.test, decisionThreshold);
      setMetrics(evalResults);
    }
  }, [decisionThreshold]);

  // Login handler
  const handleLogin = (profile: UserProfile) => {
    setCurrentProfile(profile);
    setBalance(profile.balance);
    setPostpaidBalance(profile.postpaidBalance);
    setActiveTab('wallet');

    // Generate custom starting transactions for each profile
    const baseDate = new Date();
    if (profile.id === 'profile_1') {
      // Merchant User: Standard safe logs
      setTransactions([
        {
          id: 'tx_m1',
          payeeName: 'Reliance Fresh Supermarket',
          category: 'Scan QR',
          amount: 1450.00,
          timestamp: new Date(baseDate.getTime() - 1000 * 60 * 30),
          paymentMode: 'UPI Wallet',
          status: 'Approved',
          riskScore: 0.05,
          features: { amount: 1450, hour: 17, velocity_1h: 1, amount_velocity_1h: 1450, location_changed: 0, device_trusted: 1, merchant_risk: 0.1 }
        },
        {
          id: 'tx_m2',
          payeeName: 'Chai Point Café',
          category: 'Scan QR',
          amount: 80.00,
          timestamp: new Date(baseDate.getTime() - 1000 * 60 * 120),
          paymentMode: 'UPI Wallet',
          status: 'Approved',
          riskScore: 0.02,
          features: { amount: 80, hour: 15, velocity_1h: 1, amount_velocity_1h: 80, location_changed: 0, device_trusted: 1, merchant_risk: 0.05 }
        }
      ]);
    } else if (profile.id === 'profile_2') {
      // Traveler User: Mid-risk logs
      setTransactions([
        {
          id: 'tx_t1',
          payeeName: 'Taj Hotel Bangalore POS',
          category: 'Bank Transfer',
          amount: 12500.00,
          timestamp: new Date(baseDate.getTime() - 1000 * 60 * 45),
          paymentMode: 'HDFC Credit Card',
          status: 'Approved',
          riskScore: 0.38,
          features: { amount: 12500, hour: 20, velocity_1h: 2, amount_velocity_1h: 25000, location_changed: 1, device_trusted: 1, merchant_risk: 0.3 }
        },
        {
          id: 'tx_t2',
          payeeName: 'Unverified Overseas Boutique',
          category: 'To Bank A/c',
          amount: 4500.00,
          timestamp: new Date(baseDate.getTime() - 1000 * 60 * 180),
          paymentMode: 'Paytm Postpaid',
          status: 'Blocked',
          riskScore: 0.72,
          features: { amount: 4500, hour: 23, velocity_1h: 3, amount_velocity_1h: 17000, location_changed: 1, device_trusted: 1, merchant_risk: 0.65 },
          reasons: [
            'Billing location mismatch (POS located abroad)',
            'Elevated merchant category risk score (65%)',
            'Transaction frequency spike detected (3 transactions/hour)'
          ]
        }
      ]);
    } else {
      // High-Risk User: Dangerous log warnings
      setTransactions([
        {
          id: 'tx_h1',
          payeeName: 'Binance P2P Escrow',
          category: 'UPI Transfer',
          amount: 5000.00,
          timestamp: new Date(baseDate.getTime() - 1000 * 60 * 10),
          paymentMode: 'UPI Wallet',
          status: 'Blocked',
          riskScore: 0.96,
          features: { amount: 5000, hour: 3, velocity_1h: 7, amount_velocity_1h: 35000, location_changed: 1, device_trusted: 0, merchant_risk: 0.95 },
          reasons: [
            'Untrusted device signature detected (suspected simulator)',
            'Critical merchant category risk (95%)',
            'Suspicious transaction hour (3:00 AM off-peak)',
            'Velocity is high (7 transactions in past hour)'
          ]
        },
        {
          id: 'tx_h2',
          payeeName: 'Unknown Mobile Recharge',
          category: 'Mobile Recharge',
          amount: 100.00,
          timestamp: new Date(baseDate.getTime() - 1000 * 60 * 12),
          paymentMode: 'UPI Wallet',
          status: 'Approved',
          riskScore: 0.12,
          features: { amount: 100, hour: 2, velocity_1h: 6, amount_velocity_1h: 30100, location_changed: 1, device_trusted: 0, merchant_risk: 0.1 }
        }
      ]);
    }
  };

  // Logout handler
  const handleLogout = () => {
    setCurrentProfile(null);
    setTransactions([]);
  };

  // Retrain handler
  const handleRetrain = () => {
    setIsRetraining(true);
    setTimeout(() => {
      initializeAndTrainModel();
      setIsRetraining(false);
    }, 1500);
  };

  // Pre-predict risk
  const handlePredictRisk = (features: TransactionFeatures): number => {
    if (!rfModel) {
      let score = 0.05;
      if (features.amount > 1000) score += 0.25;
      if (features.hour < 6 || features.hour > 22) score += 0.15;
      if (features.velocity_1h > 3) score += 0.2;
      if (features.location_changed) score += 0.15;
      if (!features.device_trusted) score += 0.15;
      if (features.merchant_risk > 0.6) score += 0.15;
      return Math.min(0.99, score);
    }
    return rfModel.predict(features);
  };

  // Explain risk path
  const handleExplainRisk = (features: TransactionFeatures): string[] => {
    if (!rfModel) {
      const paths = [];
      if (features.amount > 1000) paths.push(`Elevated amount: ₹${features.amount}`);
      if (features.hour < 6 || features.hour > 22) paths.push(`Off-peak transaction hour: ${features.hour}:00`);
      if (features.location_changed) paths.push("Billing location mismatch");
      if (!features.device_trusted) paths.push("Device signature unverified");
      return paths;
    }
    return rfModel.explain(features);
  };

  // Send Money callback
  const handleSendMoney = (data: { payeeName: string; amount: number; paymentMode: string; features: TransactionFeatures }) => {
    const risk = handlePredictRisk(data.features);
    const isApproved = risk < decisionThreshold;

    const newTx: Transaction = {
      id: `tx_${Date.now()}`,
      payeeName: data.payeeName,
      category: defaultTxCategory,
      amount: data.amount,
      timestamp: new Date(),
      paymentMode: data.paymentMode,
      status: isApproved ? 'Approved' : 'Blocked',
      riskScore: risk,
      features: data.features,
      reasons: isApproved ? undefined : handleExplainRisk(data.features)
    };

    setTransactions(prev => [newTx, ...prev]);

    if (isApproved) {
      if (data.paymentMode === 'Paytm Postpaid') {
        setPostpaidBalance(prev => Math.max(0, prev - data.amount));
      } else {
        setBalance(prev => Math.max(0, prev - data.amount));
      }
    }
  };

  const handleOpenTransaction = (category: string, overrideFeatures?: Partial<TransactionFeatures>) => {
    setDefaultTxCategory(category);
    
    // Inject profile defaults if available
    const baseline = currentProfile ? currentProfile.defaultFeatures : {};
    setDefaultTxFeatures({
      ...baseline,
      ...overrideFeatures
    });
    setIsTxModalOpen(true);
  };

  // Render Login page if user not authenticated
  if (!currentProfile) {
    return (
      <>
        <LiveWallpaper isDarkMode={isDarkMode} />
        <LoginPage onLogin={handleLogin} />
      </>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      {/* Dynamic Animated Particle network wallpaper */}
      <LiveWallpaper isDarkMode={isDarkMode} />
      
      {/* Header navbar */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isDarkMode={isDarkMode} 
        toggleTheme={() => setIsDarkMode(!isDarkMode)} 
        balance={balance}
        currentProfile={currentProfile}
        onLogout={handleLogout}
      />

      {/* Main Grid layout */}
      <main className="container" style={{ flexGrow: 1, padding: '2rem 1.5rem' }}>
        {activeTab === 'wallet' ? (
          <WalletDashboard 
            balance={balance}
            postpaidBalance={postpaidBalance}
            transactions={transactions}
            onOpenTransaction={handleOpenTransaction}
            onShowExplanation={setExplanationTx}
            profileName={currentProfile.name}
          />
        ) : (
          <MlDashboard 
            metrics={metrics}
            featureImportance={featureImportance}
            decisionThreshold={decisionThreshold}
            setDecisionThreshold={setDecisionThreshold}
            onRetrain={handleRetrain}
            isRetraining={isRetraining}
          />
        )}
      </main>

      {/* Footer info */}
      <footer style={{
        textAlign: 'center',
        padding: '1.5rem',
        borderTop: '1px solid var(--border-color)',
        fontSize: '0.8rem',
        color: 'var(--text-muted)',
        marginTop: '3rem'
      }}>
        © 2026 Paytm. Secure payment systems powered by Real-Time Safe Shield Random Forest Classifier.
      </footer>

      {/* Payment simulation Modal */}
      <TransactionModal 
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        onSubmit={handleSendMoney}
        defaultCategory={defaultTxCategory}
        defaultFeatures={defaultTxFeatures}
        predictRisk={handlePredictRisk}
        explainRisk={handleExplainRisk}
      />

      {/* Explanations Dialog overlay */}
      {explanationTx && (
        <div className="modal-overlay">
          <div className="modal-content animate-slide-up" style={{ maxWidth: '480px' }}>
            <div className="modal-header" style={{ borderBottom: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-danger)' }}>
                <ShieldAlert size={20} />
                <h3 style={{ fontSize: '1.1rem' }}>Safe Shield Block Log</h3>
              </div>
              <button 
                onClick={() => setExplanationTx(null)} 
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Flagged Payee</div>
                  <strong style={{ fontSize: '1rem' }}>{explanationTx.payeeName}</strong>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Amount</div>
                  <strong style={{ fontSize: '1.1rem', color: 'var(--color-danger)' }}>₹{explanationTx.amount.toLocaleString()}</strong>
                </div>
              </div>

              <div style={{
                backgroundColor: 'rgba(239, 68, 68, 0.06)',
                border: '1px solid rgba(239, 68, 68, 0.15)',
                padding: '1rem',
                borderRadius: '12px'
              }}>
                <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-danger)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.5rem' }}>
                  <AlertTriangle size={12} /> Model Decision Explanations
                </h4>
                <ul style={{ paddingLeft: '1.25rem', fontSize: '0.82rem', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  {explanationTx.reasons && explanationTx.reasons.length > 0 ? (
                    explanationTx.reasons.map((reason, idx) => (
                      <li key={idx}>{reason}</li>
                    ))
                  ) : (
                    <li>This transaction amount (₹{explanationTx.amount}) exceeded typical standard variance limits.</li>
                  )}
                </ul>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                <span>Risk: {(explanationTx.riskScore * 100).toFixed(0)}%</span>
                <span>Decision boundary threshold: {(decisionThreshold * 100).toFixed(0)}%</span>
              </div>
            </div>
            
            <div className="modal-footer" style={{ borderTop: 'none', padding: '1rem 1.5rem' }}>
              <button onClick={() => setExplanationTx(null)} className="btn btn-secondary" style={{ width: '100%' }}>
                Acknowledge Alert
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

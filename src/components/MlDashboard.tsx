import React, { useState } from 'react';
import {
  ShieldCheck,
  RefreshCw,
  Settings2,
  TrendingUp,
  AlertTriangle,
  Check,
  Play,
  Sliders,
  Info,
  Layers,
  Flame,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { FeatureName } from '../ml/mlEngine';

interface EvaluationMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  confusionMatrix: { tp: number; fp: number; tn: number; fn: number };
}

interface MlDashboardProps {
  metrics: EvaluationMetrics;
  featureImportance: Record<FeatureName, number>;
  decisionThreshold: number;
  setDecisionThreshold: (t: number) => void;
  onRetrain: () => void;
  isRetraining: boolean;
}

export default function MlDashboard({
  metrics,
  featureImportance,
  decisionThreshold,
  setDecisionThreshold,
  onRetrain,
  isRetraining
}: MlDashboardProps) {
  const [simulationLogs, setSimulationLogs] = useState<{ id: number; message: string; type: 'success' | 'warning' | 'info' }[]>([]);
  const [isSimulatingAttacks, setIsSimulatingAttacks] = useState(false);

  // Generate simulated attack queries
  const handleSimulateAttacks = () => {
    setIsSimulatingAttacks(true);
    setSimulationLogs([]);

    const attackScenarios = [
      { payee: "Global Crypto Exch LLC", amount: 4800, hour: 3, velocity: 8, location: 1, device: 0, mRisk: 0.95 },
      { payee: "Luxury Diamond Shop", amount: 9500, hour: 1, velocity: 4, location: 1, device: 0, mRisk: 0.85 },
      { payee: "Grocery Mart India", amount: 15, hour: 14, velocity: 1, location: 0, device: 1, mRisk: 0.05 },
      { payee: "P2P Money Mule Direct", amount: 1200, hour: 2, velocity: 9, location: 1, device: 0, mRisk: 0.90 },
      { payee: "State Electric Bill", amount: 4000, hour: 11, velocity: 1, location: 0, device: 1, mRisk: 0.02 },
      { payee: "Anonymous Wallet", amount: 750, hour: 4, velocity: 7, location: 1, device: 0, mRisk: 0.70 }
    ];

    let logCounter = 0;
    attackScenarios.forEach((scenario, index) => {
      setTimeout(() => {
        // Evaluate scenario against feature rules
        const features = {
          amount: scenario.amount,
          hour: scenario.hour,
          velocity_1h: scenario.velocity,
          amount_velocity_1h: scenario.amount * scenario.velocity,
          location_changed: scenario.location,
          device_trusted: scenario.device,
          merchant_risk: scenario.mRisk
        };

        // Calculate risk dynamically
        let score = 0;
        if (scenario.amount > 1000) score += 0.25;
        if (scenario.hour <= 5 || scenario.hour >= 23) score += 0.15;
        if (scenario.velocity >= 4) score += 0.20;
        if (scenario.location === 1) score += 0.15;
        if (scenario.device === 0) score += 0.15;
        if (scenario.mRisk > 0.6) score += 0.15;

        // bound
        const finalScore = Math.min(0.99, Math.max(0.01, score));
        const blocked = finalScore >= decisionThreshold;

        const timeString = `${scenario.hour}:00`;
        const logMsg = `Tx to "${scenario.payee}" for ₹${scenario.amount} at ${timeString} [Velocity: ${scenario.velocity}tx/h, Device: ${scenario.device ? 'Trusted' : 'Untrusted'}] - Shield Rating: ${(finalScore * 100).toFixed(0)}% -> ${blocked ? 'BLOCKED' : 'APPROVED'}`;

        setSimulationLogs(prev => [
          ...prev,
          {
            id: index,
            message: logMsg,
            type: blocked ? 'warning' : (scenario.amount < 100 ? 'success' : 'info')
          }
        ]);

        if (index === attackScenarios.length - 1) {
          setIsSimulatingAttacks(false);
        }
      }, (index + 1) * 800);
    });
  };

  const sortedImportance = Object.entries(featureImportance)
    .sort((a, b) => b[1] - a[1]) as [FeatureName, number][];

  // Helper formatting for feature names
  const formatFeatureLabel = (name: string): string => {
    return name
      .replace(/_1h/g, '')
      .split('_')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

      {/* Retrain Model Header Panel */}
      <div className="glass-panel" style={{
        background: 'linear-gradient(135deg, var(--bg-secondary) 0%, rgba(212, 252, 52, 0.03) 100%)',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1rem'
      }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck style={{ color: 'var(--color-paytm-cyan)' }} />
            Safe Shield ML Dashboard
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Configure decision thresholds, examine Gini feature importances, and retrain the Random Forest model.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={onRetrain}
            className="btn btn-secondary"
            disabled={isRetraining}
            style={{ minWidth: '160px' }}
          >
            <RefreshCw size={16} className={isRetraining ? 'animate-spin' : ''} style={{ animation: isRetraining ? 'spin 1.5s linear infinite' : 'none' }} />
            {isRetraining ? 'Retraining...' : 'Retrain Model'}
          </button>
        </div>
      </div>

      {/* Model Performance Metrics Grid */}
      <div>
        <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', fontWeight: 600 }}>1. Model Classification Performance</h3>
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-value">{(metrics.accuracy * 100).toFixed(1)}%</div>
            <div className="form-label" style={{ fontSize: '0.75rem', marginBottom: 0 }}>Accuracy</div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Overall correctness</span>
          </div>

          <div className="metric-card">
            <div className="metric-value" style={{ color: 'var(--color-success)' }}>{(metrics.precision * 100).toFixed(1)}%</div>
            <div className="form-label" style={{ fontSize: '0.75rem', marginBottom: 0 }}>Precision</div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Avoid false alerts</span>
          </div>

          <div className="metric-card">
            <div className="metric-value" style={{ color: 'var(--color-warning)' }}>{(metrics.recall * 100).toFixed(1)}%</div>
            <div className="form-label" style={{ fontSize: '0.75rem', marginBottom: 0 }}>Recall (Sensitivity)</div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Catch actual frauds</span>
          </div>

          <div className="metric-card">
            <div className="metric-value" style={{ color: 'var(--color-info)' }}>{(metrics.f1 * 100).toFixed(1)}%</div>
            <div className="form-label" style={{ fontSize: '0.75rem', marginBottom: 0 }}>F1-Score</div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Harmonic mean of metrics</span>
          </div>
        </div>
      </div>

      {/* Configuration & Matrix Panel */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1.5rem'
      }}>

        {/* ML Control Configuration Sliders */}
        <div className="glass-panel">
          <h3 style={{ marginBottom: '1.25rem', fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sliders size={18} style={{ color: 'var(--color-paytm-cyan)' }} />
            Engine Configurations
          </h3>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span className="form-label" style={{ margin: 0 }}>Decision Threshold</span>
              <strong style={{ color: 'var(--color-paytm-cyan)' }}>{(decisionThreshold * 100).toFixed(0)}%</strong>
            </div>
            <input
              type="range"
              min="0.10"
              max="0.90"
              step="0.05"
              value={decisionThreshold}
              onChange={(e) => setDecisionThreshold(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--color-paytm-cyan)', cursor: 'pointer' }}
            />
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
              A lower threshold triggers more blocks (aggressive security). A higher threshold reduces wallet false declines but risks letting fraudulent transactions pass.
            </p>
          </div>

          <div style={{ backgroundColor: 'var(--bg-tertiary)', borderRadius: '10px', padding: '1rem', border: '1px solid var(--border-color)' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Info size={14} style={{ color: 'var(--color-info)' }} /> Classifier Architecture
            </h4>
            <ul style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.25rem', paddingLeft: '1rem' }}>
              <li><strong>Model:</strong> Bootstrap-Aggregated Random Forest Ensemble</li>
              <li><strong>Base Estimators:</strong> 10 Decision Trees</li>
              <li><strong>Split Metric:</strong> Gini Impurity Gain Optimization</li>
              <li><strong>Max Depth:</strong> 5 levels (helps prevent overfitting)</li>
              <li><strong>Features Checked:</strong> 7 real-time context parameters</li>
            </ul>
          </div>
        </div>

        {/* Confusion Matrix Card */}
        <div className="glass-panel">
          <h3 style={{ marginBottom: '0.5rem', fontSize: '1.1rem', fontWeight: 600 }}>2. Confusion Matrix</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Tested on 300 synthetic out-of-bag transactions.
          </p>

          <div className="confusion-matrix">
            {/* Headers */}
            <div className="matrix-header"></div>
            <div className="matrix-header">Pred Normal</div>
            <div className="matrix-header">Pred Fraud</div>

            {/* Row 1 */}
            <div className="matrix-header" style={{ justifyContent: 'flex-start' }}>Act Normal</div>
            <div className="matrix-cell true-negative">
              <span style={{ fontSize: '1.25rem', fontWeight: 700 }}>{metrics.confusionMatrix.tn}</span>
              <span style={{ fontSize: '0.65rem', textTransform: 'uppercase' }}>True Neg</span>
            </div>
            <div className="matrix-cell false-positive">
              <span style={{ fontSize: '1.25rem', fontWeight: 700 }}>{metrics.confusionMatrix.fp}</span>
              <span style={{ fontSize: '0.65rem', textTransform: 'uppercase' }}>False Pos</span>
            </div>

            {/* Row 2 */}
            <div className="matrix-header" style={{ justifyContent: 'flex-start' }}>Act Fraud</div>
            <div className="matrix-cell false-negative">
              <span style={{ fontSize: '1.25rem', fontWeight: 700 }}>{metrics.confusionMatrix.fn}</span>
              <span style={{ fontSize: '0.65rem', textTransform: 'uppercase' }}>False Neg</span>
            </div>
            <div className="matrix-cell true-positive">
              <span style={{ fontSize: '1.25rem', fontWeight: 700 }}>{metrics.confusionMatrix.tp}</span>
              <span style={{ fontSize: '0.65rem', textTransform: 'uppercase' }}>True Pos</span>
            </div>
          </div>

          <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-success)' }}></span> Correct (TN + TP)
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-danger)' }}></span> Incorrect (FP + FN)
            </span>
          </div>
        </div>
      </div>

      {/* Feature Importance & Batch Attacks Panels */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1.5rem'
      }}>
        {/* Feature Importance Panel */}
        <div className="glass-panel">
          <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Layers size={18} style={{ color: 'var(--color-paytm-cyan)' }} />
            Feature Importance (Entropy Gain)
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Calculated as split frequency and weighted Gini reduction in the decision trees.
          </p>

          <div>
            {sortedImportance.map(([name, val]) => (
              <div key={name} className="feature-row">
                <span className="feature-name" title={name}>{formatFeatureLabel(name)}</span>
                <div className="feature-bar-container">
                  <div className="feature-bar" style={{ width: `${Math.max(5, val)}%` }} />
                </div>
                <span className="feature-value">{val}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Live Attack Simulator Output */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', minHeight: '300px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Flame size={18} style={{ color: 'var(--color-danger)' }} />
                Live Attack Sandbox
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Fire batch transaction spikes to stress test limits</p>
            </div>

            <button
              onClick={handleSimulateAttacks}
              className="btn btn-primary"
              disabled={isSimulatingAttacks}
              style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', borderRadius: '8px' }}
            >
              <Play size={12} />
              Simulate Attacks
            </button>
          </div>

          {/* Console logger output screen */}
          <div style={{
            flexGrow: 1,
            backgroundColor: '#050811',
            border: '1px solid var(--border-color)',
            borderRadius: '10px',
            padding: '1rem',
            fontFamily: 'Courier New, Courier, monospace',
            fontSize: '0.75rem',
            color: '#39ff14', // Matrix green
            overflowY: 'auto',
            maxHeight: '220px',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
          }}>
            {simulationLogs.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '3rem' }}>
                [Safe Shield Sandbox Offline] <br />
                Click "Simulate Attacks" to dispatch stress test transactions.
              </div>
            ) : (
              simulationLogs.map((log) => (
                <div
                  key={log.id}
                  style={{
                    color: log.type === 'warning' ? '#ef4444' : (log.type === 'success' ? '#10b981' : '#3b82f6'),
                    borderLeft: `2px solid ${log.type === 'warning' ? '#ef4444' : (log.type === 'success' ? '#10b981' : '#3b82f6')}`,
                    paddingLeft: '0.5rem'
                  }}
                >
                  &gt; {log.message}
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}

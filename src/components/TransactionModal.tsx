import React, { useState, useEffect } from 'react';
import { X, Send, ShieldCheck, AlertTriangle, ShieldX, Sparkles, RefreshCw, ShieldAlert } from 'lucide-react';
import { TransactionFeatures } from '../ml/mlEngine';
import { simulatedCreateTransactionEndpoint } from '../api/apiGateway';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { payeeName: string; amount: number; paymentMode: string; features: TransactionFeatures }) => void;
  defaultCategory: string;
  defaultFeatures?: Partial<TransactionFeatures>;
  predictRisk: (features: TransactionFeatures) => number;
  explainRisk: (features: TransactionFeatures) => string[];
  clientIp: string;
  userId: string;
}


export default function TransactionModal({
  isOpen,
  onClose,
  onSubmit,
  defaultCategory,
  defaultFeatures,
  predictRisk,
  explainRisk,
  clientIp,
  userId
}: TransactionModalProps) {
  const [payeeName, setPayeeName] = useState('');
  const [amount, setAmount] = useState(100);
  const [paymentMode, setPaymentMode] = useState('UPI Wallet');
  
  // Simulation Features
  const [hour, setHour] = useState(12);
  const [velocity, setVelocity] = useState(1);
  const [locationChanged, setLocationChanged] = useState(false);
  const [deviceTrusted, setDeviceTrusted] = useState(true);
  const [merchantRisk, setMerchantRisk] = useState(0.1);
  
  // Processing animation
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanResult, setScanResult] = useState<'Approved' | 'Blocked' | null>(null);
  const [reasons, setReasons] = useState<string[]>([]);
  const [liveRisk, setLiveRisk] = useState(0);

  // Security Gateway States
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [gatewayError, setGatewayError] = useState<string | null>(null);
  const [rateLimitCooldown, setRateLimitCooldown] = useState(0);

  // Handle rate-limit cooldown decrement
  useEffect(() => {
    if (rateLimitCooldown <= 0) return;
    const timer = setInterval(() => {
      setRateLimitCooldown(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [rateLimitCooldown]);


  // Set default form values when category or initial features change
  useEffect(() => {
    if (isOpen) {
      setPayeeName(
        defaultCategory === 'Electricity Bill' ? 'State Power Board' :
        defaultCategory === 'Mobile Recharge' ? 'Jio Telecom Operator' :
        defaultCategory === 'DTH Connection' ? 'Tata Play DTH' :
        defaultCategory === 'House Rent Payment' ? 'Landlord Sharma' :
        defaultCategory === 'Scan QR' ? 'Merchant Store QR' : 'Rohan Kumar'
      );
      
      if (defaultFeatures) {
        if (defaultFeatures.amount !== undefined) setAmount(defaultFeatures.amount);
        if (defaultFeatures.hour !== undefined) setHour(defaultFeatures.hour);
        if (defaultFeatures.velocity_1h !== undefined) setVelocity(defaultFeatures.velocity_1h);
        if (defaultFeatures.location_changed !== undefined) setLocationChanged(defaultFeatures.location_changed === 1);
        if (defaultFeatures.device_trusted !== undefined) setDeviceTrusted(defaultFeatures.device_trusted === 1);
        if (defaultFeatures.merchant_risk !== undefined) setMerchantRisk(defaultFeatures.merchant_risk);
      } else {
        // Reset defaults
        setAmount(defaultCategory === 'House Rent Payment' ? 8500 : 150);
        setHour(new Date().getHours());
        setVelocity(1);
        setLocationChanged(false);
        setDeviceTrusted(true);
        setMerchantRisk(
          defaultCategory.toLowerCase().includes('bill') || defaultCategory.toLowerCase().includes('recharge') 
            ? 0.05 
            : 0.2
        );
      }
      setScanResult(null);
      setIsProcessing(false);
      setValidationErrors([]);
      setGatewayError(null);
    }
  }, [isOpen, defaultCategory, defaultFeatures]);


  // Pack variables into feature structure
  const getFeatures = (): TransactionFeatures => {
    return {
      amount: Number(amount),
      hour: Number(hour),
      velocity_1h: Number(velocity),
      amount_velocity_1h: Number(velocity) * Number(amount),
      location_changed: locationChanged ? 1 : 0,
      device_trusted: deviceTrusted ? 1 : 0,
      merchant_risk: Number(merchantRisk)
    };
  };

  // Recalculate live risk metric when values shift
  useEffect(() => {
    const risk = predictRisk(getFeatures());
    setLiveRisk(risk);
  }, [amount, hour, velocity, locationChanged, deviceTrusted, merchantRisk]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rateLimitCooldown > 0) return;

    setIsProcessing(true);
    setValidationErrors([]);
    setGatewayError(null);

    const features = getFeatures();

    // Call simulated backend transaction endpoint
    const response = await simulatedCreateTransactionEndpoint({
      ip: clientIp,
      userId: userId,
      payload: {
        payeeName,
        amount: Number(amount),
        paymentMode,
        features
      }
    });

    // Simulate transaction security scanning animation with backend response mapping
    setTimeout(() => {
      setIsProcessing(false);
      if (response.status === 200) {
        // Gateway validation passed! Now evaluate with the Random Forest ML classifier
        const risk = predictRisk(features);
        const isFraud = risk >= 0.50; // Block if fraud probability is high
        
        setScanResult(isFraud ? 'Blocked' : 'Approved');
        if (isFraud) {
          setReasons(explainRisk(features));
        }
      } else if (response.status === 429) {
        // Rate limited
        setGatewayError(response.error?.message || 'Transaction limit exceeded.');
        if (response.rateLimit?.resetSeconds) {
          setRateLimitCooldown(response.rateLimit.resetSeconds);
        }
      } else {
        // Validation / Auth errors
        setGatewayError(response.error?.message || 'Security validation rejected this transaction.');
        if (response.error?.details) {
          setValidationErrors(response.error.details);
        }
      }
    }, 1800);
  };


  const handleFinish = () => {
    if (scanResult === 'Approved') {
      onSubmit({
        payeeName,
        amount: Number(amount),
        paymentMode,
        features: getFeatures()
      });
    }
    onClose();
  };

  const handleRandomize = () => {
    // Randomize variables to trigger different responses
    setAmount(parseFloat((Math.random() * 3000 + 10).toFixed(2)));
    setHour(Math.floor(Math.random() * 24));
    setVelocity(Math.floor(Math.random() * 8) + 1);
    setLocationChanged(Math.random() > 0.5);
    setDeviceTrusted(Math.random() > 0.4);
    setMerchantRisk(parseFloat(Math.random().toFixed(2)));
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '650px' }}>
        
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={20} style={{ color: 'var(--color-paytm-cyan)' }} />
            <h3 style={{ fontSize: '1.25rem' }}>New Transaction ({defaultCategory})</h3>
          </div>
          {!isProcessing && !scanResult && (
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              <X size={20} />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          
          {/* Scanning Animation */}
          {isProcessing && (
            <div className="scanner-overlay animate-fade-in">
              <div className="scanner-laser"></div>
              <div style={{ textAlign: 'center', position: 'relative', zIndex: 60 }}>
                <RefreshCw className="animate-spin" size={48} style={{ color: 'var(--color-paytm-cyan)', animation: 'spin 2s linear infinite', marginBottom: '1.5rem' }} />
                <h3 style={{ fontFamily: 'var(--font-heading)', color: 'white', marginBottom: '0.5rem', fontSize: '1.5rem' }}>Securing Transaction...</h3>
                <p style={{ color: 'var(--color-paytm-cyan)', fontSize: '0.9rem', letterSpacing: '0.05rem', fontWeight: 600 }}>RUNNING REAL-TIME ML FRAUD SHIELD</p>
                <div style={{ marginTop: '1rem', background: 'rgba(255,255,255,0.05)', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', fontSize: '0.8rem' }}>
                  Analyzing: Amount (₹{amount}) • Velocity ({velocity}tx/h) • Device: {deviceTrusted ? 'Trusted' : 'Untrusted'}
                </div>
              </div>
            </div>
          )}

          {/* Transaction Outcome Overlay */}
          {scanResult && (
            <div className="animate-fade-in" style={{ padding: '1.5rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1.5rem' }}>
              {scanResult === 'Approved' ? (
                <>
                  <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-success)', border: '2px solid rgba(16, 185, 129, 0.3)' }}>
                    <ShieldCheck size={48} />
                  </div>
                  <div>
                    <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-success)', fontSize: '1.8rem', fontWeight: 800 }}>Transaction Approved</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
                      ML engine detected 0 anomaly. Payment of <strong>₹{Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong> to <strong>{payeeName}</strong> has been secured and sent.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-danger)', border: '2px solid rgba(239, 68, 68, 0.3)' }}>
                    <ShieldX size={48} />
                  </div>
                  <div style={{ width: '100%' }}>
                    <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-danger)', fontSize: '1.8rem', fontWeight: 800 }}>Transaction Blocked</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.25rem', marginBottom: '1.25rem' }}>
                      Paytm Safe Shield ML model blocked this request due to high risk profile ({(liveRisk * 100).toFixed(0)}% probability of fraud).
                    </p>
                    
                    {/* Explainable AI Block reasons */}
                    <div style={{ backgroundColor: 'var(--color-danger-bg)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '1rem', borderRadius: '12px', textAlign: 'left' }}>
                      <h4 style={{ fontSize: '0.85rem', color: 'var(--color-danger)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <AlertTriangle size={14} /> Risk Factors Detected
                      </h4>
                      <ul style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        {reasons.length === 0 ? (
                          <li>Anomalous transaction patterns and risk heuristics triggered block threshold.</li>
                        ) : (
                          reasons.map((r, i) => <li key={i}>{r}</li>)
                        )}
                      </ul>
                    </div>
                  </div>
                </>
              )}
              
              <button onClick={handleFinish} className="btn btn-primary" style={{ width: '100%' }}>
                {scanResult === 'Approved' ? 'Done' : 'Return to Wallet'}
              </button>
            </div>
          )}

          {/* Standard Form (Unprocessed state) */}
          {!isProcessing && !scanResult && (
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                
                {/* Left Side: Standard Transaction Info */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>1. Transfer Details</h4>
                  
                  <div className="form-group">
                    <label className="form-label">Payee Name</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={payeeName} 
                      onChange={(e) => setPayeeName(e.target.value)} 
                      required 
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Amount (INR)</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      value={amount} 
                      onChange={(e) => setAmount(Number(e.target.value))} 
                      min="1"
                      required 
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Payment Method</label>
                    <select className="form-control" value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)}>
                      <option value="UPI Wallet">Paytm Wallet Balance</option>
                      <option value="Paytm Postpaid">Paytm Postpaid Credit</option>
                      <option value="SBI Bank Account">State Bank of India (A/c x8201)</option>
                      <option value="HDFC Credit Card">HDFC Credit Card (x5512)</option>
                    </select>
                  </div>
                </div>

                {/* Right Side: Security & Simulation parameters */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', borderLeft: '1px solid var(--border-color)', paddingLeft: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
                    <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>2. Simulation Context</h4>
                    <button 
                      type="button" 
                      onClick={handleRandomize} 
                      style={{ background: 'none', border: 'none', color: 'var(--color-paytm-cyan)', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem', fontWeight: 600 }}
                    >
                      <RefreshCw size={12} /> Randomize
                    </button>
                  </div>

                  {/* Transaction Hour */}
                  <div className="form-group">
                    <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Transaction Time</span>
                      <span style={{ color: 'var(--color-paytm-cyan)' }}>{hour}:00 {hour >= 22 || hour <= 5 ? '🌃 (Night)' : '☀️ (Day)'}</span>
                    </label>
                    <input 
                      type="range" 
                      min="0" 
                      max="23" 
                      value={hour} 
                      onChange={(e) => setHour(Number(e.target.value))} 
                      style={{ accentColor: 'var(--color-paytm-cyan)', cursor: 'pointer' }}
                    />
                  </div>

                  {/* Hourly Velocity */}
                  <div className="form-group">
                    <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Velocity (1h)</span>
                      <span style={{ color: 'var(--color-paytm-cyan)' }}>{velocity} trans.</span>
                    </label>
                    <input 
                      type="range" 
                      min="1" 
                      max="10" 
                      value={velocity} 
                      onChange={(e) => setVelocity(Number(e.target.value))} 
                      style={{ accentColor: 'var(--color-paytm-cyan)', cursor: 'pointer' }}
                    />
                  </div>

                  {/* Location Mismatch Switch */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0.25rem 0' }}>
                    <span className="form-label" style={{ margin: 0 }}>Location Mismatch</span>
                    <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px' }}>
                      <input 
                        type="checkbox" 
                        checked={locationChanged} 
                        onChange={(e) => setLocationChanged(e.target.checked)} 
                        style={{ opacity: 0, width: 0, height: 0 }} 
                      />
                      <span style={{
                        position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: locationChanged ? 'var(--color-warning)' : 'var(--bg-tertiary)',
                        borderRadius: '24px', transition: '0.2s', border: '1px solid var(--border-color)'
                      }}>
                        <span style={{
                          position: 'absolute', content: '', height: '18px', width: '18px', left: locationChanged ? '22px' : '2px', bottom: '2px',
                          backgroundColor: 'white', borderRadius: '50%', transition: '0.2s'
                        }} />
                      </span>
                    </label>
                  </div>

                  {/* Device Trust Switch */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0.25rem 0' }}>
                    <span className="form-label" style={{ margin: 0 }}>Device Signature Verified</span>
                    <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px' }}>
                      <input 
                        type="checkbox" 
                        checked={deviceTrusted} 
                        onChange={(e) => setDeviceTrusted(e.target.checked)} 
                        style={{ opacity: 0, width: 0, height: 0 }} 
                      />
                      <span style={{
                        position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: deviceTrusted ? 'var(--color-success)' : 'var(--color-danger)',
                        borderRadius: '24px', transition: '0.2s', border: '1px solid var(--border-color)'
                      }}>
                        <span style={{
                          position: 'absolute', content: '', height: '18px', width: '18px', left: deviceTrusted ? '22px' : '2px', bottom: '2px',
                          backgroundColor: 'white', borderRadius: '50%', transition: '0.2s'
                        }} />
                      </span>
                    </label>
                  </div>

                  {/* Merchant Risk Level */}
                  <div className="form-group">
                    <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Merchant Category Risk</span>
                      <span style={{ color: merchantRisk > 0.5 ? 'var(--color-danger)' : 'var(--color-success)' }}>
                        {(merchantRisk * 100).toFixed(0)}%
                      </span>
                    </label>
                    <input 
                      type="range" 
                      min="0.0" 
                      max="1.0" 
                      step="0.05"
                      value={merchantRisk} 
                      onChange={(e) => setMerchantRisk(Number(e.target.value))} 
                      style={{ accentColor: 'var(--color-paytm-cyan)', cursor: 'pointer' }}
                    />
                  </div>
                </div>

              </div>

              {/* Real-time ML Evaluation Panel */}
              <div style={{
                marginTop: '1.5rem',
                padding: '0.85rem 1.25rem',
                borderRadius: '12px',
                backgroundColor: liveRisk >= 0.5 ? 'rgba(239, 68, 68, 0.08)' : 'rgba(16, 185, 129, 0.08)',
                border: liveRisk >= 0.5 ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid rgba(16, 185, 129, 0.2)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {liveRisk >= 0.5 ? (
                    <AlertTriangle size={18} style={{ color: 'var(--color-warning)' }} />
                  ) : (
                    <ShieldCheck size={18} style={{ color: 'var(--color-success)' }} />
                  )}
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                      Real-time Safe Shield Assessment
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {liveRisk >= 0.5 
                        ? 'High probability of fraud. This transaction will be blocked!' 
                        : 'Secure transaction context. This transaction will be authorized.'}
                    </div>
                  </div>
                </div>
                
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>Fraud Risk</div>
                  <div style={{
                    fontSize: '1.25rem',
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 700,
                    color: liveRisk >= 0.5 ? 'var(--color-danger)' : 'var(--color-success)'
                  }}>
                    {(liveRisk * 100).toFixed(0)}%
                  </div>
                </div>
              </div>

              {/* Gateway security warnings/alerts */}
              {(gatewayError || validationErrors.length > 0) && (
                <div style={{
                  marginTop: '1.25rem',
                  padding: '1rem',
                  borderRadius: '12px',
                  backgroundColor: 'var(--color-danger-bg)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  fontSize: '0.85rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-danger)', fontWeight: 700 }}>
                    <ShieldAlert size={18} />
                    <span>{gatewayError || 'Gateway Security Block'}</span>
                  </div>
                  {validationErrors.length > 0 && (
                    <ul style={{ paddingLeft: '1.25rem', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.5rem' }}>
                      {validationErrors.map((err, i) => <li key={i}>{err}</li>)}
                    </ul>
                  )}
                  {rateLimitCooldown > 0 && (
                    <div style={{ marginTop: '0.5rem', fontWeight: 600, color: 'var(--color-warning)' }}>
                      Transaction lock active. Retry available in {rateLimitCooldown} seconds.
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="modal-footer" style={{ padding: '1rem 0 0 0', border: 'none' }}>
                <button type="button" onClick={onClose} className="btn btn-secondary" disabled={isProcessing}>
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ minWidth: '150px' }} 
                  disabled={rateLimitCooldown > 0 || isProcessing}
                >
                  {rateLimitCooldown > 0 ? (
                    `Limited (${rateLimitCooldown}s)`
                  ) : (
                    <><Send size={16} /> Pay Securely</>
                  )}
                </button>
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
}

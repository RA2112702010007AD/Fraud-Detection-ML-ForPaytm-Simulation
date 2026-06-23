import React from 'react';
import { 
  QrCode, 
  Phone, 
  Building2, 
  ArrowRightLeft, 
  Smartphone, 
  Lightbulb, 
  Tv, 
  Home, 
  ChevronRight, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle,
  HelpCircle,
  Clock,
  Sparkles,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { TransactionFeatures } from '../ml/mlEngine';

export interface Transaction {
  id: string;
  payeeName: string;
  category: string;
  amount: number;
  timestamp: Date;
  paymentMode: string;
  status: 'Approved' | 'Blocked';
  features: TransactionFeatures;
  riskScore: number;
  reasons?: string[];
}

interface WalletDashboardProps {
  balance: number;
  postpaidBalance: number;
  transactions: Transaction[];
  onOpenTransaction: (category: string, overrideFeatures?: Partial<TransactionFeatures>) => void;
  onShowExplanation: (transaction: Transaction) => void;
  profileName: string;
}

export default function WalletDashboard({
  balance,
  postpaidBalance,
  transactions,
  onOpenTransaction,
  onShowExplanation,
  profileName
}: WalletDashboardProps) {
  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Outer Two-Column Grid (Responsive: wraps to single column on mobile) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '2rem',
        alignItems: 'start'
      }}>
        
        {/* Left Column: 3D Credit Cards & Analytics Telemetry */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-paytm-cyan)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Zap size={18} /> Active Payment Instruments
          </h3>

          <div className="perspective-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Wallet Balance Card (3D Tilt Card) */}
            <div className="card-3d" style={{
              background: 'linear-gradient(135deg, #05100b 0%, #0c251a 50%, #1e4d3a 100%)',
              border: '1px solid rgba(212, 252, 52, 0.3)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '200px'
            }}>
              {/* Card Shine Reflection */}
              <div style={{
                position: 'absolute',
                top: '-50%', left: '-50%', width: '200%', height: '200%',
                background: 'radial-gradient(circle, rgba(212,252,52,0.08) 0%, transparent 70%)',
                pointerEvents: 'none'
              }} />
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', transform: 'translateZ(20px)' }}>
                <div>
                  <span className="card-3d-title">Paytm Wallet</span>
                  <div style={{ fontSize: '0.65rem', color: 'var(--color-paytm-cyan)', fontWeight: 600, letterSpacing: '0.1em', marginTop: '2px' }}>
                    SAFE WALLET SHIELD ACTIVE
                  </div>
                </div>
                <div className="card-chip" />
              </div>

              <div style={{ transform: 'translateZ(40px)', margin: '1rem 0' }}>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Available Balance
                </div>
                <h2 style={{ fontSize: '2.4rem', color: 'white', fontFamily: 'var(--font-heading)', fontWeight: 800 }}>
                  ₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </h2>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', transform: 'translateZ(25px)' }}>
                <div>
                  <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>Card Holder</div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'white' }}>{profileName}</div>
                </div>
                
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    onClick={() => onOpenTransaction('Wallet Transfer', { amount: 500, merchant_risk: 0.1 })} 
                    className="btn btn-primary" 
                    style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', borderRadius: '6px' }}
                  >
                    Add Money
                  </button>
                  <button 
                    onClick={() => onOpenTransaction('Bank Transfer', { amount: 1000, merchant_risk: 0.2 })} 
                    className="btn btn-secondary" 
                    style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', borderRadius: '6px', backgroundColor: 'rgba(255,255,255,0.05)', color: 'white' }}
                  >
                    Send Bank
                  </button>
                </div>
              </div>
            </div>

            {/* Paytm Postpaid Card (3D Tilt Card) */}
            <div className="card-3d" style={{
              background: 'linear-gradient(135deg, #18052b 0%, #3b0764 50%, #7c3aed 100%)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '200px'
            }}>
              {/* Holographic metallic glare */}
              <div style={{
                position: 'absolute',
                top: '-50%', left: '-50%', width: '200%', height: '200%',
                background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)',
                pointerEvents: 'none'
              }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', transform: 'translateZ(20px)' }}>
                <div>
                  <span className="card-3d-title">Paytm Postpaid</span>
                  <div style={{ fontSize: '0.65rem', color: '#b08bfc', fontWeight: 600, letterSpacing: '0.1em', marginTop: '2px' }}>
                    FLEXI CREDIT SHIELD
                  </div>
                </div>
                <div className="card-chip" style={{ background: 'linear-gradient(135deg, #e2e8f0 0%, #94a3b8 100%)' }} />
              </div>

              <div style={{ transform: 'translateZ(40px)', margin: '1rem 0' }}>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Available Credit Limit
                </div>
                <h2 style={{ fontSize: '2.4rem', color: 'white', fontFamily: 'var(--font-heading)', fontWeight: 800 }}>
                  ₹{postpaidBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </h2>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', transform: 'translateZ(25px)' }}>
                <div>
                  <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>Card Holder</div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'white' }}>{profileName}</div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span style={{ fontSize: '0.75rem', color: '#b08bfc', display: 'flex', alignItems: 'center', gap: '0.2rem', fontWeight: 500 }}>
                    <Sparkles size={12} /> Pre-Approved
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Core Shield Overview details */}
          <div className="glass-panel" style={{ background: 'rgba(0,186,242,0.02)', border: '1px dashed var(--color-paytm-cyan)' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.9rem', color: 'var(--color-paytm-cyan)', marginBottom: '0.5rem' }}>
              <ShieldCheck size={16} /> Safe Shield Visual Node
            </h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              Every transaction processed in this wallet triggers an active scan through the Random Forest ML classifier. View real-time scores by clicking tab metrics above.
            </p>
          </div>

        </div>

        {/* Right Column: Actions sub-grid & Transaction history */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Sub-grid: UPI Transfers & Recharges Side-by-Side */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
            alignItems: 'stretch'
          }}>
            {/* Main Money Transfer Methods */}
            <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <h3 style={{ marginBottom: '1.25rem', fontSize: '1rem', fontWeight: 600 }}>UPI Money Transfer</h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '0.5rem',
                textAlign: 'center'
              }}>
                <div 
                  onClick={() => onOpenTransaction('Scan QR', { merchant_risk: 0.35 })} 
                  style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}
                >
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-paytm-cyan)' }} className="quick-action-btn">
                    <QrCode size={20} />
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>Scan & Pay</span>
                </div>

                <div 
                  onClick={() => onOpenTransaction('To Mobile', { merchant_risk: 0.15 })}
                  style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}
                >
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-paytm-cyan)' }} className="quick-action-btn">
                    <Phone size={20} />
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>To Mobile</span>
                </div>

                <div 
                  onClick={() => onOpenTransaction('To Bank A/c', { merchant_risk: 0.25 })}
                  style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}
                >
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-paytm-cyan)' }} className="quick-action-btn">
                    <Building2 size={20} />
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>To Bank</span>
                </div>

                <div 
                  onClick={() => onOpenTransaction('Self Transfer', { merchant_risk: 0.05 })}
                  style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}
                >
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-paytm-cyan)' }} className="quick-action-btn">
                    <ArrowRightLeft size={20} />
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>To Self</span>
                </div>
              </div>
            </div>

            {/* Bill Recharges & Utilities Section */}
            <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <h3 style={{ marginBottom: '1.25rem', fontSize: '1rem', fontWeight: 600 }}>Recharge & Bills</h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '0.5rem',
                textAlign: 'center'
              }}>
                <div 
                  onClick={() => onOpenTransaction('Mobile Recharge', { amount: 399, merchant_risk: 0.1 })}
                  style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}
                >
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                    <Smartphone size={20} />
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>Mobile</span>
                </div>

                <div 
                  onClick={() => onOpenTransaction('Electricity Bill', { amount: 1540, merchant_risk: 0.05 })}
                  style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}
                >
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                    <Lightbulb size={20} />
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>Electric</span>
                </div>

                <div 
                  onClick={() => onOpenTransaction('DTH Connection', { amount: 450, merchant_risk: 0.08 })}
                  style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}
                >
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                    <Tv size={20} />
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>DTH</span>
                </div>

                <div 
                  onClick={() => onOpenTransaction('House Rent Payment', { amount: 8500, merchant_risk: 0.25 })}
                  style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}
                >
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                    <Home size={20} />
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>Rent Pay</span>
                </div>
              </div>
            </div>
          </div>

          {/* Transaction History Ledger */}
          <div className="glass-panel" style={{ flexGrow: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Recent Transactions</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Live monitoring via Safe Shield ML engine</p>
              </div>
              <span style={{ fontSize: '0.85rem', color: 'var(--color-paytm-cyan)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                View Statement <ChevronRight size={16} />
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {transactions.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  <Clock size={40} style={{ marginBottom: '0.75rem', strokeWidth: 1.5 }} />
                  <p>No transactions yet. Send money to initiate telemetry!</p>
                </div>
              ) : (
                transactions.map((tx) => (
                  <div 
                    key={tx.id} 
                    className="animate-slide-up"
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.85rem',
                      backgroundColor: 'var(--bg-primary)',
                      borderRadius: '10px',
                      border: '1px solid var(--border-color)'
                    }}
                  >
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        backgroundColor: tx.status === 'Approved' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: tx.status === 'Approved' ? 'var(--color-success)' : 'var(--color-danger)'
                      }}>
                        {tx.status === 'Approved' ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                      </div>
                      <div>
                        <h4 style={{ fontSize: '0.85rem', fontWeight: 600 }}>{tx.payeeName}</h4>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                          <span>{tx.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          <span>•</span>
                          <span>{tx.paymentMode}</span>
                          <span>•</span>
                          <span>Risk: {(tx.riskScore * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.15rem' }}>
                      <div style={{
                        fontFamily: 'var(--font-heading)',
                        fontWeight: 700,
                        fontSize: '0.95rem',
                        color: tx.status === 'Approved' ? 'var(--text-primary)' : 'var(--text-muted)',
                        textDecoration: tx.status === 'Blocked' ? 'line-through' : 'none'
                      }}>
                        ₹{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </div>
                      
                      {tx.status === 'Approved' ? (
                        <span className="badge badge-success" style={{ fontSize: '0.65rem', padding: '0.15rem 0.5rem' }}>Approved</span>
                      ) : (
                        <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                          <span className="badge badge-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.15rem', fontSize: '0.65rem', padding: '0.15rem 0.5rem' }}>
                            <ShieldAlert size={10} />
                            Blocked
                          </span>
                          <button
                            onClick={() => onShowExplanation(tx)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--color-paytm-cyan)',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              padding: '2px',
                            }}
                            title="Explain Block"
                          >
                            <HelpCircle size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>
      
    </div>
  );
}

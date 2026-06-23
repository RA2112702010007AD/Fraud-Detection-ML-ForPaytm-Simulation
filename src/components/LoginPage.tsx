import React, { useState, useRef } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  User, 
  Key, 
  Building2, 
  Globe, 
  ShieldAlert, 
  ArrowRight, 
  Sparkles,
  Check,
  Zap,
  HelpCircle,
  Play
} from 'lucide-react';
import { TransactionFeatures } from '../ml/mlEngine';

export interface UserProfile {
  id: string;
  name: string;
  role: string;
  balance: number;
  postpaidBalance: number;
  description: string;
  avatarText: string;
  badgeText: string;
  badgeClass: 'badge-success' | 'badge-warning' | 'badge-danger';
  icon: React.ReactNode;
  defaultFeatures: Partial<TransactionFeatures>;
}

interface LoginPageProps {
  onLogin: (profile: UserProfile) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const loginFormRef = useRef<HTMLDivElement | null>(null);

  const simulatedProfiles: UserProfile[] = [
    {
      id: 'profile_1',
      name: 'Aditya Sharma',
      role: 'Retail Merchant',
      balance: 78500,
      postpaidBalance: 12000,
      description: 'Standard merchant profile. Local day-time transactions, verified phone signature, low risk rating.',
      avatarText: 'AS',
      badgeText: 'Low Risk Profile',
      badgeClass: 'badge-success',
      icon: <Building2 size={20} />,
      defaultFeatures: {
        amount: 250,
        hour: 14,
        velocity_1h: 1,
        location_changed: 0,
        device_trusted: 1,
        merchant_risk: 0.1
      }
    },
    {
      id: 'profile_2',
      name: 'Priya Patel',
      role: 'Frequent Traveler',
      balance: 42200,
      postpaidBalance: 5000,
      description: 'Active traveler profile. High location mismatches (billing vs POS), mid-level merchant risk, verified device.',
      avatarText: 'PP',
      badgeText: 'Medium Risk Heuristics',
      badgeClass: 'badge-warning',
      icon: <Globe size={20} />,
      defaultFeatures: {
        amount: 1450,
        hour: 19,
        velocity_1h: 2,
        location_changed: 1,
        device_trusted: 1,
        merchant_risk: 0.45
      }
    },
    {
      id: 'profile_3',
      name: 'Rajesh Kumar',
      role: 'High-Risk Sandboxed Target',
      balance: 6120,
      postpaidBalance: 1500,
      description: 'Flagged compromised profile. Access from unverified emulator, high midnight transaction velocity, high-risk payees.',
      avatarText: 'RK',
      badgeText: 'Critical Fraud Warnings',
      badgeClass: 'badge-danger',
      icon: <ShieldAlert size={20} />,
      defaultFeatures: {
        amount: 4900,
        hour: 3,
        velocity_1h: 7,
        location_changed: 1,
        device_trusted: 0,
        merchant_risk: 0.85
      }
    }
  ];

  const handleSelectProfile = (profile: UserProfile) => {
    setSelectedProfile(profile);
    setUsername(profile.name.toLowerCase().replace(' ', '_') + '@paytm.security');
    setPassword('••••••••••••');
    
    // Smooth scroll to login form
    loginFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProfile) {
      alert("Please select a simulated user profile below to log in!");
      return;
    }
    setIsLoggingIn(true);
    
    setTimeout(() => {
      onLogin(selectedProfile);
      setIsLoggingIn(false);
    }, 1200);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 }}>
      
      {/* Helvetiq-inspired Minimalist Header */}
      <header style={{
        height: '80px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2.5rem',
        borderBottom: '1px solid var(--border-color)',
        backdropFilter: 'blur(10px)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: 'rgba(255,255,255,0.01)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldCheck size={26} style={{ color: 'var(--color-paytm-cyan)' }} />
          <span style={{ 
            fontFamily: 'var(--font-heading)', 
            fontWeight: 800, 
            fontSize: '1.4rem', 
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em'
          }}>
            Paytm Safe Shield
          </span>
        </div>

        <nav style={{ display: 'flex', gap: '2rem', fontSize: '0.9rem', fontWeight: 500 }} className="desktop-only">
          <a href="#profiles" style={{ color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.2s' }}>Profiles</a>
          <a href="#features" style={{ color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.2s' }}>Security Specs</a>
          <a href="https://paytm.com" target="_blank" rel="noreferrer" style={{ color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.2s' }}>Paytm Main</a>
        </nav>

        <div>
          <button 
            onClick={() => loginFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
            className="btn btn-secondary" 
            style={{ 
              borderRadius: '9999px', 
              padding: '0.5rem 1.25rem', 
              fontSize: '0.85rem',
              border: '1px solid var(--text-primary)'
            }}
          >
            Access Portal
          </button>
        </div>
      </header>

      {/* Main Landing & Hero Section */}
      <main style={{ flexGrow: 1 }}>
        
        {/* Hero Section */}
        <section className="container" style={{ padding: '4rem 1.5rem', marginTop: '1rem' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '3rem',
            alignItems: 'center'
          }}>
            
            {/* Left Hero Column */}
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
              <div style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '0.5rem', 
                padding: '0.4rem 1rem', 
                backgroundColor: 'var(--bg-tertiary)', 
                border: '1px solid var(--border-color)',
                borderRadius: '9999px',
                width: 'fit-content'
              }}>
                <span style={{ color: 'var(--color-paytm-cyan)', fontWeight: 700, fontSize: '0.85rem' }}>✓</span>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-primary)' }}>
                  Fraud Prevention Reinvented
                </span>
              </div>

              <h1 style={{ 
                fontSize: '3.6rem', 
                fontFamily: 'var(--font-heading)', 
                fontWeight: 700, 
                lineHeight: '1.05', 
                color: 'var(--text-primary)',
                letterSpacing: '-0.03em'
              }}>
                SECURITY <br />THAT'S SECURE, SIMPLE, AND BUILT AROUND YOU.
              </h1>

              <p style={{ 
                color: 'var(--text-secondary)', 
                fontSize: '1.1rem', 
                lineHeight: '1.6', 
                maxWidth: '520px' 
              }}>
                We combine real-time machine learning telemetry with intuitive decision tree interfaces, giving you total confidence and full control over your financial transactions.
              </p>

              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <a 
                  href="#profiles" 
                  className="btn btn-primary" 
                  style={{ borderRadius: '9999px', padding: '0.85rem 1.75rem', fontWeight: 600 }}
                >
                  Select Sandbox User
                </a>
                <a 
                  href="#features" 
                  className="btn btn-secondary" 
                  style={{ borderRadius: '9999px', padding: '0.85rem 1.75rem', fontWeight: 600 }}
                >
                  Learn How It Works →
                </a>
              </div>

              {/* Trust Group */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '1rem', 
                borderTop: '1px solid var(--border-color)', 
                paddingTop: '1.75rem',
                marginTop: '1rem'
              }}>
                <div style={{ display: 'flex', marginLeft: '0.5rem' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', border: '2px solid var(--bg-primary)', backgroundColor: '#3b82f6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.75rem', zIndex: 3 }}>AS</div>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', border: '2px solid var(--bg-primary)', backgroundColor: '#ec4899', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.75rem', marginLeft: '-10px', zIndex: 2 }}>PP</div>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', border: '2px solid var(--bg-primary)', backgroundColor: '#ef4444', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.75rem', marginLeft: '-10px', zIndex: 1 }}>RK</div>
                </div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                  Select simulated profile below to explore transaction outcomes.
                </span>
              </div>
            </div>

            {/* Right Hero Column - Interactive Form & floating preview */}
            <div ref={loginFormRef} className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div className="glass-panel" style={{
                padding: '2.5rem',
                borderRadius: '24px',
                border: '1px solid var(--border-glow)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                  <Lock size={18} style={{ color: 'var(--color-paytm-cyan)' }} />
                  <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)', fontWeight: 700 }}>
                    Security Portal Authentication
                  </h3>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                    <label className="form-label">Secure Handle</label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }}>
                        <User size={16} />
                      </span>
                      <input 
                        type="text" 
                        className="form-control" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="select_profile@paytm.security"
                        style={{ paddingLeft: '2.5rem' }}
                        required 
                      />
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <label className="form-label">biometric certificate</label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }}>
                        <Key size={16} />
                      </span>
                      <input 
                        type="password" 
                        className="form-control" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        style={{ paddingLeft: '2.5rem' }}
                        required 
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="btn btn-primary" 
                    style={{ width: '100%', borderRadius: '9999px', gap: '0.5rem', fontSize: '0.95rem' }}
                    disabled={isLoggingIn}
                  >
                    {isLoggingIn ? 'Verifying Encrypted Tokens...' : 'Authenticate Securely'}
                    <ArrowRight size={16} />
                  </button>
                </form>

                {selectedProfile && (
                  <div style={{ 
                    marginTop: '1.5rem', 
                    padding: '0.75rem 1rem', 
                    backgroundColor: 'rgba(212, 252, 52, 0.08)', 
                    border: '1px solid var(--color-paytm-cyan)', 
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.8rem',
                    color: 'var(--text-primary)'
                  }}>
                    <Check size={14} style={{ color: 'var(--color-paytm-cyan)' }} />
                    <span>Loaded profile: <strong>{selectedProfile.name}</strong></span>
                  </div>
                )}
              </div>

              {/* Developer Flipcard */}
              <div className="flip-card">
                <div className="flip-card-inner">
                  {/* Front Face */}
                  <div className="flip-card-front">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ textAlign: 'left' }}>
                        <span style={{ fontSize: '0.65rem', color: 'var(--color-paytm-cyan)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                          Lead AI Architect & Developer
                        </span>
                        <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 600, marginTop: '2px' }}>
                          Anurag Das
                        </h4>
                      </div>
                      <div style={{ 
                        width: '36px', 
                        height: '36px', 
                        borderRadius: '50%', 
                        background: 'rgba(212, 252, 52, 0.1)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        color: 'var(--color-paytm-cyan)',
                        border: '1px solid var(--border-glow)'
                      }}>
                        <Zap size={16} />
                      </div>
                    </div>

                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Organization</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>SRM Kattankulathur</div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                      <span>SECURE NODE ACCREDITED</span>
                      <span>HOVER TO DECRYPT</span>
                    </div>
                  </div>

                  {/* Back Face */}
                  <div className="flip-card-back">
                    <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '0.5rem', height: '100%' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.65rem', color: 'var(--color-paytm-cyan)', fontWeight: 700 }}>AUTHENTICATED</span>
                        <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>M.TECH COGNITIVE</span>
                      </div>
                      
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.25rem' }}>
                        <div>📧 anuragdas.87542026@outlook.com</div>
                        <div>📱 +91 7200417473</div>
                        <div>💼 AI/ML Intern @ Denvik Tech</div>
                      </div>

                      <button 
                        type="button"
                        onClick={() => {
                          const aditya = simulatedProfiles.find(p => p.id === 'profile_1');
                          if (aditya) {
                            handleSelectProfile(aditya);
                          }
                        }}
                        className="btn btn-primary"
                        style={{ 
                          width: '100%', 
                          padding: '0.35rem 0.5rem', 
                          fontSize: '0.75rem', 
                          borderRadius: '8px', 
                          marginTop: 'auto' 
                        }}
                      >
                        Auto-Fill Admin Sandbox
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* 3D floating cards banner decoration */}
        <section style={{ 
          padding: '2rem 0',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden',
          position: 'relative'
        }}>
          <div style={{ display: 'flex', gap: '3rem', transform: 'rotate(-4deg)', padding: '1rem 0' }}>
            <div className="card-3d" style={{
              width: '280px',
              height: '176px',
              background: 'linear-gradient(135deg, #0c251a 0%, #1e4d3a 100%)',
              border: '1px solid rgba(212,252,52,0.2)',
              borderRadius: '16px',
              padding: '1.5rem',
              color: 'white',
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
              transform: 'translateY(-10px)'
            }}>
              <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>PAYTM WALLET</div>
              <h3 style={{ fontSize: '1.5rem', marginTop: '1.5rem', fontFamily: 'monospace' }}>₹78,500.00</h3>
            </div>
            
            <div className="card-3d" style={{
              width: '280px',
              height: '176px',
              background: 'linear-gradient(135deg, #d4fc34 0%, #a3cf02 100%)',
              border: '1px solid rgba(0,0,0,0.1)',
              borderRadius: '16px',
              padding: '1.5rem',
              color: '#05100b',
              boxShadow: '0 30px 50px rgba(212,252,52,0.15)',
              transform: 'translateY(10px)'
            }}>
              <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>PAYTM POSTPAID</div>
              <h3 style={{ fontSize: '1.5rem', marginTop: '1.5rem', fontFamily: 'monospace' }}>₹12,000.00</h3>
            </div>
          </div>
        </section>

        {/* Profiles Select Grid Section */}
        <section id="profiles" style={{ padding: '6rem 1.5rem', borderTop: '1px solid var(--border-color)' }}>
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-paytm-cyan)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
                SIMULATION GATEWAY
              </div>
              <h2 style={{ 
                fontFamily: 'var(--font-heading)', 
                fontSize: '2.5rem', 
                fontWeight: 600,
                color: 'var(--text-primary)'
              }}>
                Your trusted partner in financial growth
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginTop: '0.5rem' }}>
                Select a simulated customer persona card below to activate sandbox telemetry dashboard.
              </p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '2rem'
            }}>
              {simulatedProfiles.map((profile) => (
                <div 
                  key={profile.id}
                  onClick={() => handleSelectProfile(profile)}
                  style={{
                    backgroundColor: selectedProfile?.id === profile.id ? 'var(--bg-secondary)' : 'var(--profile-card-bg)',
                    border: selectedProfile?.id === profile.id 
                      ? '2px solid var(--color-paytm-cyan)' 
                      : '1px solid var(--border-color)',
                    borderRadius: '20px',
                    padding: '2rem',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                    boxShadow: selectedProfile?.id === profile.id ? '0 15px 30px rgba(212, 252, 52, 0.1)' : 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '260px'
                  }}
                  className="profile-login-card-luxury"
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                      <div style={{
                        width: '45px',
                        height: '45px',
                        borderRadius: '12px',
                        backgroundColor: 'var(--bg-tertiary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--color-paytm-cyan)'
                      }}>
                        {profile.icon}
                      </div>
                      <span className={`badge ${profile.badgeClass}`}>
                        {profile.badgeText}
                      </span>
                    </div>

                    <h3 style={{ 
                      fontSize: '1.25rem', 
                      fontFamily: 'var(--font-heading)', 
                      fontWeight: 600, 
                      color: 'var(--text-primary)',
                      marginBottom: '0.5rem'
                    }}>
                      {profile.name}
                    </h3>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '1rem' }}>
                      {profile.role}
                    </div>

                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                      {profile.description}
                    </p>
                  </div>

                  <div style={{ 
                    marginTop: '2rem', 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    borderTop: '1px solid var(--border-color)',
                    paddingTop: '1rem'
                  }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Wallet Limit</span>
                    <strong style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>
                      ₹{profile.balance.toLocaleString('en-IN')}
                    </strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Helvetiq style 4-column spec grid */}
        <section id="features" style={{ 
          padding: '6rem 1.5rem', 
          backgroundColor: 'var(--bg-secondary)', 
          borderTop: '1px solid var(--border-color)',
          borderBottom: '1px solid var(--border-color)'
        }}>
          <div className="container">
            <h2 style={{ 
              fontFamily: 'var(--font-heading)', 
              fontSize: '2.5rem', 
              color: 'var(--text-primary)', 
              marginBottom: '3rem',
              maxWidth: '600px'
            }}>
              There's a lot to love about Paytm Safe Shield
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1.5rem'
            }}>
              {/* Feature 1 */}
              <div style={{
                background: 'var(--bg-tertiary)',
                borderRadius: '16px',
                padding: '2rem',
                border: '1px solid var(--border-color)'
              }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-paytm-cyan)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '1rem' }}>
                  Cyber Security
                </div>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 500, marginBottom: '1rem' }}>
                  Swiss-Grade Classification
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                  Advanced bootstrap Random Forest ensemble checks amount velocity, billing location, and device signatures.
                </p>
              </div>

              {/* Feature 2 */}
              <div style={{
                background: 'var(--color-paytm-cyan)',
                borderRadius: '16px',
                padding: '2rem',
                border: '1px solid rgba(0,0,0,0.1)',
                color: '#05100b'
              }}>
                <div style={{ fontSize: '0.75rem', opacity: 0.8, fontWeight: 700, textTransform: 'uppercase', marginBottom: '1rem' }}>
                  Real-Time
                </div>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 500, marginBottom: '1rem' }}>
                  Clear, Automated Blocking
                </h3>
                <p style={{ fontSize: '0.85rem', opacity: 0.9, lineHeight: '1.5' }}>
                  Instantly declines anomalous high-risk actions. Toggle threshold sliders to control strictness.
                </p>
              </div>

              {/* Feature 3 */}
              <div style={{
                background: 'var(--bg-tertiary)',
                borderRadius: '16px',
                padding: '2rem',
                border: '1px solid var(--border-color)'
              }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-paytm-cyan)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '1rem' }}>
                  Playground Sandbox
                </div>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 500, marginBottom: '1rem' }}>
                  Stress Test Attacks
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                  Fire batch hacking queries inside our sandbox to stress-test metrics, confusion matrix, and system alarms.
                </p>
              </div>

              {/* Feature 4 */}
              <div style={{
                background: 'var(--bg-tertiary)',
                borderRadius: '16px',
                padding: '2rem',
                border: '1px solid var(--border-color)'
              }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-paytm-cyan)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '1rem' }}>
                  Explainability
                </div>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 500, marginBottom: '1rem' }}>
                  Transparent Decrypted Logs
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                  Every warning log provides clear reasons justifying the model block decision for enhanced compliance.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Supported Protocols Trust Wall */}
        <section style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
          <div className="container">
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
              Supported and integrated security protocols
            </span>
            
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '3.5rem',
              marginTop: '1.75rem',
              opacity: 0.65
            }}>
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.25rem' }}>UPI Wallet Standard</span>
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.25rem' }}>RuPay Secure</span>
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.25rem' }}>PCI-DSS Level 1</span>
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.25rem' }}>HDFC Netbanking Shield</span>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer style={{ 
        borderTop: '1px solid var(--border-color)', 
        padding: '3rem 1.5rem', 
        backgroundColor: 'var(--bg-primary)',
        fontSize: '0.85rem',
        color: 'var(--text-secondary)'
      }}>
        <div className="container" style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1.5rem'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
              <ShieldCheck size={20} style={{ color: 'var(--color-paytm-cyan)' }} />
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem' }}>Paytm Safe Shield</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              © 2026 Paytm. Secure payment systems powered by Real-Time Safe Shield Random Forest Classifier.
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '2rem' }}>
            <span>Privacy Policy</span>
            <span>API Docs</span>
            <span>Paytm Security</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

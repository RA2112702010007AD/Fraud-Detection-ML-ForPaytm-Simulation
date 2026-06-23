import React from 'react';
import { Wallet, ShieldCheck, Sun, Moon, LogOut } from 'lucide-react';
import { UserProfile } from './LoginPage';

interface NavbarProps {
  activeTab: 'wallet' | 'ml';
  setActiveTab: (tab: 'wallet' | 'ml') => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
  balance: number;
  currentProfile: UserProfile | null;
  onLogout: () => void;
}

export default function Navbar({
  activeTab,
  setActiveTab,
  isDarkMode,
  toggleTheme,
  balance,
  currentProfile,
  onLogout
}: NavbarProps) {
  return (
    <header className="paytm-header">
      <div className="container" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: '70px'
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <div className="paytm-logo" style={{ fontSize: '1.25rem', lineHeight: '1.2', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <ShieldCheck size={22} style={{ color: 'var(--color-paytm-cyan)' }} />
            <span style={{ color: 'var(--text-primary)' }}>Fraud Detection</span>
          </div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, paddingLeft: '26px' }}>
            A project for paytm
          </div>
        </div>

        {/* Navigation Tabs */}
        {currentProfile && (
          <nav style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button
              onClick={() => setActiveTab('wallet')}
              className={`btn ${activeTab === 'wallet' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.5rem 1.25rem', borderRadius: '10px' }}
            >
              <Wallet size={16} />
              Wallet Portal
            </button>
            
            <button
              onClick={() => setActiveTab('ml')}
              className={`btn ${activeTab === 'ml' ? 'btn-primary' : 'btn-secondary'}`}
              style={{
                padding: '0.5rem 1.25rem',
                borderRadius: '10px',
                border: activeTab === 'ml' ? 'none' : '1px dashed var(--color-paytm-cyan)',
                color: activeTab === 'ml' ? undefined : 'var(--color-paytm-cyan)',
                background: activeTab === 'ml' ? undefined : 'rgba(212, 252, 52, 0.05)'
              }}
            >
              <ShieldCheck size={16} />
              ML Analytics Room
            </button>
          </nav>
        )}
 
        {/* User profile & Theme Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          {currentProfile && (
            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {currentProfile.name}
              </span>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                {currentProfile.role}
              </span>
            </div>
          )}

          {currentProfile && (
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--color-paytm-cyan), var(--color-paytm-blue))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              color: 'white',
              fontFamily: 'var(--font-heading)',
              boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
              fontSize: '0.9rem'
            }}>
              {currentProfile.avatarText}
            </div>
          )}

          <button
            onClick={toggleTheme}
            style={{
              background: 'none',
              border: '1px solid var(--border-color)',
              borderRadius: '50%',
              width: '38px',
              height: '38px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-primary)',
            }}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {currentProfile && (
            <button
              onClick={onLogout}
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: '50%',
                width: '38px',
                height: '38px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-danger)',
                transition: 'all 0.2s ease'
              }}
              title="Logout Profile Session"
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

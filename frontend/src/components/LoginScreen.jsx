import React, { useState } from 'react';

// Automatically uses your backend URL
const API_BASE_URL = 'https://restaurant-backend-fphb.onrender.com';

export default function LoginScreen({ onLoginSuccess }) {
  const [currentView, setCurrentView] = useState('signin'); // 'signin', 'signup', 'forgot'
  
  // Login States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  
  // Forgot Password States
  const [forgotEmail, setForgotEmail] = useState('');

  // Signup States
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [formData, setFormData] = useState({
    businessName: '',
    ownerName: '',
    email: '',
    password: '',
    phoneNumber: '',
    whatsappNumber: '',
    line1: '',
    line2: '',
    area: '',
    zipCode: '',
    state: '',
    latitude: '',
    longitude: ''
  });

  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Login Handler (Cleaned up so it doesn't duplicate loading text)
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user_email', loginEmail);
        onLoginSuccess();
      } else {
        setMessage(data.message || 'Invalid credentials or account locked.');
      }
    } catch (error) {
      setMessage('Network error: Could not connect to backend.');
    } finally {
      setLoading(false);
    }
  };

  // Forgot Password Handler
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await response.json();
      
      if (response.ok) {
        setMessage('Success! Reset token generated.');
        console.log("Reset Token:", data.reset_token);
      } else {
        setMessage(data.message || 'Email not found.');
      }
    } catch (error) {
      setMessage('Network error: Could not connect to backend.');
    } finally {
      setLoading(false);
    }
  };

  // Registration Handler
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (formData.password.length < 8) {
      setMessage('Password must be at least 8 characters long.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          businessName: formData.businessName,
          ownerName: formData.ownerName,
          phoneNumber: formData.phoneNumber,
          whatsappNumber: formData.whatsappNumber,
          address: {
            line1: formData.line1,
            line2: formData.line2,
            area: formData.area,
            zipCode: formData.zipCode,
            state: formData.state
          },
          location: {
            latitude: parseFloat(formData.latitude),
            longitude: parseFloat(formData.longitude)
          }
        }),
      });
      const data = await response.json();

      if (response.ok) {
        setMessage('Registration successful! Please sign in.');
        setCurrentView('signin');
      } else {
        setMessage(data.message || 'Registration failed.');
      }
    } catch (error) {
      setMessage('Network error during registration.');
    } finally {
      setLoading(false);
    }
  };

  const EyeIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    </svg>
  );

  const EyeOffIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
      <line x1="1" y1="1" x2="23" y2="23"></line>
    </svg>
  );

  return (
    <div style={styles.pageContainer}>
      <div style={styles.brandContainer}>
        <div style={styles.brandTitle}>restaurant<span style={{color: '#3b82f6'}}>portal</span></div>
        <div style={styles.brandSubtitle}>Secure Onboarding & Management Platform</div>
      </div>

      <div style={{ 
        ...styles.card, 
        maxWidth: currentView === 'signup' ? '820px' : '600px',
        padding: currentView === 'signup' ? '45px' : '50px'
      }}>
        
        <div style={styles.tabContainer}>
          <button 
            type="button" 
            style={{
              ...styles.tabButton, 
              backgroundColor: currentView === 'signin' ? '#1e293b' : 'transparent',
              color: currentView === 'signin' ? '#ffffff' : '#94a3b8',
              boxShadow: currentView === 'signin' ? '0 4px 12px rgba(0,0,0,0.3)' : 'none'
            }}
            onClick={() => { setCurrentView('signin'); setMessage(''); }}
          >
            Sign In
          </button>
          <button 
            type="button" 
            style={{
              ...styles.tabButton, 
              backgroundColor: currentView === 'signup' ? '#1e293b' : 'transparent',
              color: currentView === 'signup' ? '#ffffff' : '#94a3b8',
              boxShadow: currentView === 'signup' ? '0 4px 12px rgba(0,0,0,0.3)' : 'none'
            }}
            onClick={() => { setCurrentView('signup'); setMessage(''); }}
          >
            Create Account
          </button>
        </div>

        {/* SIGN IN VIEW */}
        {currentView === 'signin' && (
          <form onSubmit={handleLogin} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Email Address</label>
              <input 
                type="email" 
                placeholder="owner@restaurant.com" 
                value={loginEmail} 
                onChange={(e) => setLoginEmail(e.target.value)} 
                style={styles.input}
                required 
              />
            </div>

            <div style={styles.inputGroup}>
              <div style={styles.labelRow}>
                <label style={styles.label}>Password</label>
                <a href="#forgot" onClick={(e) => { e.preventDefault(); setCurrentView('forgot'); setMessage(''); }} style={styles.forgotLink}>Forgot password?</a>
              </div>
              <div style={styles.passwordWrapper}>
                <input 
                  type={showLoginPassword ? 'text' : 'password'} 
                  placeholder="••••••••" 
                  value={loginPassword} 
                  onChange={(e) => setLoginPassword(e.target.value)} 
                  style={{ ...styles.input, paddingRight: '50px' }}
                  required 
                />
                <button 
                  type="button" 
                  onClick={() => setShowLoginPassword(!showLoginPassword)} 
                  style={styles.eyeButton}
                  title={showLoginPassword ? "Hide password" : "Show password"}
                >
                  {showLoginPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            <button type="submit" style={styles.primaryButton} disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        )}

        {/* FORGOT PASSWORD VIEW */}
        {currentView === 'forgot' && (
          <form onSubmit={handleForgotPassword} style={styles.form}>
            <div style={styles.headerTextGroup}>
              <h2 style={styles.cardHeaderTitle}>Reset Password</h2>
              <p style={styles.cardHeaderSubtitle}>Enter your registered email address to generate a recovery token.</p>
            </div>
            
            <div style={styles.inputGroup}>
              <label style={styles.label}>Email Address</label>
              <input 
                type="email" 
                placeholder="owner@restaurant.com" 
                value={forgotEmail} 
                onChange={(e) => setForgotEmail(e.target.value)} 
                style={styles.input}
                required 
              />
            </div>

            <button type="submit" style={styles.primaryButton} disabled={loading}>
              {loading ? 'Processing...' : 'Send Reset Token'}
            </button>
            <button type="button" onClick={() => setCurrentView('signin')} style={styles.secondaryButton}>
              Back to Sign In
            </button>
          </form>
        )}

        {/* SIGN UP VIEW */}
        {currentView === 'signup' && (
          <form onSubmit={handleRegister} style={styles.form}>
            <div style={styles.headerTextGroup}>
              <h2 style={styles.cardHeaderTitle}>Restaurant Onboarding</h2>
              <p style={styles.cardHeaderSubtitle}>Register your restaurant and configure your administrative profile.</p>
            </div>
            
            <div style={styles.sectionTitle}>Business & Owner Information</div>
            <div style={styles.row}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Business Name *</label>
                <input type="text" name="businessName" placeholder="e.g. Spice Garden" value={formData.businessName} onChange={handleInputChange} style={styles.input} required />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Owner Name *</label>
                <input type="text" name="ownerName" placeholder="e.g. John Doe" value={formData.ownerName} onChange={handleInputChange} style={styles.input} required />
              </div>
            </div>

            <div style={styles.row}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Email Address *</label>
                <input type="email" name="email" placeholder="owner@restaurant.com" value={formData.email} onChange={handleInputChange} style={styles.input} required />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Password (min 8 chars) *</label>
                <div style={styles.passwordWrapper}>
                  <input 
                    type={showSignupPassword ? 'text' : 'password'} 
                    placeholder="••••••••" 
                    value={formData.password} 
                    name="password"
                    onChange={handleInputChange} 
                    style={{ ...styles.input, paddingRight: '50px' }}
                    required 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowSignupPassword(!showSignupPassword)} 
                    style={styles.eyeButton}
                    title={showSignupPassword ? "Hide password" : "Show password"}
                  >
                    {showSignupPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>
            </div>

            <div style={styles.row}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Phone Number (10 digits) *</label>
                <input type="text" name="phoneNumber" placeholder="9876543210" value={formData.phoneNumber} onChange={handleInputChange} style={styles.input} required />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>WhatsApp Number</label>
                <input type="text" name="whatsappNumber" placeholder="9876543210" value={formData.whatsappNumber} onChange={handleInputChange} style={styles.input} />
              </div>
            </div>

            <div style={styles.sectionTitle}>Address & GPS Location</div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Address Line 1 *</label>
              <input type="text" name="line1" placeholder="Street address or building name" value={formData.line1} onChange={handleInputChange} style={styles.input} required />
            </div>
            
            <div style={styles.row}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Address Line 2</label>
                <input type="text" name="line2" placeholder="Suite, floor, etc. (optional)" value={formData.line2} onChange={handleInputChange} style={styles.input} />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Area</label>
                <input type="text" name="area" placeholder="Locality or neighborhood" value={formData.area} onChange={handleInputChange} style={styles.input} />
              </div>
            </div>

            <div style={styles.row}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Zip Code *</label>
                <input type="text" name="zipCode" placeholder="6-digit postal code" value={formData.zipCode} onChange={handleInputChange} style={styles.input} required />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>State *</label>
                <input type="text" name="state" placeholder="State/Province" value={formData.state} onChange={handleInputChange} style={styles.input} required />
              </div>
            </div>

            <div style={styles.row}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Latitude *</label>
                <input type="number" step="any" name="latitude" placeholder="e.g. 28.6139" value={formData.latitude} onChange={handleInputChange} style={styles.input} required />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Longitude *</label>
                <input type="number" step="any" name="longitude" placeholder="e.g. 77.2090" value={formData.longitude} onChange={handleInputChange} style={styles.input} required />
              </div>
            </div>

            <button type="submit" style={{ ...styles.primaryButton, marginTop: '16px' }} disabled={loading}>
              {loading ? 'Submitting...' : 'Complete Registration'}
            </button>
          </form>
        )}

        {message && (
          <div style={{
            ...styles.messageBox, 
            color: message.includes('Success') || message.includes('successful') ? '#4ade80' : '#f87171'
          }}>
            {message}
          </div>
        )}
      </div>

      <div style={styles.footerText}>
        Secure Restaurant Onboarding Portal &copy; 2026. Data processed in compliance with regulatory standards.
      </div>
    </div>
  );
}

const styles = {
  pageContainer: { 
    display: 'flex', 
    flexDirection: 'column', 
    justifyContent: 'flex-start', 
    alignItems: 'center', 
    width: '100vw', 
    minHeight: '100vh', 
    backgroundColor: '#030712', 
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', 
    color: '#f8fafc', 
    padding: '40px 20px', 
    margin: 0, 
    boxSizing: 'border-box', 
    overflowY: 'auto'
  },
  brandContainer: { textAlign: 'center', marginBottom: '30px', marginTop: '20px' },
  brandTitle: { fontSize: '38px', fontWeight: '800', letterSpacing: '-0.5px', color: '#ffffff' },
  brandSubtitle: { fontSize: '15px', color: '#64748b', marginTop: '6px', fontWeight: '500' },
  card: { backgroundColor: '#0b132b', border: '1px solid #1e293b', borderRadius: '24px', width: '100%', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)', boxSizing: 'border-box', transition: 'all 0.3s ease', marginBottom: '40px' },
  headerTextGroup: { marginBottom: '20px', textAlign: 'left' },
  cardHeaderTitle: { fontSize: '22px', fontWeight: '700', color: '#ffffff', margin: '0 0 6px 0' },
  cardHeaderSubtitle: { fontSize: '14px', color: '#94a3b8', margin: 0, lineHeight: '1.4' },
  sectionTitle: { fontSize: '12px', fontWeight: '700', color: '#3b82f6', marginTop: '20px', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.8px', textAlign: 'left' },
  tabContainer: { display: 'flex', backgroundColor: '#070d1a', borderRadius: '12px', padding: '6px', marginBottom: '28px', border: '1px solid #162032' },
  tabButton: { flex: 1, padding: '15px', borderRadius: '9px', border: 'none', fontSize: '16px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s ease' },
  form: { display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'left' },
  row: { display: 'flex', gap: '20px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, textAlign: 'left' },
  labelRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' },
  label: { fontSize: '14px', fontWeight: '600', color: '#cbd5e1', letterSpacing: '0.2px', textAlign: 'left' },
  forgotLink: { fontSize: '13px', color: '#3b82f6', textDecoration: 'none', fontWeight: '500' },
  passwordWrapper: { position: 'relative', display: 'flex', alignItems: 'center', width: '100%' },
  input: { width: '100%', padding: '16px 20px', backgroundColor: '#070d1a', border: '1px solid #1e293b', borderRadius: '12px', color: '#ffffff', fontSize: '16px', outline: 'none', boxSizing: 'border-box', textAlign: 'left', transition: 'border-color 0.2s' },
  eyeButton: { position: 'absolute', right: '16px', backgroundColor: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px', transition: 'color 0.2s' },
  primaryButton: { backgroundColor: '#2563eb', color: '#ffffff', border: 'none', padding: '16px', borderRadius: '12px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', marginTop: '10px', transition: 'background-color 0.2s' },
  secondaryButton: { backgroundColor: 'transparent', color: '#94a3b8', border: '1px solid #1e293b', padding: '14px', borderRadius: '12px', fontSize: '14px', cursor: 'pointer', fontWeight: '500' },
  messageBox: { fontSize: '14px', textAlign: 'center', fontWeight: '500', marginTop: '14px', padding: '12px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.03)' },
  footerText: { marginTop: '10px', marginBottom: '30px', fontSize: '12px', color: '#475569', textAlign: 'center', maxWidth: '500px', lineHeight: '1.5' }
};
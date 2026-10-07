import React, { useState } from 'react';

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

  // Login Handler
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('Signing in...');

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('auth_token', data.token);
        onLoginSuccess(); // Directly switches to the POS Dashboard!
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
    setMessage('Processing reset request...');

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await response.json();
      
      if (response.ok) {
        setMessage('Success! Reset token generated (Check console/response).');
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
    setMessage('Registering restaurant...');

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
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    </svg>
  );

  const EyeOffIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
        maxWidth: currentView === 'signup' ? '720px' : '500px',
        padding: currentView === 'signup' ? '40px' : '44px'
      }}>
        <div style={styles.tabContainer}>
          <button 
            type="button" 
            style={{
              ...styles.tabButton, 
              backgroundColor: currentView === 'signin' ? '#1e293b' : 'transparent',
              color: currentView === 'signin' ? '#ffffff' : '#94a3b8',
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
            }}
            onClick={() => { setCurrentView('signup'); setMessage(''); }}
          >
            Create Account
          </button>
        </div>

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
                  style={{ ...styles.input, paddingRight: '45px' }}
                  required 
                />
                <button type="button" onClick={() => setShowLoginPassword(!showLoginPassword)} style={styles.eyeButton}>
                  {showLoginPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            <button type="submit" style={styles.primaryButton} disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        )}

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
                    style={{ ...styles.input, paddingRight: '45px' }}
                    required 
                  />
                  <button type="button" onClick={() => setShowSignupPassword(!showSignupPassword)} style={styles.eyeButton}>
                    {showSignupPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>
            </div>

            <div style={styles.row}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Phone Number *</label>
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
              <input type="text" name="line1" placeholder="Street address" value={formData.line1} onChange={handleInputChange} style={styles.input} required />
            </div>

            <div style={styles.row}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Zip Code *</label>
                <input type="text" name="zipCode" placeholder="Postal code" value={formData.zipCode} onChange={handleInputChange} style={styles.input} required />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>State *</label>
                <input type="text" name="state" placeholder="State" value={formData.state} onChange={handleInputChange} style={styles.input} required />
              </div>
            </div>

            <button type="submit" style={{ ...styles.primaryButton, marginTop: '14px' }} disabled={loading}>
              {loading ? 'Submitting...' : 'Complete Registration'}
            </button>
          </form>
        )}

        {message && (
          <div style={{ ...styles.messageBox, color: message.includes('success') ? '#4ade80' : '#f87171' }}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  pageContainer: { display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#030712', fontFamily: 'sans-serif', color: '#f8fafc', padding: '30px 20px', boxSizing: 'border-box' },
  brandContainer: { textAlign: 'center', marginBottom: '28px' },
  brandTitle: { fontSize: '32px', fontWeight: '800', color: '#ffffff' },
  brandSubtitle: { fontSize: '13px', color: '#64748b', marginTop: '6px' },
  card: { backgroundColor: '#0b132b', border: '1px solid #1e293b', borderRadius: '24px', width: '100%', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)', boxSizing: 'border-box' },
  headerTextGroup: { marginBottom: '18px', textAlign: 'left' },
  cardHeaderTitle: { fontSize: '20px', fontWeight: '700', color: '#ffffff', margin: '0 0 4px 0' },
  cardHeaderSubtitle: { fontSize: '13px', color: '#94a3b8', margin: 0 },
  sectionTitle: { fontSize: '12px', fontWeight: '700', color: '#3b82f6', marginTop: '16px', marginBottom: '8px', textTransform: 'uppercase', textAlign: 'left' },
  tabContainer: { display: 'flex', backgroundColor: '#070d1a', borderRadius: '12px', padding: '5px', marginBottom: '24px', border: '1px solid #162032' },
  tabButton: { flex: 1, padding: '12px', borderRadius: '9px', border: 'none', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  form: { display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' },
  row: { display: 'flex', gap: '16px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 },
  labelRow: { display: 'flex', justifyContent: 'space-between', width: '100%' },
  label: { fontSize: '13px', fontWeight: '600', color: '#cbd5e1' },
  forgotLink: { fontSize: '12px', color: '#3b82f6', textDecoration: 'none' },
  passwordWrapper: { position: 'relative', display: 'flex', alignItems: 'center', width: '100%' },
  input: { width: '100%', padding: '13px 16px', backgroundColor: '#070d1a', border: '1px solid #1e293b', borderRadius: '12px', color: '#ffffff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' },
  eyeButton: { position: 'absolute', right: '14px', backgroundColor: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center' },
  primaryButton: { backgroundColor: '#2563eb', color: '#ffffff', border: 'none', padding: '14px', borderRadius: '12px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', marginTop: '8px' },
  secondaryButton: { backgroundColor: 'transparent', color: '#94a3b8', border: '1px solid #1e293b', padding: '12px', borderRadius: '12px', fontSize: '13px', cursor: 'pointer' },
  messageBox: { fontSize: '13px', textAlign: 'center', fontWeight: '500', marginTop: '12px', padding: '10px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.03)' }
};
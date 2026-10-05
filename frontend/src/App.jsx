import { useState } from 'react';

function App() {
  const [currentView, setCurrentView] = useState('signin'); // 'signin', 'signup', 'forgot', 'dashboard'
  
  // Login States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Forgot Password States
  const [forgotEmail, setForgotEmail] = useState('');

  // Signup States
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
  const [userToken, setUserToken] = useState('');

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
      const response = await fetch('http://localhost:8080/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await response.json();
      
      if (response.ok) {
        setUserToken(data.token);
        localStorage.setItem('auth_token', data.token);
        setCurrentView('dashboard'); // <--- SWITCHES TO DASHBOARD ON SUCCESS!
        setMessage('');
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
      const response = await fetch('http://localhost:8080/api/v1/auth/forgot-password', {
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
      const response = await fetch('http://localhost:8080/api/v1/auth/register', {
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

  // Logout Handler
  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    setUserToken('');
    setCurrentView('signin');
    setLoginEmail('');
    setLoginPassword('');
  };

  return (
    <div style={styles.pageContainer}>
      <div style={styles.brandTitle}>restaurant<span style={{color: '#0066ff'}}>portal</span></div>

      {/* 4. DASHBOARD VIEW (Shown after successful login) */}
      {currentView === 'dashboard' ? (
        <div style={{ ...styles.card, maxWidth: '600px', textAlign: 'center' }}>
          <h2 style={{ color: '#4ade80', marginBottom: '10px' }}>Welcome to Your Dashboard!</h2>
          <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '20px' }}>
            You are successfully authenticated and logged into the restaurant portal.
          </p>
          
          <div style={styles.tokenBox}>
            <strong>Active JWT Token:</strong>
            <p style={{ wordBreak: 'break-all', fontSize: '12px', color: '#38bdf8', marginTop: '5px' }}>{userToken}</p>
          </div>

          <button onClick={handleLogout} style={{ ...styles.primaryButton, backgroundColor: '#ef4444', marginTop: '20px' }}>
            Sign Out
          </button>
        </div>
      ) : (
        /* AUTH VIEWS (Sign in, Signup, Forgot Password) */
        <div style={{ ...styles.card, maxWidth: currentView === 'signup' ? '540px' : '420px' }}>
          
          <div style={styles.tabContainer}>
            <button 
              type="button" 
              style={{
                ...styles.tabButton, 
                backgroundColor: currentView === 'signin' ? '#1e293b' : 'transparent',
                color: currentView === 'signin' ? '#ffffff' : '#94a3b8'
              }}
              onClick={() => { setCurrentView('signin'); setMessage(''); }}
            >
              Sign in
            </button>
            <button 
              type="button" 
              style={{
                ...styles.tabButton, 
                backgroundColor: currentView === 'signup' ? '#1e293b' : 'transparent',
                color: currentView === 'signup' ? '#ffffff' : '#94a3b8'
              }}
              onClick={() => { setCurrentView('signup'); setMessage(''); }}
            >
              Create account
            </button>
          </div>

          {/* SIGN IN VIEW */}
          {currentView === 'signin' && (
            <form onSubmit={handleLogin} style={styles.form}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Email</label>
                <input 
                  type="email" 
                  placeholder="name@example.com" 
                  value={loginEmail} 
                  onChange={(e) => setLoginEmail(e.target.value)} 
                  style={styles.input}
                  required 
                />
              </div>

              <div style={styles.inputGroup}>
                <div style={styles.labelRow}>
                  <label style={styles.label}>Password</label>
                  <a href="#forgot" onClick={(e) => { e.preventDefault(); setCurrentView('forgot'); setMessage(''); }} style={styles.forgotLink}>Forgot?</a>
                </div>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  value={loginPassword} 
                  onChange={(e) => setLoginPassword(e.target.value)} 
                  style={styles.input}
                  required 
                />
              </div>

              <button type="submit" style={styles.primaryButton} disabled={loading}>
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>
          )}

          {/* FORGOT PASSWORD VIEW */}
          {currentView === 'forgot' && (
            <form onSubmit={handleForgotPassword} style={styles.form}>
              <h3 style={{margin: '0 0 10px 0', fontSize: '16px'}}>Reset Password</h3>
              <p style={{fontSize: '12px', color: '#94a3b8', margin: '0 0 15px 0'}}>Enter your registered email to receive a recovery token.</p>
              
              <div style={styles.inputGroup}>
                <label style={styles.label}>Email Address</label>
                <input 
                  type="email" 
                  placeholder="name@example.com" 
                  value={forgotEmail} 
                  onChange={(e) => setForgotEmail(e.target.value)} 
                  style={styles.input}
                  required 
                />
              </div>

              <button type="submit" style={styles.primaryButton} disabled={loading}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
              <button type="button" onClick={() => setCurrentView('signin')} style={styles.secondaryButton}>
                Back to Sign In
              </button>
            </form>
          )}

          {/* SIGN UP VIEW */}
          {currentView === 'signup' && (
            <form onSubmit={handleRegister} style={styles.form}>
              <h3 style={{margin: '0 0 5px 0', fontSize: '16px', color: '#38bdf8'}}>Restaurant & Owner Details</h3>
              
              <div style={styles.row}>
                <input type="text" name="businessName" placeholder="Business Name *" value={formData.businessName} onChange={handleInputChange} style={styles.input} required />
                <input type="text" name="ownerName" placeholder="Owner Name *" value={formData.ownerName} onChange={handleInputChange} style={styles.input} required />
              </div>

              <div style={styles.row}>
                <input type="email" name="email" placeholder="Email Address *" value={formData.email} onChange={handleInputChange} style={styles.input} required />
                <input type="password" name="password" placeholder="Password (min 8 chars) *" value={formData.password} onChange={handleInputChange} style={styles.input} required />
              </div>

              <div style={styles.row}>
                <input type="text" name="phoneNumber" placeholder="Phone Number (10 digits) *" value={formData.phoneNumber} onChange={handleInputChange} style={styles.input} required />
                <input type="text" name="whatsappNumber" placeholder="WhatsApp Number" value={formData.whatsappNumber} onChange={handleInputChange} style={styles.input} />
              </div>

              <h3 style={{margin: '10px 0 5px 0', fontSize: '16px', color: '#38bdf8'}}>Address & Location</h3>
              <input type="text" name="line1" placeholder="Address Line 1 *" value={formData.line1} onChange={handleInputChange} style={styles.input} required />
              
              <div style={styles.row}>
                <input type="text" name="line2" placeholder="Address Line 2" value={formData.line2} onChange={handleInputChange} style={styles.input} />
                <input type="text" name="area" placeholder="Area" value={formData.area} onChange={handleInputChange} style={styles.input} />
              </div>

              <div style={styles.row}>
                <input type="text" name="zipCode" placeholder="Zip Code (6 digits) *" value={formData.zipCode} onChange={handleInputChange} style={styles.input} required />
                <input type="text" name="state" placeholder="State *" value={formData.state} onChange={handleInputChange} style={styles.input} required />
              </div>

              <div style={styles.row}>
                <input type="number" step="any" name="latitude" placeholder="Latitude (-90 to 90) *" value={formData.latitude} onChange={handleInputChange} style={styles.input} required />
                <input type="number" step="any" name="longitude" placeholder="Longitude (-180 to 180) *" value={formData.longitude} onChange={handleInputChange} style={styles.input} required />
              </div>

              <button type="submit" style={styles.primaryButton} disabled={loading}>
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
      )}

      <div style={styles.footerText}>
        By continuing you agree to our Terms and Privacy Notice. Data is processed in line with GDPR, UK GDPR, and the DPDP Act.
      </div>
    </div>
  );
}

const styles = {
  pageContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#070d1b',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    color: '#ffffff',
    padding: '20px',
    boxSizing: 'border-box',
  },
  brandTitle: {
    fontSize: '22px',
    fontWeight: '700',
    letterSpacing: '0.5px',
    color: '#38bdf8',
    marginBottom: '20px',
  },
  card: {
    backgroundColor: '#0e1626',
    border: '1px solid #1e293b',
    borderRadius: '16px',
    padding: '28px',
    width: '100%',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
    boxSizing: 'border-box',
  },
  tokenBox: {
    backgroundColor: '#121a2b',
    border: '1px solid #23304a',
    borderRadius: '8px',
    padding: '12px',
    textAlign: 'left',
    marginTop: '15px',
  },
  tabContainer: {
    display: 'flex',
    backgroundColor: '#131d31',
    borderRadius: '10px',
    padding: '4px',
    marginBottom: '20px',
  },
  tabButton: {
    flex: 1,
    padding: '10px',
    borderRadius: '8px',
    border: 'none',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  row: {
    display: 'flex',
    gap: '10px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  labelRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#cbd5e1',
  },
  forgotLink: {
    fontSize: '12px',
    color: '#38bdf8',
    textDecoration: 'none',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    backgroundColor: '#121a2b',
    border: '1px solid #23304a',
    borderRadius: '8px',
    color: '#ffffff',
    fontSize: '13px',
    outline: 'none',
    boxSizing: 'border-box',
  },
  primaryButton: {
    backgroundColor: '#0066ff',
    color: '#ffffff',
    border: 'none',
    padding: '12px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '6px',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    color: '#94a3b8',
    border: '1px solid #23304a',
    padding: '10px',
    borderRadius: '8px',
    fontSize: '13px',
    cursor: 'pointer',
  },
  messageBox: {
    fontSize: '13px',
    textAlign: 'center',
    fontWeight: '500',
    marginTop: '10px',
  },
  footerText: {
    marginTop: '24px',
    fontSize: '11px',
    color: '#475569',
    textAlign: 'center',
    maxWidth: '400px',
    lineHeight: '1.4',
  }
};

export default App;
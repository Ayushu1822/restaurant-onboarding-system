import { useState } from 'react';
import './LoginScreen.css';

const API_BASE_URL = 'https://restaurant-backend-fphb.onrender.com';
const GOOGLE_AUTH_URL = import.meta.env.VITE_GOOGLE_AUTH_URL;

const INITIAL_FORM = {
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
};

function GoogleIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 48 48" width="18" height="18">
      <path fill="#FFC107" d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 0 1-4.1 6.2v5.1h6.6c3.9-3.6 6.1-8.8 6.1-15Z" />
      <path fill="#34A853" d="M24 44c5.5 0 10.1-1.8 13.5-4.8l-6.6-5.1c-1.8 1.2-4 1.9-6.9 1.9-5.3 0-9.8-3.6-11.4-8.4H5.8v5.3A20 20 0 0 0 24 44Z" />
      <path fill="#4A90E2" d="M12.6 27.6a12 12 0 0 1 0-7.2v-5.3H5.8a20 20 0 0 0 0 17.8l6.8-5.3Z" />
      <path fill="#EA4335" d="M24 12c3 0 5.6 1 7.7 3l5.8-5.8A19.3 19.3 0 0 0 24 4 20 20 0 0 0 5.8 15.1l6.8 5.3C14.2 15.6 18.7 12 24 12Z" />
    </svg>
  );
}

function FeatureIcon({ type }) {
  const iconPaths = {
    sync: <><path d="M12 3v3m0 12v3m9-9h-3M6 12H3m15.36-6.36-2.12 2.12M7.76 16.24l-2.12 2.12m12.72 0-2.12-2.12M7.76 7.76 5.64 5.64" /><path d="m14.5 9.5-5 5m0-5 5 5" /></>,
    kitchen: <><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9 4V2m6 2V2m-6 9h6m-6 4h6" /></>,
    heart: <path d="M20.8 8.8c0 5.5-8.8 11-8.8 11S3.2 14.3 3.2 8.8a4.7 4.7 0 0 1 8.8-2.3 4.7 4.7 0 0 1 8.8 2.3Z" />
  };

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      {iconPaths[type]}
    </svg>
  );
}

function FormField({ label, name, value, onChange, type = 'text', required = false, placeholder = '', className = '', ...props }) {
  return (
    <label className={`authField ${className}`.trim()}>
      {label && <span>{label}{required && <i> *</i>}</span>}
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        {...props}
      />
    </label>
  );
}

export default function LoginScreen({ onLoginSuccess }) {
  const [currentView, setCurrentView] = useState('signin');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('error');
  const [loading, setLoading] = useState(false);
  const [rememberStation, setRememberStation] = useState(true);

  const openView = (view) => {
    setCurrentView(view);
    setMessage('');
    setMessageType('error');
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData(current => ({ ...current, [name]: value }));
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });
      const data = await response.json();
      if (!response.ok) {
        setMessage(data.message || 'Invalid email or password.');
        return;
      }
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('user_email', loginEmail);
      onLoginSuccess();
    } catch {
      setMessage('Could not connect to the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');
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
            latitude: Number.parseFloat(formData.latitude),
            longitude: Number.parseFloat(formData.longitude)
          }
        })
      });
      const data = await response.json();
      if (!response.ok) {
        setMessage(data.message || 'Registration failed. Please check your details.');
        return;
      }
      setMessageType('success');
      setMessage('Your account is ready. Sign in to continue.');
      setCurrentView('signin');
      setLoginEmail(formData.email);
    } catch {
      setMessage('Could not connect to the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail })
      });
      const data = await response.json();
      if (!response.ok) {
        setMessage(data.message || 'Unable to reset password for that email.');
        return;
      }
      setMessageType('success');
      setMessage('Reset instructions have been requested.');
    } catch {
      setMessage('Could not connect to the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    if (!GOOGLE_AUTH_URL) {
      setMessage('Google sign-in is not configured yet. Set VITE_GOOGLE_AUTH_URL to your OAuth sign-in endpoint.');
      setMessageType('error');
      return;
    }
    window.location.assign(GOOGLE_AUTH_URL);
  };

  return (
    <main className="authPage">
      <section className={`authPortal${currentView === 'signup' ? ' signupMode' : ''}`} aria-label="Foodos restaurant portal">
        <aside className="portalIntro">
          <div className="portalIntroContent">
            <div className="portalBrand">
              <span className="portalBrandIcon">◈</span>
              <strong>Foodos</strong>
              <span className="portalBrandTag">POS</span>
            </div>

            <div className="portalPitch">
              <h1>Good food, great<br />operations, better<br />dining.</h1>
              <p className="portalTagline">Run smoother, serve happier. <span>•</span></p>
            </div>

            <ul className="portalFeatures">
              <li>
                <span className="featureIcon"><FeatureIcon type="sync" /></span>
                <span><strong>100% Real-Time Table Sync</strong><small>Instant order flow between floor and kitchen</small></span>
              </li>
              <li>
                <span className="featureIcon"><FeatureIcon type="kitchen" /></span>
                <span><strong>Kitchen &amp; Bar Precision</strong><small>Smart ticket routing and prep timing</small></span>
              </li>
              <li>
                <span className="featureIcon"><FeatureIcon type="heart" /></span>
                <span><strong>Intelligent Inventory</strong><small>Automated ingredient depletion and alerts</small></span>
              </li>
            </ul>
          </div>
        </aside>

        <section className="portalFormPanel">
          <div className="portalFormContent">
            {currentView === 'signup' && (
              <div className="authTabs" role="tablist" aria-label="Choose sign in or create account">
                <button type="button" role="tab" aria-selected={false} onClick={() => openView('signin')}>Sign In</button>
                <button type="button" role="tab" aria-selected className="selected" onClick={() => openView('signup')}>Create Account</button>
              </div>
            )}

            <header className="portalFormHeading">
              <h2>{currentView === 'signup' ? 'Restaurant Onboarding' : currentView === 'forgot' ? 'Reset your password' : 'Sign In'}</h2>
              {currentView === 'signup' && <p>Register your restaurant and configure your administrative profile.</p>}
              {currentView === 'forgot' && <p>We will help you get back into your restaurant portal.</p>}
            </header>

            {currentView === 'signin' && (
              <div className="authTabs" role="tablist" aria-label="Choose sign in or create account">
                <button type="button" role="tab" aria-selected className="selected" onClick={() => openView('signin')}>Sign In</button>
                <button type="button" role="tab" aria-selected={false} onClick={() => openView('signup')}>Create Account</button>
              </div>
            )}

            {currentView === 'signin' && (
              <form className="portalAuthForm" onSubmit={handleLogin}>
                <FormField label="EMAIL ADDRESS" type="email" value={loginEmail} onChange={(event) => setLoginEmail(event.target.value)} placeholder="operator@restaurant.com" required autoComplete="email" />
                <div className="passwordLabelRow">
                  <span className="portalFieldLabel">PASSWORD</span>
                  <button type="button" className="inlineFormLink" onClick={() => openView('forgot')}>Forgot Password?</button>
                </div>
                <FormField type="password" value={loginPassword} onChange={(event) => setLoginPassword(event.target.value)} placeholder="••••••••••••" required autoComplete="current-password" />
                <label className="rememberStation">
                  <input type="checkbox" checked={rememberStation} onChange={(event) => setRememberStation(event.target.checked)} />
                  <span>Remember this station / Keep me signed in</span>
                </label>
                <button className="portalSubmit" type="submit" disabled={loading}>{loading ? 'Signing in…' : 'SIGN IN TO PORTAL'}</button>
              </form>
            )}

            {currentView === 'signup' && (
              <form className="portalAuthForm signupForm" onSubmit={handleRegister}>
                <div className="signupSection">
                  <h3>Business &amp; Owner Information</h3>
                  <div className="signupFields">
                    <FormField label="Business Name" name="businessName" value={formData.businessName} onChange={handleInputChange} placeholder="e.g. Spice Garden" required />
                    <FormField label="Owner Name" name="ownerName" value={formData.ownerName} onChange={handleInputChange} placeholder="e.g. John Doe" required />
                    <FormField label="Email Address" name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="owner@restaurant.com" required />
                    <FormField label="Password (min 8 chars)" name="password" type="password" value={formData.password} onChange={handleInputChange} placeholder="••••••••" minLength={8} required />
                    <FormField label="Phone Number (10 digits)" name="phoneNumber" type="tel" value={formData.phoneNumber} onChange={handleInputChange} placeholder="9876543210" required />
                    <FormField label="WhatsApp Number" name="whatsappNumber" type="tel" value={formData.whatsappNumber} onChange={handleInputChange} placeholder="9876543210" />
                  </div>
                </div>
                <div className="signupSection">
                  <h3>Address &amp; GPS Location</h3>
                  <div className="signupFields">
                    <FormField className="signupWideField" label="Address Line 1" name="line1" value={formData.line1} onChange={handleInputChange} placeholder="Street address or building name" required />
                    <FormField label="Address Line 2" name="line2" value={formData.line2} onChange={handleInputChange} placeholder="Suite, floor, etc. (optional)" />
                    <FormField label="Area" name="area" value={formData.area} onChange={handleInputChange} placeholder="Locality or neighborhood" />
                    <FormField label="Zip Code" name="zipCode" value={formData.zipCode} onChange={handleInputChange} placeholder="6-digit postal code" required />
                    <FormField label="State" name="state" value={formData.state} onChange={handleInputChange} placeholder="State/Province" required />
                    <FormField label="Latitude" name="latitude" type="number" step="any" value={formData.latitude} onChange={handleInputChange} placeholder="e.g. 28.6139" required />
                    <FormField label="Longitude" name="longitude" type="number" step="any" value={formData.longitude} onChange={handleInputChange} placeholder="e.g. 77.2090" required />
                  </div>
                </div>
                <button className="portalSubmit" type="submit" disabled={loading}>{loading ? 'Submitting…' : 'Complete Registration'}</button>
              </form>
            )}

            {currentView === 'forgot' && (
              <form className="portalAuthForm" onSubmit={handleForgotPassword}>
                <FormField label="EMAIL ADDRESS" type="email" value={forgotEmail} onChange={(event) => setForgotEmail(event.target.value)} placeholder="operator@restaurant.com" required />
                <button className="portalSubmit" type="submit" disabled={loading}>{loading ? 'Sending…' : 'SEND RESET INSTRUCTIONS'}</button>
                <button type="button" className="backToSignIn" onClick={() => openView('signin')}>← Back to sign in</button>
              </form>
            )}

            {currentView !== 'signup' && (
              <>
                <div className="portalOr"><span>OR SIGN IN WITH</span></div>
                <button className="portalGoogleButton" type="button" onClick={handleGoogleSignIn}><GoogleIcon />Continue with Google</button>
              </>
            )}

            {currentView !== 'signup' && <p className="portalRegisterPrompt">
              {currentView === 'signup' ? 'Already have a restaurant account?' : 'Don’t have a restaurant account?'}
              {' '}
              <button type="button" onClick={() => openView(currentView === 'signup' ? 'signin' : 'signup')}>
                {currentView === 'signup' ? 'Sign in' : 'Register your restaurant'}
              </button>
            </p>}

            {message && <p className={`portalMessage ${messageType}`} role="status">{message}</p>}
          </div>
        </section>
      </section>
    </main>
  );
}
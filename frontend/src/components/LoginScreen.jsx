import { useState } from 'react';
import './LoginScreen.css';

const API_BASE_URL = 'http://localhost:8080';
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
    sync: <path d="m13.2 2-9 11h6.1L9.8 22l9-12h-6.1L13.2 2Z" />,
    kitchen: <><path d="M3 11 12 4l9 7v8a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-8Z" /><path d="M8 20v-5a4 4 0 0 1 8 0v5M9 8l3 2 3-2" /></>,
    secure: <><path d="M12 3 20 6v5c0 5-3.4 8.4-8 10-4.6-1.6-8-5-8-10V6l8-3Z" /><path d="m8.5 12 2.2 2.2 4.8-4.8" /></>
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
      <span>{label}{required && <i> *</i>}</span>
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

function PasswordField({ label, name, value, onChange, required = false, placeholder = '', ...props }) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <label className="authField">
      {label && <span>{label}{required && <i> *</i>}</span>}
      <span className="authPasswordControl">
        <input
          name={name}
          type={isVisible ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          {...props}
        />
        <button
          type="button"
          className="authPasswordToggle"
          aria-label={isVisible ? 'Hide password' : 'Show password'}
          aria-pressed={isVisible}
          onClick={() => setIsVisible(visible => !visible)}
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            {isVisible
              ? <><path d="M3 3l18 18" /><path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" /><path d="M9.9 5.2A10.8 10.8 0 0 1 12 5c5 0 8.5 4.2 9.5 7-.3.9-1 2-2 3" /><path d="M6.2 6.2C4.2 7.5 3 9.6 2.5 12c.8 2.4 3.8 7 9.5 7 1.1 0 2.1-.2 3-.5" /></>
              : <><path d="M2.5 12s3.2-7 9.5-7 9.5 7 9.5 7-3.2 7-9.5 7-9.5-7-9.5-7Z" /><circle cx="12" cy="12" r="2.5" /></>}
          </svg>
        </button>
      </span>
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
      await new Promise(resolve => window.setTimeout(resolve, 1000));
      
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('user_email', loginEmail);
      localStorage.setItem('userEmail', loginEmail); 
      
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
            latitude: Number.parseFloat(formData.latitude) || 0,
            longitude: Number.parseFloat(formData.longitude) || 0
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
      <section className={`authPortal${currentView === 'signup' ? ' signupMode' : ''}`} aria-label="Orders24 restaurant portal">
        
        {/* Left Intro Banner Panel */}
        <aside className="portalIntro">
          <div className="portalIntroContent">
            <div className="portalBrand">
              <svg aria-hidden="true" viewBox="0 0 64 64" className="portalBrandMark">
                <circle cx="31" cy="32" r="25" fill="none" stroke="currentColor" strokeWidth="7" strokeDasharray="130 30" transform="rotate(-42 31 32)" />
                <path d="m17 32 10 10 23-27" fill="none" stroke="#ff5b12" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="portalBrandName">Orders<span>24</span><small>BY AADVIK</small></span>
            </div>

            <div className="portalPitch">
              <span className="portalEyebrow">RESTAURANT MANAGEMENT SYSTEM</span>
              <h1>Good food, great<br className="desktopBreak" /> operations, <em>better dining.</em></h1>
              <p className="portalTagline">Manage your restaurant, streamline operations, and give your customers an exceptional dining experience.</p>
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
                <span className="featureIcon"><FeatureIcon type="secure" /></span>
                <span><strong>Safe &amp; Secure Payments</strong><small>Protected transactions and secure payment processing</small></span>
              </li>
            </ul>
            <svg className="loginFoodArt" aria-hidden="true" viewBox="0 0 440 460">
              <defs>
                <radialGradient id="plate" cx="45%" cy="35%">
                  <stop offset="0" stopColor="#334138" />
                  <stop offset=".68" stopColor="#121a16" />
                  <stop offset=".82" stopColor="#343b34" />
                  <stop offset="1" stopColor="#080d0b" />
                </radialGradient>
                <linearGradient id="steak" x1="0" x2="1" y1="0" y2="1">
                  <stop stopColor="#f08b43" />
                  <stop offset=".5" stopColor="#87391e" />
                  <stop offset="1" stopColor="#351b12" />
                </linearGradient>
              </defs>
              <ellipse cx="280" cy="275" rx="205" ry="190" fill="#06100c" stroke="#576457" strokeWidth="13" />
              <ellipse cx="280" cy="265" rx="186" ry="171" fill="url(#plate)" />
              <path d="M188 188c48-51 132-38 154 12 22 51-6 126-69 135-65 9-127-32-118-82 4-25 13-47 33-65Z" fill="url(#steak)" stroke="#24170e" strokeWidth="8" />
              <path d="m194 232 126-40m-135 68 143-45m-128 76 115-38" stroke="#f3ae68" strokeWidth="6" opacity=".55" />
              <g fill="#d83e24" stroke="#f58e45" strokeWidth="3">
                <circle cx="163" cy="246" r="15" /><circle cx="338" cy="286" r="13" /><circle cx="252" cy="345" r="12" /><circle cx="349" cy="226" r="10" />
              </g>
              <g fill="#3a9a4e" stroke="#a6cc54" strokeWidth="2">
                <path d="M97 291c-1-48 27-75 69-71-7 38-29 65-69 71Z" /><path d="M348 149c13-45 46-58 81-42-20 34-47 49-81 42Z" />
                <path d="M290 369c18-38 50-47 82-26-24 27-51 38-82 26Z" />
              </g>
              <path d="M126 282c13-31 22-43 39-55m187-89c-8 22-17 37-32 51m-11 167c15-22 28-34 48-40" fill="none" stroke="#cee382" strokeWidth="3" opacity=".8" />
              <ellipse cx="79" cy="425" rx="79" ry="64" fill="#1b211c" stroke="#665943" strokeWidth="8" />
              <g fill="#d6a74d">
                <circle cx="43" cy="414" r="5" /><circle cx="76" cy="393" r="5" /><circle cx="103" cy="423" r="5" /><circle cx="57" cy="443" r="5" /><circle cx="92" cy="454" r="5" />
              </g>
            </svg>
          </div>
        </aside>

        {/* Right Form Panel */}
        <section className="portalFormPanel signinPanel">
          {currentView !== 'signup' && (
            <div className="portalPromise">
              <span aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M7 3v8m3-8v8M5 3v5a4 4 0 0 0 8 0V3m-4 9v9m8-18v18m0-18c3 2 4 6 0 8" /></svg></span>
              <small>Smart Restaurant.<br />Better Tomorrow.</small>
            </div>
          )}
          <div className="portalFormContent">
            {currentView === 'signup' && (
              <div className="authTabs" role="tablist" aria-label="Choose sign in or create account">
                <button type="button" role="tab" aria-selected={false} onClick={() => openView('signin')}>Sign In</button>
                <button type="button" role="tab" aria-selected className="selected" onClick={() => openView('signup')}>Create Account</button>
              </div>
            )}

            <header className="portalFormHeading">
              <h2>{currentView === 'signup' ? 'Restaurant Onboarding' : currentView === 'forgot' ? 'Reset your password' : <>Sign In to Orders<span>24</span></>}</h2>
              <p>{currentView === 'signup' ? 'Register your restaurant and configure your administrative profile.' : currentView === 'forgot' ? 'We will help you get back into your restaurant portal.' : 'Log in to your restaurant portal and management console'}</p>
            </header>

            {currentView === 'signin' && (
              <div className="authTabs" role="tablist" aria-label="Choose sign in or create account">
                <button type="button" role="tab" aria-selected className="selected" onClick={() => openView('signin')}>Sign In</button>
                <button type="button" role="tab" aria-selected={false} onClick={() => openView('signup')}>Create Account</button>
              </div>
            )}

            {currentView === 'signin' && (
              <form className="portalAuthForm" onSubmit={handleLogin}>
                <FormField className="signinEmailField" label="EMAIL ADDRESS" type="email" value={loginEmail} onChange={(event) => setLoginEmail(event.target.value)} placeholder="operator@restaurant.com" required autoComplete="email" />
                <div className="passwordLabelRow">
                  <span className="portalFieldLabel">PASSWORD <i>*</i></span>
                  <button type="button" className="inlineFormLink" onClick={() => openView('forgot')}>Forgot Password?</button>
                </div>
                <PasswordField label="" value={loginPassword} onChange={(event) => setLoginPassword(event.target.value)} placeholder="••••••••••••" required autoComplete="current-password" />
                <label className="rememberStation">
                  <input type="checkbox" checked={rememberStation} onChange={(event) => setRememberStation(event.target.checked)} />
                  <span>Remember this station / Keep me signed in</span>
                </label>
                <button className="portalSubmit" type="submit" disabled={loading}><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M14 3h5a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-5M10 17l5-5-5-5m5 5H3" /></svg>{loading ? 'Signing in…' : 'SIGN IN TO PORTAL'}</button>
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
                    <PasswordField label="Password (min 8 chars)" name="password" value={formData.password} onChange={handleInputChange} placeholder="••••••••" minLength={8} required />
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
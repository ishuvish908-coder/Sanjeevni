// =========================================================================
// SANJEEVNI - AUTHENTICATION, 6 ROLES & ORGANISATION VERIFICATION
// =========================================================================

window.AuthModal = function AuthModal({ isOpen, onClose, onAuthSuccess, initialMode = 'login', currentSession, onLogout }) {
  if (!isOpen) return null;

  const [mode, setMode] = React.useState(initialMode); // 'login', 'register', 'forgot', 'profile', 'verify_org'
  const [role, setRole] = React.useState('Food Donor');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [name, setName] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState(null);
  const [error, setError] = React.useState(null);

  // Organisation registration fields (when registering as an org or submitting verification)
  const [orgName, setOrgName] = React.useState('');
  const [orgCategory, setOrgCategory] = React.useState('Food Donor');
  const [orgAddress, setOrgAddress] = React.useState('');
  const [orgCity, setOrgCity] = React.useState('Indore');
  const [orgPincode, setOrgPincode] = React.useState('452001');
  const [orgFacilities, setOrgFacilities] = React.useState('');
  const [orgDescription, setOrgDescription] = React.useState('');
  const [docFile, setDocFile] = React.useState(null);

  // Quick Demo Accounts for each of the 6 roles
  const DEMO_ACCOUNTS = [
    { role: 'Food Donor', email: 'donor@kaveri.edu', name: 'Suresh Patel (Kaveri Mess)', badge: '🏢 Donor' },
    { role: 'NGO / Food Receiver', email: 'ngo@akshaya.org', name: 'Meena Sen (Akshaya Shelter)', badge: '🤝 NGO' },
    { role: 'Volunteer', email: 'volunteer@sanjeevni.org', name: 'Rajesh Kumar', badge: '🚴 Volunteer' },
    { role: 'Animal Welfare Organisation', email: 'gaushala@karuna.org', name: 'Pandit R. K. Shastri', badge: '🐄 Gaushala' },
    { role: 'Waste Processing Partner', email: 'biogas@greenearth.gov.in', name: 'Er. Naveen Kothari', badge: '🌿 Biogas' },
    { role: 'Admin', email: 'admin@sanjeevni.org', name: 'Admin Sanjeevni', badge: '🛡️ Admin' }
  ];

  const handleQuickLogin = async (acc) => {
    setLoading(true);
    setError(null);
    try {
      const res = await window.SanjeevniAPI.login(acc.email, 'demo_pass');
      if (window.audio) window.audio.playChime('success');
      onAuthSuccess(res.user);
      onClose();
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await window.SanjeevniAPI.login(email, password);
      if (window.audio) window.audio.playChime('success');
      onAuthSuccess(res.user);
      onClose();
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email) {
      setError('Name and email are required');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      let orgId = null;
      if (['Food Donor', 'NGO / Food Receiver', 'Animal Welfare Organisation', 'Waste Processing Partner'].includes(role) && orgName) {
        const orgRes = await window.SanjeevniAPI.registerOrganisation({
          name: orgName,
          category: role === 'NGO / Food Receiver' ? 'Human Food Receiver' : role,
          contactPerson: name,
          phone: phone,
          email: email,
          address: orgAddress,
          city: orgCity,
          pincode: orgPincode,
          facilities: orgFacilities,
          description: orgDescription
        });
        orgId = orgRes.id;
      }

      const res = await window.SanjeevniAPI.register({
        name,
        email,
        password,
        role,
        phone,
        organisationId: orgId
      });

      if (window.audio) window.audio.playChime('success');
      setMessage('Registration successful! You are now signed in.');
      setTimeout(() => {
        onAuthSuccess(res.user);
        onClose();
      }, 1000);
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your registered email address');
      return;
    }
    setLoading(true);
    try {
      const res = await window.SanjeevniAPI.resetPassword(email);
      setMessage(res.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-midnight-pine/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-deep-emerald/20 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-midnight-pine to-deep-emerald p-6 text-white flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 border border-white/20 text-[11px] font-semibold text-soft-mint">
              <span>🌱</span> SANJEEVNI Access Control
            </div>
            <h3 className="text-xl font-bold mt-1 text-cloud-white">
              {mode === 'login' && 'Sign in to SANJEEVNI'}
              {mode === 'register' && 'Create Your Account'}
              {mode === 'forgot' && 'Reset Password'}
              {mode === 'profile' && 'Your Verified Profile'}
              {mode === 'verify_org' && 'Submit Organisation Verification'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-lg transition"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {message && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <span>✓</span>
              <span>{message}</span>
            </div>
          )}

          {/* MODE: PROFILE */}
          {mode === 'profile' && currentSession && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-cloud-white border border-soft-mint space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Active Identity</span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-soft-mint text-deep-emerald">
                    {currentSession.role}
                  </span>
                </div>
                <div className="text-lg font-bold text-midnight-pine">{currentSession.name}</div>
                <div className="text-xs text-slate-600 font-mono">{currentSession.email}</div>
                {currentSession.organisationId && (
                  <div className="text-xs text-deep-emerald font-medium pt-1 border-t border-soft-mint">
                    Connected Organisation ID: <strong>{currentSession.organisationId}</strong>
                  </div>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs space-y-1.5">
                <div className="font-bold text-amber-900 flex items-center gap-1.5">
                  <span>🛡️</span> Trust & Verification Status
                </div>
                <p className="text-amber-800 leading-relaxed">
                  {currentSession.role === 'Admin'
                    ? 'Full municipal and administrative platform privileges enabled.'
                    : currentSession.organisationId
                    ? 'Organisation listing verified by municipal administrator.'
                    : 'Personal volunteer / citizen profile. No organisation verification required.'}
                </p>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  onClick={() => {
                    onLogout();
                    onClose();
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
                >
                  Sign Out
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl bg-deep-emerald hover:bg-midnight-pine text-white font-bold text-xs transition"
                >
                  Continue to App
                </button>
              </div>
            </div>
          )}

          {/* MODE: LOGIN */}
          {mode === 'login' && (
            <div className="space-y-5">
              {/* Quick Role Switcher Buttons */}
              <div className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  ⚡ Quick Demo Login (Select any role to test):
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {DEMO_ACCOUNTS.map(acc => (
                    <button
                      key={acc.role}
                      type="button"
                      onClick={() => handleQuickLogin(acc)}
                      disabled={loading}
                      className="p-2.5 rounded-xl bg-cloud-white hover:bg-soft-mint/60 border border-soft-mint hover:border-deep-emerald text-left transition flex flex-col justify-between"
                    >
                      <span className="text-[11px] font-bold text-midnight-pine leading-tight truncate">{acc.badge}</span>
                      <span className="text-[10px] text-slate-500 truncate mt-0.5">{acc.name.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-3 text-xs text-slate-400 font-semibold uppercase">Or email sign in</span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="e.g. donor@kaveri.edu"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#028090] text-xs"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">Password</label>
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-[11px] text-teal font-semibold hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#028090] text-xs"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-[#028090] hover:bg-[#114B5F] text-white font-bold text-xs shadow-md transition"
                >
                  {loading ? 'Authenticating...' : 'Sign In ➔'}
                </button>
              </form>

              <div className="text-center text-xs text-slate-600 pt-2 border-t border-slate-100">
                Don't have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="font-bold text-teal hover:underline"
                >
                  Register here
                </button>
              </div>
            </div>
          )}

          {/* MODE: REGISTER */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Your Community Role</label>
                <select
                  value={role}
                  onChange={e => {
                    setRole(e.target.value);
                    if (e.target.value === 'NGO / Food Receiver') setOrgCategory('Human Food Receiver');
                    else setOrgCategory(e.target.value);
                  }}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white font-medium text-xs focus:ring-2 focus:ring-[#028090]"
                >
                  <option value="Food Donor">1. Food Donor (Mess, Restaurant, Banquet, Canteen)</option>
                  <option value="NGO / Food Receiver">2. NGO / Food Receiver (Shelter, Orphanage, Kitchen)</option>
                  <option value="Volunteer">3. Volunteer (Rescue, Delivery & Inspection)</option>
                  <option value="Animal Welfare Organisation">4. Animal Welfare Organisation (Gaushala, Sanctuary)</option>
                  <option value="Waste Processing Partner">5. Waste Processing Partner (Compost, Biogas)</option>
                  <option value="Admin">6. Municipal / Disaster Admin</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Your Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Ramesh Chandra"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#028090]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+91 98765 00000"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#028090]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@organisation.org"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#028090]"
                />
              </div>

              {/* Organisation Specific Fields */}
              {['Food Donor', 'NGO / Food Receiver', 'Animal Welfare Organisation', 'Waste Processing Partner'].includes(role) && (
                <div className="p-3.5 rounded-2xl bg-cloud-white border border-soft-mint space-y-3">
                  <div className="text-xs font-bold text-midnight-pine flex items-center gap-1.5">
                    <span>🏢</span> Organisation Details (Subject to Verification)
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Organisation Name</label>
                    <input
                      type="text"
                      required
                      value={orgName}
                      onChange={e => setOrgName(e.target.value)}
                      placeholder="e.g. City Care Food Bank"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">City</label>
                      <input
                        type="text"
                        value={orgCity}
                        onChange={e => setOrgCity(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">PIN Code</label>
                      <input
                        type="text"
                        value={orgPincode}
                        onChange={e => setOrgPincode(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Street Address</label>
                    <input
                      type="text"
                      value={orgAddress}
                      onChange={e => setOrgAddress(e.target.value)}
                      placeholder="Plot, Area, Landmark"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 italic">
                    * Newly registered organisations enter <strong>Pending</strong> state until approved by municipal administrator.
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-deep-emerald hover:bg-midnight-pine text-white font-bold text-xs shadow-md transition"
              >
                {loading ? 'Creating Account...' : 'Complete Registration ➔'}
              </button>

              <div className="text-center text-xs text-slate-600 pt-1">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="font-bold text-deep-emerald hover:underline"
                >
                  Sign in here
                </button>
              </div>
            </form>
          )}

          {/* MODE: FORGOT PASSWORD */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Enter your registered email address. We will verify your account and provide reset instructions.
              </p>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Registered Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-deep-emerald hover:bg-midnight-pine text-white font-bold text-xs transition"
              >
                {loading ? 'Sending...' : 'Send Reset Instructions ➔'}
              </button>

              <div className="text-center text-xs pt-1">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="font-bold text-slate-600 hover:underline"
                >
                  ← Back to Login
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

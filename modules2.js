// =========================================================================
// SANJEEVNI EXTENDED MODULES PART 2 (MODULES C, D, E, F, G)
// =========================================================================

// --- MODULE C: FEATURE 4 - DIGITAL FOOD QUALITY CHECKLIST MODAL ---
window.QualityChecklistModal = function QualityChecklistModal({ donation, onPass, onFail, onClose }) {
  const [checks, setChecks] = React.useState({
    visual: true,
    smell: true,
    packaging: true,
    noLeak: true
  });
  const [recordedTempC, setRecordedTempC] = React.useState(68.5);
  const [volunteerNotes, setVolunteerNotes] = React.useState('Freshly cooked, steaming hot, tamper-evident container seal verified.');
  const [photoAttached, setPhotoAttached] = React.useState(true);

  const allPassed = checks.visual && checks.smell && checks.packaging && checks.noLeak && photoAttached && recordedTempC >= 55;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (allPassed) {
      if (window.audio) window.audio.playChime('success');
      onPass({
        tempC: recordedTempC,
        notes: volunteerNotes,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        inspector: 'Volunteer Rajesh Kumar (ID: V1)'
      });
    } else {
      if (window.audio) window.audio.playChime('warning');
      const reason = prompt('Checklist failed safety criteria. Enter failure justification for Waste Ladder step-down:', 'Temperature below safe threshold (42°C). Stepped down to Animal Feed.');
      onFail(reason || 'Quality checklist inspection failed.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 text-sm">📋</span>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Digital Food Safety Checklist (Mandatory)
              </h3>
              <p className="text-[10px] text-slate-500">Verified on-site by volunteer before physical custody handoff</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 flex items-center justify-center text-sm"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          {/* Target Donation Summary */}
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <strong>Target Batch:</strong> {donation?.title} ({donation?.plates} plates)
            <div className="text-[11px] text-slate-500">Donor: {donation?.donorName}</div>
          </div>

          {/* Checklist Toggles */}
          <div className="space-y-2">
            <label className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer">
              <span>👁️ <strong>Visual Check:</strong> Clean appearance, no foreign matter</span>
              <input
                type="checkbox"
                checked={checks.visual}
                onChange={(e) => setChecks({ ...checks, visual: e.target.checked })}
                className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
              />
            </label>

            <label className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer">
              <span>👃 <strong>Olfactory / Smell Check:</strong> Fresh natural aroma; not sour</span>
              <input
                type="checkbox"
                checked={checks.smell}
                onChange={(e) => setChecks({ ...checks, smell: e.target.checked })}
                className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
              />
            </label>

            <label className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer">
              <span>📦 <strong>Packaging Check:</strong> Food-grade, undamaged container</span>
              <input
                type="checkbox"
                checked={checks.packaging}
                onChange={(e) => setChecks({ ...checks, packaging: e.target.checked })}
                className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
              />
            </label>

            <label className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer">
              <span>🛡️ <strong>Zero Contamination / Leakage:</strong> Sealed tightly</span>
              <input
                type="checkbox"
                checked={checks.noLeak}
                onChange={(e) => setChecks({ ...checks, noLeak: e.target.checked })}
                className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
              />
            </label>
          </div>

          {/* Temperature Verification Input */}
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-900 dark:text-amber-200">🌡️ Probe Thermometer Reading (°C):</span>
              <span className="font-mono text-sm font-black text-amber-700 dark:text-amber-300">{recordedTempC}°C</span>
            </div>
            <input
              type="range"
              min="20"
              max="90"
              step="0.5"
              value={recordedTempC}
              onChange={(e) => setRecordedTempC(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-amber-200 dark:bg-amber-800 rounded-lg appearance-none cursor-pointer accent-amber-600"
            />
            <div className="text-[10px] text-slate-500 flex justify-between">
              <span>&lt; 50°C Danger Zone</span>
              <span className="text-emerald-600 font-bold">≥ 60°C Safe Hot-Held</span>
              <span>85°C Max</span>
            </div>
          </div>

          {/* Supporting Photo Evidence */}
          <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <span className="text-[11px] text-slate-600 dark:text-slate-300">
              📸 Proof Photo (Insulated Deksha Seal):
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              ✓ Attached (IMG_4901.JPG)
            </span>
          </div>

          {/* Inspector Notes */}
          <div>
            <label className="block text-slate-600 dark:text-slate-400 mb-1">Inspector Verification Notes</label>
            <textarea
              value={volunteerNotes}
              onChange={(e) => setVolunteerNotes(e.target.value)}
              rows="2"
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex gap-2">
            <button
              type="submit"
              className={`flex-1 py-2 rounded-xl text-white font-bold text-xs shadow-md transition ${
                allPassed ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-amber-600 hover:bg-amber-700'
              }`}
            >
              {allPassed ? '✓ Approve Quality & Handoff' : '⚠️ Record Failed Inspection / Step Down'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- MODULE C: FEATURE 5 - TWO-WAY RATING AND TRUST SYSTEM ---
window.TwoWayRatingModal = function TwoWayRatingModal({ targetEntity, fromRole, toRole, onSubmitRating, onClose }) {
  const [stars, setStars] = React.useState(5);
  const [selectedTags, setSelectedTags] = React.useState(['Fresh & Hygienic', 'Punctual Handover']);
  const [reviewText, setReviewText] = React.useState('Everything was packaged securely and delivered with care.');

  const availableTags = [
    'Fresh & Hygienic',
    'Punctual Handover',
    'Properly Packaged',
    'Accurate Plate Count',
    'Polite Communication',
    'Thermal Insulation Maintained'
  ];

  const handleToggleTag = (tag) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (onSubmitRating) {
      onSubmitRating({
        rating: stars,
        tags: selectedTags,
        comment: reviewText,
        toRole,
        toName: targetEntity?.name || 'Partner',
        date: 'Just now'
      });
    }
    if (window.audio) window.audio.playChime('success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-amber-100 text-amber-600 text-sm">⭐</span>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Two-Way Trust & Performance Rating
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 flex items-center justify-center text-sm"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSend} className="space-y-3 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            Rating for: <strong>{targetEntity?.name || 'Verified Partner'}</strong> ({toRole})
          </div>

          {/* Star Rating */}
          <div className="flex items-center justify-center gap-2 py-2">
            {[1, 2, 3, 4, 5].map(num => (
              <button
                key={num}
                type="button"
                onClick={() => setStars(num)}
                className={`text-2xl transition transform hover:scale-125 ${
                  num <= stars ? 'text-amber-400' : 'text-slate-300 dark:text-slate-700'
                }`}
              >
                ★
              </button>
            ))}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">Select Feedback Tags</label>
            <div className="flex flex-wrap gap-1.5">
              {availableTags.map(tag => {
                const isSel = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleToggleTag(tag)}
                    className={`px-2 py-1 rounded-md text-[11px] font-medium border transition ${
                      isSel
                        ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-transparent'
                    }`}
                  >
                    {isSel ? '✓ ' : '+ '}{tag}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">Comments</label>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              rows="2"
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold text-xs shadow-md transition"
          >
            Submit Verified Rating & Update Trust Score ➔
          </button>
        </form>
      </div>
    </div>
  );
};

// --- MODULE D: FEATURE 7 - AUTOMATED ESCALATION CHAIN ---
window.EscalationChainTracker = function EscalationChainTracker({ donation, onEscalateNextTier }) {
  const [secondsRemaining, setSecondsRemaining] = React.useState(240); // 4 min countdown
  const [escalationLevel, setEscalationLevel] = React.useState(1);
  const [escalationLog, setEscalationLog] = React.useState([
    { level: 1, text: 'Top Matched NGO (Akshaya Food Shelter) pinged with priority offer.', time: '20:10', status: 'Pending Claim' }
  ]);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          // Escalate to next level
          setEscalationLevel(curr => {
            const next = Math.min(4, curr + 1);
            if (next === 2) {
              setEscalationLog(l => [
                { level: 2, text: 'Level 1 timeout! Escalated to 2nd & 3rd ranked NGOs (Robin Hood Army & Anand Home).', time: '20:15', status: 'Dispatched' },
                ...l
              ]);
            } else if (next === 3) {
              setEscalationLog(l => [
                { level: 3, text: 'Level 2 timeout! Broadcasted priority alert to all nearby mobile volunteers.', time: '20:20', status: 'Dispatched' },
                ...l
              ]);
            } else if (next === 4) {
              setEscalationLog(l => [
                { level: 4, text: 'All NGO buffers expired! Automatically stepped down to Tier 2 (Gaushala / Animal Feed).', time: '20:25', status: 'Stepped Down' },
                ...l
              ]);
              if (onEscalateNextTier) onEscalateNextTier();
            }
            return next;
          });
          return 300; // reset 5 min
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [onEscalateNextTier]);

  const mins = Math.floor(secondsRemaining / 60);
  const secs = secondsRemaining % 60;

  return (
    <div className="p-3.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 space-y-2.5">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 font-bold text-indigo-950 dark:text-indigo-200">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
          <span>⚡ Automated Escalation Chain Active</span>
        </div>
        <div className="font-mono text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950 px-2 py-0.5 rounded border border-rose-300">
          Timeout: {mins}:{secs < 10 ? '0' : ''}{secs}
        </div>
      </div>

      {/* Stepped Level Bar */}
      <div className="grid grid-cols-4 gap-1.5 text-center text-[10px]">
        {[
          { lvl: 1, name: 'L1: Top Match' },
          { lvl: 2, name: 'L2: Backup NGOs' },
          { lvl: 3, name: 'L3: Volunteer SOS' },
          { lvl: 4, name: 'L4: Waste Ladder' }
        ].map(step => (
          <div
            key={step.lvl}
            className={`py-1 rounded font-bold transition ${
              escalationLevel === step.lvl
                ? 'bg-rose-600 text-white shadow-sm'
                : escalationLevel > step.lvl
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
            }`}
          >
            {step.name}
          </div>
        ))}
      </div>

      {/* Audit Log */}
      <div className="space-y-1 text-[11px] max-h-24 overflow-y-auto pr-1">
        {escalationLog.map((log, idx) => (
          <div key={idx} className="p-1.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex justify-between gap-1">
            <span className="text-slate-800 dark:text-slate-200">[{log.time}] {log.text}</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-bold whitespace-nowrap">{log.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- MODULE D: FEATURE 8 - MISSED-CALL FOOD DONATION REGISTRATION (VOICE IVR) ---
window.MissedCallIVRModal = function MissedCallIVRModal({ onListingCreated, onClose }) {
  const [callState, setCallState] = React.useState('idle'); // idle, ringing, connected, completed
  const [step, setStep] = React.useState(0);
  const [voiceAnswers, setVoiceAnswers] = React.useState({
    plates: '50',
    foodType: 'दाल और जीरा राइस (Dal & Rice)',
    cookedTime: '45 मिनट पहले (45m ago)',
    location: 'हॉस्टल B मेस (Hostel B Mess)'
  });

  const voicePrompts = [
    {
      hi: 'नमस्ते! संजीवनी में आपका स्वागत है। कितनी प्लेट भोजन उपलब्ध है?',
      en: 'Welcome to Sanjeevni. How many plates of surplus food are available?'
    },
    {
      hi: 'भोजन में क्या बना है? दाल-चावल, रोटी-सब्जी, या मिठाई?',
      en: 'What type of food is prepared?'
    },
    {
      hi: 'भोजन किस समय तैयार हुआ था?',
      en: 'When was the food cooked?'
    },
    {
      hi: 'भोजन उठाने का स्थान क्या है?',
      en: 'Where should the volunteer collect the food?'
    }
  ];

  const handleStartCall = () => {
    setCallState('ringing');
    if (window.audio) window.audio.playChime('click');
    setTimeout(() => {
      setCallState('connected');
      setStep(0);
      if (window.audio) window.audio.playChime('success');
    }, 1200);
  };

  const handleNextPrompt = () => {
    if (step < voicePrompts.length - 1) {
      setStep(step + 1);
      if (window.audio) window.audio.playChime('click');
    } else {
      setCallState('completed');
      if (window.audio) window.audio.playChime('success');
    }
  };

  const handleCreateListingFromVoice = () => {
    if (onListingCreated) {
      onListingCreated({
        title: '50 Plates Dal & Rice (Voice Registered)',
        plates: 50,
        foodType: 'Rice and Curry',
        vegType: 'Veg',
        storage: 'Hot-Held',
        cookedMinutesAgo: 45,
        donorName: 'Hostel B Mess (IVR Voice)',
        dietaryTags: ['Pure Veg']
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-indigo-100 text-indigo-600 text-sm">📞</span>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Missed-Call Voice Donation (IVR)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 flex items-center justify-center text-sm"
          >
            ✕
          </button>
        </div>

        <div className="text-center space-y-2">
          <div className="text-xs text-slate-500">Toll-Free Dial-In Number for Non-Smartphone Donors:</div>
          <div className="text-lg font-black font-mono text-brand-600 dark:text-brand-400">
            1800-SANJEEVNI (1800-726-533)
          </div>
        </div>

        {callState === 'idle' && (
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center space-y-3">
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Simulate giving a missed call from a basic phone. The Sanjeevni automated IVR initiates an immediate Hindi callback.
            </p>
            <button
              onClick={handleStartCall}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
            >
              <span>📲</span> Simulate Missed Call ➔
            </button>
          </div>
        )}

        {callState === 'ringing' && (
          <div className="py-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-600 flex items-center justify-center text-xl mx-auto animate-bounce">
              📞
            </div>
            <div className="text-xs font-bold text-amber-600 dark:text-amber-400">
              Incoming Callback from Sanjeevni IVR Bot...
            </div>
          </div>
        )}

        {callState === 'connected' && (
          <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-900 space-y-3 text-xs">
            <div className="flex items-center justify-between text-[10px] font-bold text-indigo-700 dark:text-indigo-300">
              <span>● VOICE ASSISTANT (HINDI FIRST)</span>
              <span>Question {step + 1} / 4</span>
            </div>

            <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-indigo-100 dark:border-indigo-800 space-y-1">
              <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                "{voicePrompts[step].hi}"
              </div>
              <div className="text-slate-500 text-[10px] italic">
                "{voicePrompts[step].en}"
              </div>
            </div>

            <div className="text-[11px] text-slate-600 dark:text-slate-300">
              <strong>Simulated Voice Response:</strong>{' '}
              {step === 0 && voiceAnswers.plates + ' plates'}
              {step === 1 && voiceAnswers.foodType}
              {step === 2 && voiceAnswers.cookedTime}
              {step === 3 && voiceAnswers.location}
            </div>

            <button
              onClick={handleNextPrompt}
              className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition"
            >
              {step === voicePrompts.length - 1 ? 'Finish & Generate Listing' : 'Next Voice Step ➔'}
            </button>
          </div>
        )}

        {callState === 'completed' && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-center space-y-3 text-xs">
            <div className="text-xl">✅</div>
            <div className="font-bold text-emerald-900 dark:text-emerald-200">
              Speech-to-Text Converted Successfully!
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-[11px]">
              Extracted: 50 Plates Dal & Rice from Hostel B Mess. Safe-Until window initialized.
            </p>
            <button
              onClick={handleCreateListingFromVoice}
              className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md transition"
            >
              Post to Active Rescue Network ➔
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// --- MODULE E: FEATURE 9 & 10 - VOLUNTEER HOURS, CERTIFICATES & KARMA GAMIFICATION ---
window.VolunteerCertAndGamificationView = function VolunteerCertAndGamificationView({ volunteers }) {
  const [activeVolunteer, setActiveVolunteer] = React.useState((window.VOLUNTEER_PROFILES || [])[0]);
  const [showCertModal, setShowCertModal] = React.useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold text-xs uppercase tracking-wider">
              Module E • Features 9 & 10
            </span>
          </div>
          <h2 className="text-xl font-bold mt-1 text-slate-900 dark:text-slate-100">
            Volunteer Recognition, Verified Hours & Karma Gamification
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Credit system for NSS / College social internships, automated verified hours ledger & badges.
          </p>
        </div>

        <button
          onClick={() => setShowCertModal(true)}
          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold text-xs shadow-md transition flex items-center gap-1.5 self-start"
        >
          📜 Generate NSS / University Certificate
        </button>
      </div>

      {/* Volunteer Profile Banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="text-xs text-slate-500">Verified Volunteer Hours</div>
          <div className="text-2xl font-black text-brand-600 dark:text-brand-400">
            {activeVolunteer?.hoursVerified} hrs
          </div>
          <div className="text-[10px] text-slate-400">Audited via GPS geofence timestamps</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="text-xs text-slate-500">Karma Points & Level</div>
          <div className="text-2xl font-black text-amber-500">
            {activeVolunteer?.karmaPoints} pts
          </div>
          <div className="text-[10px] font-semibold text-amber-600">
            Rank: {activeVolunteer?.level}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="text-xs text-slate-500">Active Rescue Streak</div>
          <div className="text-2xl font-black text-rose-500">
            🔥 {activeVolunteer?.streakDays} Days
          </div>
          <div className="text-[10px] text-slate-400">Top 5% in city network</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="text-xs text-slate-500">Total Meals Rescued</div>
          <div className="text-2xl font-black text-indigo-500">
            {activeVolunteer?.mealsRescued} plates
          </div>
          <div className="text-[10px] text-slate-400">{activeVolunteer?.containersReturned} Dabbas sanitized</div>
        </div>
      </div>

      {/* Badges and Milestones */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <span>🎖️</span> Earned Badges & Milestones
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(activeVolunteer?.badges || []).map(b => (
            <div key={b.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center space-y-1">
              <div className="text-2xl">{b.icon}</div>
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100">{b.name}</div>
              <div className="text-[10px] text-slate-500">{b.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Certificate Modal */}
      {showCertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Verified Volunteering Social Impact Certificate
              </h3>
              <button
                onClick={() => setShowCertModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 flex items-center justify-center text-sm"
              >
                ✕
              </button>
            </div>

            {/* Certificate Frame */}
            <div className="p-6 rounded-2xl bg-gradient-to-b from-amber-50/70 to-slate-50 dark:from-amber-950/30 dark:to-slate-900 border-2 border-amber-400/50 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-amber-500 text-slate-900 mx-auto flex items-center justify-center text-xl font-bold shadow-md">
                📜
              </div>
              <h4 className="text-xs uppercase tracking-widest text-amber-700 dark:text-amber-400 font-bold">
                College / NSS Social Volunteering Recognition
              </h4>
              <p className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                This is proudly presented to {activeVolunteer?.name}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                For completing <strong>{activeVolunteer?.hoursVerified} verified hours</strong> of surplus food rescue, transporting <strong>{activeVolunteer?.mealsRescued} meals</strong> to verified shelters, preventing food decay and landfill methane emissions.
              </p>
              <div className="pt-2 text-[10px] font-mono text-slate-400 flex justify-between border-t border-slate-200 dark:border-slate-800">
                <span>VERIFY: SANJEEVNI-VOL-V1-2026</span>
                <span>Audited Social Impact Cell</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  window.print();
                }}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold text-xs shadow-md transition"
              >
                🖨️ Print / Download Verified Certificate
              </button>
              <button
                onClick={() => setShowCertModal(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- MODULE F: FEATURE 11 & 12 - CRISIS MODE & BEYOND COOKED FOOD ---
window.CrisisAndBeyondFoodView = function CrisisAndBeyondFoodView({ crisisState, onToggleCrisis, surplusCategories }) {
  const [categories] = React.useState(window.SURPLUS_CATEGORIES);
  const [selectedCat, setSelectedCat] = React.useState('Cooked Meals');

  return (
    <div className="space-y-6">
      {/* FEATURE 11: CRISIS MODE CONTROL */}
      <div className={`p-5 rounded-2xl border transition shadow-sm space-y-3 ${
        crisisState?.isActive
          ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-400 text-rose-950 dark:text-rose-100 ring-2 ring-rose-500/20'
          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-rose-100 dark:bg-rose-950 text-rose-600 text-sm">🚨</span>
            <div>
              <h3 className="text-sm font-bold">
                Feature 11: Crisis & Emergency Disaster Relief Mode
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Overrides standard queue to rush all surplus to flood, fire, or urban disaster relief shelters.
              </p>
            </div>
          </div>

          <button
            onClick={onToggleCrisis}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm ${
              crisisState?.isActive
                ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse'
                : 'bg-slate-800 hover:bg-slate-700 text-white'
            }`}
          >
            {crisisState?.isActive ? '🚨 CRISIS MODE ACTIVE (Deactivate)' : 'Activate Emergency Mode'}
          </button>
        </div>

        {crisisState?.isActive && (
          <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-rose-300 dark:border-rose-900 space-y-2 text-xs">
            <div className="font-bold text-rose-600 dark:text-rose-400">
              Active Incident: {crisisState.crisisName}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {(crisisState.reliefCamps || []).map(camp => (
                <div key={camp.id} className="p-2.5 rounded-lg bg-rose-50/50 dark:bg-rose-950/30 border border-rose-200 text-xs">
                  <strong className="block">{camp.name}</strong>
                  <div className="text-[11px] text-slate-500">📍 {camp.location}</div>
                  <div className="mt-1 font-semibold text-rose-700 dark:text-rose-300">
                    Target: {camp.fulfilledMeals} / {camp.targetMeals} meals fulfilled
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* FEATURE 12: BEYOND COOKED FOOD CATEGORIES */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div>
          <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider">
            Module F • Feature 12
          </span>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1">
            Beyond Cooked Meals: Multi-Category Surplus Routing
          </h3>
          <p className="text-xs text-slate-500">
            Tailored preservation kinetics and safety validation for bakery, packaged goods, fruits & agricultural gluts.
          </p>
        </div>

        {/* Categories Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {Object.keys(categories).map(catName => {
            const cat = categories[catName];
            const isSel = selectedCat === catName;
            return (
              <button
                key={catName}
                onClick={() => setSelectedCat(catName)}
                className={`p-3 rounded-xl text-left border transition ${
                  isSel
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 ring-2 ring-emerald-500/20'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                }`}
              >
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100">{catName}</div>
                <div className="text-[10px] text-brand-600 dark:text-brand-400 font-semibold mt-0.5">
                  Safe: ~{cat.baselineHours} hrs ({cat.unitLabel})
                </div>
                <div className="text-[10px] text-slate-500 mt-1 line-clamp-2">{cat.desc}</div>
              </button>
            );
          })}
        </div>

        {/* Selected Category Details */}
        {selectedCat && (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <strong>Category Protocol: {selectedCat}</strong>
              <span className="text-brand-600 dark:text-brand-400 font-bold">
                Shelf Window: {categories[selectedCat].baselineHours} Hours
              </span>
            </div>
            <div className="text-slate-600 dark:text-slate-300">
              Mandatory Documentation Fields: <strong>{categories[selectedCat].reqFields.join(' • ')}</strong>
            </div>
            <p className="text-[11px] text-slate-500 italic">
              {categories[selectedCat].desc}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// --- MODULE G: FEATURE 13 - CITY FOOD-WASTE HOTSPOT ANALYTICS ---
window.CityHotspotAnalyticsView = function CityHotspotAnalyticsView() {
  const metrics = window.CITY_HOTSPOT_METRICS;

  const handleDownloadReport = () => {
    const reportData = `SANJEEVNI CITY FOOD-WASTE HOTSPOT ANALYTICS REPORT\n` +
      `Generated: ${new Date().toLocaleDateString()}\n` +
      `Total Food Rescued: ${metrics.totalRescuedKg.toLocaleString()} kg\n` +
      `Methane Prevented: ${metrics.landfillMethaneDivertedTonnes} Tonnes CO2e\n\n` +
      `HOTSPOT ZONES:\n` +
      metrics.hotspotZones.map(z => `- ${z.zone}: ${z.surplusMonthlyPlates} plates/mo [Risk: ${z.riskLevel}] -> ${z.primaryCause}`).join('\n');

    const blob = new Blob([reportData], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Sanjeevni_City_Food_Waste_Report_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    if (window.audio) window.audio.playChime('success');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-purple-500/20 text-purple-600 dark:text-purple-400 font-bold text-xs uppercase tracking-wider">
              Module G • Feature 13
            </span>
          </div>
          <h2 className="text-xl font-bold mt-1 text-slate-900 dark:text-slate-100">
            City Food-Waste Hotspot Analytics & Municipal Intelligence
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Aggregated anonymous data for municipal solid waste planners, hotel associations, and ESG regulators.
          </p>
        </div>

        <button
          onClick={handleDownloadReport}
          className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 self-start"
        >
          📊 Download Municipal Report
        </button>
      </div>

      {/* Aggregate KPI Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="text-xs text-slate-500">Citywide Food Rescued</div>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400">
            {metrics.totalRescuedKg.toLocaleString()} kg
          </div>
          <div className="text-[10px] text-slate-400">Across 4 municipal sectors</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="text-xs text-slate-500">Landfill Methane Diverted</div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {metrics.landfillMethaneDivertedTonnes} Tonnes
          </div>
          <div className="text-[10px] text-slate-400">Clean air credit equivalent</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="text-xs text-slate-500">Peak Surplus Window</div>
          <div className="text-2xl font-black text-amber-500">
            21:30 - 23:30
          </div>
          <div className="text-[10px] text-slate-400">54% of surplus generated at dinner rush</div>
        </div>
      </div>

      {/* Peak Timings Breakdown */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <span>⏰</span> Peak Food-Waste Timing Distribution
        </h3>
        <div className="space-y-2">
          {metrics.peakWasteHours.map(pw => (
            <div key={pw.timeWindow} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-800 dark:text-slate-200">{pw.timeWindow} ({pw.label})</span>
                <span className="font-bold text-purple-600">{pw.pct}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div className="h-full bg-purple-600 rounded-full" style={{ width: `${pw.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hotspot Zones Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>📍</span> Critical Food-Waste Hotspots Identified by AI
          </h3>
          <span className="text-xs text-slate-400">Anonymized Aggregation</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold uppercase bg-slate-50 dark:bg-slate-800/40">
                <th className="py-3 px-4">Zone Cluster</th>
                <th className="py-3 px-3">Monthly Surplus</th>
                <th className="py-3 px-3">Risk Tier</th>
                <th className="py-3 px-4">Root Cause Identified by Pattern Engine</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
              {metrics.hotspotZones.map(hz => (
                <tr key={hz.zone} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-bold">{hz.zone}</td>
                  <td className="py-3 px-3 font-semibold text-purple-600 dark:text-purple-400">
                    {hz.surplusMonthlyPlates.toLocaleString()} plates/mo
                  </td>
                  <td className="py-3 px-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      hz.riskLevel === 'Critical' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}>
                      {hz.riskLevel}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-500">{hz.primaryCause}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

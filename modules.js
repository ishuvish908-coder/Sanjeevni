// =========================================================================
// SANJEEVNI EXTENDED MODULES (13 NEW FEATURES)
// =========================================================================

// --- MODULE A: FEATURE 1 - AI OVERPRODUCTION INSIGHTS ---
window.OverproductionInsightsView = function OverproductionInsightsView({ onApplyRecommendation }) {
  const [data] = React.useState(window.HISTORICAL_OVERPRODUCTION_DATA);
  const [recommendations, setRecommendations] = React.useState(window.OVERPRODUCTION_RECOMMENDATIONS);
  const [platesReduction, setPlatesReduction] = React.useState(60);
  const [costPerPlate, setCostPerPlate] = React.useState(45);

  const monthlySavings = platesReduction * costPerPlate * 30;
  const annualSavings = monthlySavings * 12;

  const handleApply = (id) => {
    setRecommendations(prev => prev.map(r => r.id === id ? { ...r, applied: !r.applied } : r));
    if (window.audio) window.audio.playChime('success');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-900 to-slate-900 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-300 font-bold text-xs uppercase tracking-wider">
              Module A • Feature 1
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium">
              ML Trend Detection Active
            </span>
          </div>
          <h2 className="text-xl font-bold mt-1 text-slate-100">
            AI-Powered Overproduction Insights & Demand Forecaster
          </h2>
          <p className="text-xs text-indigo-200 mt-0.5">
            Analyzes historical mess attendance, weekend student exodus, and event catering buffers.
          </p>
        </div>

        {/* Financial Savings Card */}
        <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-center min-w-[200px]">
          <div className="text-[11px] text-indigo-200 font-semibold uppercase">Projected Annual Savings</div>
          <div className="text-2xl font-black text-emerald-400">
            ₹{annualSavings.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-300">
            Based on {platesReduction} plates/day reduction
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Weekly Surplus Trends Chart */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>📊</span> Day-of-Week Surplus Trend (Last 60 Days)
            </h3>
            <span className="text-xs text-slate-500">Average Surplus %</span>
          </div>

          {/* SVG Bar Chart */}
          <div className="pt-4 pb-2">
            <div className="flex items-end justify-between gap-2 h-48 border-b border-slate-200 dark:border-slate-800 px-2">
              {data.map((item) => {
                const heightPct = Math.round((item.surplusPct / 25) * 100);
                const isHigh = item.surplusPct > 12;
                return (
                  <div key={item.day} className="flex-1 flex flex-col items-center gap-1 group relative">
                    {/* Tooltip on hover */}
                    <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] px-2 py-1 rounded shadow-lg whitespace-nowrap z-10 pointer-events-none">
                      {item.surplusPlates} plates ({item.surplusPct}%)<br/>
                      <span className="text-slate-400">{item.reason}</span>
                    </div>

                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">
                      {item.surplusPct}%
                    </span>
                    <div
                      style={{ height: `${heightPct}%` }}
                      className={`w-full rounded-t-lg transition-all duration-300 ${
                        isHigh
                          ? 'bg-gradient-to-t from-rose-600 to-rose-400 shadow-md shadow-rose-500/20'
                          : 'bg-gradient-to-t from-brand-600 to-emerald-400'
                      }`}
                    />
                    <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-1 truncate">
                      {item.day.slice(0, 3)}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between items-center text-[11px] text-slate-500 mt-2 px-2">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-emerald-500"></span> Normal Baseline (&lt;10%)</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-rose-500"></span> High Waste Spike Alert (Sundays 18.4%)</span>
            </div>
          </div>

          {/* Interactive Savings Calculator */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <span>🧮</span> Interactive Production Optimization Calculator
            </h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Target Daily Plate Reduction</label>
                <input
                  type="range"
                  min="10"
                  max="200"
                  step="5"
                  value={platesReduction}
                  onChange={(e) => setPlatesReduction(parseInt(e.target.value, 10))}
                  className="w-full h-1.5 bg-slate-300 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-600"
                />
                <span className="font-bold text-brand-600 dark:text-brand-400">{platesReduction} plates/day</span>
              </div>
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Cost per Cooked Meal (₹)</label>
                <input
                  type="number"
                  min="20"
                  max="200"
                  value={costPerPlate}
                  onChange={(e) => setCostPerPlate(parseInt(e.target.value, 10))}
                  className="w-full px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                />
              </div>
            </div>
            <div className="text-[11px] text-slate-500">
              Monthly Budget Reclaimed: <strong className="text-slate-900 dark:text-slate-100">₹{monthlySavings.toLocaleString()}</strong> • Carbon Emissions Avoided: <strong className="text-emerald-600 font-bold">{Math.round(platesReduction * 1.1 * 30)} kg CO₂e/mo</strong>
            </div>
          </div>
        </div>

        {/* Right Column: Actionable AI Recommendations */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>💡</span> Actionable AI Recommendations
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 font-bold">
                Pattern Engine
              </span>
            </div>

            <div className="space-y-3">
              {recommendations.map(rec => (
                <div
                  key={rec.id}
                  className={`p-3.5 rounded-xl border transition space-y-2 ${
                    rec.applied
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400'
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <strong className="text-slate-900 dark:text-slate-100">{rec.facility}</strong>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      rec.applied ? 'bg-emerald-200 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-200' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}>
                      {rec.applied ? '✓ Applied in Mess' : 'Recommended'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-snug">
                    {rec.finding}
                  </p>

                  <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 text-[11px] font-medium text-brand-700 dark:text-brand-300">
                    ➔ <strong>Action:</strong> {rec.action}
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] font-semibold text-slate-500">
                      💰 {rec.monthlySavings}
                    </span>
                    <button
                      onClick={() => handleApply(rec.id)}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition shadow-sm ${
                        rec.applied
                          ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                          : 'bg-brand-600 hover:bg-brand-700 text-white'
                      }`}
                    >
                      {rec.applied ? 'Revert Policy' : 'Apply Policy'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- MODULE A: FEATURE 2 - PRE-EVENT FOOD SURPLUS PLEDGES ---
window.PreEventPledgesView = function PreEventPledgesView({ onConvertPledgeToActive }) {
  const [pledges, setPledges] = React.useState(window.INITIAL_PLEDGES);
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [filterStatus, setFilterStatus] = React.useState('ALL');

  // New Pledge Form state
  const [formDonorName, setFormDonorName] = React.useState('Grand Palace Convention');
  const [formEventName, setFormEventName] = React.useState('Charity Gala Dinner');
  const [formExpectedPlates, setFormExpectedPlates] = React.useState(120);
  const [formExpectedDate, setFormExpectedDate] = React.useState('Tonight, 11:30 PM');
  const [formFoodDetails, setFormFoodDetails] = React.useState('Paneer Tikka, Veg Biryani, Roti, Gulab Jamun');
  const [formDietary, setFormDietary] = React.useState('Pure Veg');

  const filteredPledges = pledges.filter(p => filterStatus === 'ALL' || p.status === filterStatus);

  const handleReservePledge = (id) => {
    setPledges(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, status: 'Reserved', reservedBy: 'Robin Hood Army (Volunteer Hub)' };
      }
      return p;
    }));
    if (window.audio) window.audio.playChime('success');
  };

  const handleConfirmPledge = (id) => {
    setPledges(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, status: 'Confirmed' };
      }
      return p;
    }));
    if (window.audio) window.audio.playChime('success');
  };

  const handleCreatePledge = (e) => {
    e.preventDefault();
    const newPledge = {
      id: `PLG-${200 + pledges.length + 1}`,
      donorName: formDonorName,
      donorType: 'Event / Banquet',
      eventName: formEventName,
      expectedDate: formExpectedDate,
      expectedPlates: parseInt(formExpectedPlates, 10),
      foodCategory: 'Cooked Meals',
      foodDetails: formFoodDetails,
      dietary: formDietary,
      status: 'Upcoming',
      reservedBy: null,
      notes: 'Self-registered pre-event surplus pledge.'
    };
    setPledges([newPledge, ...pledges]);
    setShowAddModal(false);
    if (window.audio) window.audio.playChime('success');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider">
              Module A • Feature 2
            </span>
          </div>
          <h2 className="text-xl font-bold mt-1 text-slate-900 dark:text-slate-100">
            Pre-Event Food Surplus Pledges (Zero Spoilage Routing)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Wedding banquet halls, conferences & gala hosts announce expected surplus before events end.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 self-start"
        >
          <span>+</span> Announce Event Surplus Pledge
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {['ALL', 'Upcoming', 'Reserved', 'Confirmed', 'Completed'].map(st => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              filterStatus === st
                ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
            }`}
          >
            {st} ({st === 'ALL' ? pledges.length : pledges.filter(p => p.status === st).length})
          </button>
        ))}
      </div>

      {/* Pledges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPledges.map(pledge => {
          let badgeColor = 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-300';
          if (pledge.status === 'Reserved') badgeColor = 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300';
          if (pledge.status === 'Confirmed') badgeColor = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300';

          return (
            <div key={pledge.id} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold">
                    {pledge.id}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeColor}`}>
                    ● {pledge.status}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{pledge.eventName}</h3>
                  <div className="text-xs text-slate-500 font-medium">{pledge.donorName}</div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                  <div>⏰ Expected: <strong>{pledge.expectedDate}</strong></div>
                  <div>📦 Est. Quantity: <strong className="text-brand-600 dark:text-brand-400">{pledge.expectedPlates} plates</strong></div>
                  <div>🥗 Diet: <strong>{pledge.dietary}</strong></div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 italic">"{pledge.foodDetails}"</div>
                </div>

                {pledge.reservedBy && (
                  <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">
                    ✓ Reserved by: {pledge.reservedBy}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                {pledge.status === 'Upcoming' && (
                  <button
                    onClick={() => handleReservePledge(pledge.id)}
                    className="flex-1 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition"
                  >
                    🤝 Express Interest / Reserve
                  </button>
                )}

                {pledge.status === 'Reserved' && (
                  <button
                    onClick={() => handleConfirmPledge(pledge.id)}
                    className="flex-1 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm transition"
                  >
                    ✓ Confirm Event Surplus
                  </button>
                )}

                {pledge.status === 'Confirmed' && (
                  <button
                    onClick={() => {
                      if (onConvertPledgeToActive) onConvertPledgeToActive(pledge);
                      setPledges(prev => prev.map(p => p.id === pledge.id ? { ...p, status: 'Completed' } : p));
                      if (window.audio) window.audio.playChime('success');
                    }}
                    className="flex-1 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition"
                  >
                    🚀 Convert to Active Rescue ➔
                  </button>
                )}

                {pledge.status === 'Completed' && (
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 py-1">
                    ✓ Rescued into Active Listing
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal to Announce Pledge */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Announce Pre-Event Food Surplus Pledge
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 flex items-center justify-center text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePledge} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Host Facility / Organizer</label>
                <input
                  type="text"
                  value={formDonorName}
                  onChange={(e) => setFormDonorName(e.target.value)}
                  required
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Event Title</label>
                <input
                  type="text"
                  value={formEventName}
                  onChange={(e) => setFormEventName(e.target.value)}
                  required
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">Expected Plates</label>
                  <input
                    type="number"
                    min="10"
                    max="1000"
                    value={formExpectedPlates}
                    onChange={(e) => setFormExpectedPlates(e.target.value)}
                    required
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">Expected Availability Time</label>
                  <input
                    type="text"
                    value={formExpectedDate}
                    onChange={(e) => setFormExpectedDate(e.target.value)}
                    placeholder="e.g. Tonight, 11:00 PM"
                    required
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Dishes & Menu Details</label>
                <input
                  type="text"
                  value={formFoodDetails}
                  onChange={(e) => setFormFoodDetails(e.target.value)}
                  placeholder="e.g. Dal Makhani, Mixed Pulao, Rotis"
                  required
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Dietary Spec</label>
                <select
                  value={formDietary}
                  onChange={(e) => setFormDietary(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                >
                  <option value="Pure Veg">Pure Veg</option>
                  <option value="Pure Veg (Jain Options Available)">Pure Veg (Jain Options Available)</option>
                  <option value="Non-Veg (Halal Certified)">Non-Veg (Halal Certified)</option>
                  <option value="Mixed Veg & Non-Veg">Mixed Veg & Non-Veg</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md transition"
              >
                Publish Event Pledge ➔
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// --- MODULE B: FEATURE 3 - DABBA BANK (REUSABLE CONTAINER MANAGEMENT) ---
window.DabbaBankView = function DabbaBankView() {
  const [dabbas, setDabbas] = React.useState(window.INITIAL_DABBAS);
  const [searchId, setSearchId] = React.useState('');
  const [filterStatus, setFilterStatus] = React.useState('ALL');
  const [scanModalId, setScanModalId] = React.useState(null);

  const filteredDabbas = dabbas.filter(d => {
    const matchesSearch = d.id.toLowerCase().includes(searchId.toLowerCase()) || d.holder.toLowerCase().includes(searchId.toLowerCase());
    const matchesFilter = filterStatus === 'ALL' || d.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const totalCycles = dabbas.reduce((acc, curr) => acc + curr.cycles, 0);
  // Each cycle prevents approx 2.5 single-use foil containers
  const packagingSaved = totalCycles * 3;

  const handleReturnAndSanitize = (id) => {
    setDabbas(prev => prev.map(d => {
      if (d.id === id) {
        return {
          ...d,
          status: 'Returned & Sanitized',
          holder: 'Central Hub Stock',
          destination: '-',
          returnDue: '-',
          cycles: d.cycles + 1
        };
      }
      return d;
    }));
    if (window.audio) window.audio.playChime('success');
  };

  const handleIssueToDonor = (id) => {
    setDabbas(prev => prev.map(d => {
      if (d.id === id) {
        return {
          ...d,
          status: 'In Use (Transit)',
          holder: 'Volunteer Rajesh Kumar',
          destination: 'Kaveri Hostel Mess',
          returnDue: 'Today 23:00'
        };
      }
      return d;
    }));
    if (window.audio) window.audio.playChime('click');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-teal-500/20 text-teal-600 dark:text-teal-400 font-bold text-xs uppercase tracking-wider">
              Module B • Feature 3
            </span>
          </div>
          <h2 className="text-xl font-bold mt-1 text-slate-900 dark:text-slate-100">
            Dabba Bank: Circular Reusable Container Fleet
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Eliminates single-use plastic foil trays via QR-tracked stainless steel insulated containers.
          </p>
        </div>

        {/* Environmental Impact Pill */}
        <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-900 dark:text-teal-300 text-xs flex items-center gap-3">
          <span className="text-2xl">🌱</span>
          <div>
            <div className="font-bold">{packagingSaved.toLocaleString()} Single-Use Trays Prevented</div>
            <div className="text-[10px] text-teal-700 dark:text-teal-400">{totalCycles} safe re-use transport cycles completed</div>
          </div>
        </div>
      </div>

      {/* Control Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search Dabba ID or Holder..."
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
          />
          <button
            onClick={() => {
              const entered = prompt('Scan or Enter Dabba QR Token (e.g. DB-101):', 'DB-101');
              if (entered) setSearchId(entered);
            }}
            className="px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-800 dark:bg-slate-700 text-white flex items-center gap-1"
          >
            📷 Scan QR
          </button>
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          {['ALL', 'Available at Hub', 'In Use (Transit)', 'Overdue for Return', 'Returned & Sanitized'].map(st => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                filterStatus === st
                  ? 'bg-brand-600 text-white'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Dabbas Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold uppercase bg-slate-50 dark:bg-slate-800/40">
                <th className="py-3 px-4">Container ID</th>
                <th className="py-3 px-3">Type & Capacity</th>
                <th className="py-3 px-3">Current Status</th>
                <th className="py-3 px-3">Custody / Holder</th>
                <th className="py-3 px-3">Return Due</th>
                <th className="py-3 px-3">Total Cycles</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
              {filteredDabbas.map(dabba => {
                let statusBadge = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
                if (dabba.status === 'Available at Hub' || dabba.status === 'Returned & Sanitized') {
                  statusBadge = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300';
                } else if (dabba.status === 'In Use (Transit)') {
                  statusBadge = 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300';
                } else if (dabba.status === 'Overdue for Return') {
                  statusBadge = 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 font-bold animate-pulse';
                }

                return (
                  <tr key={dabba.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-mono font-bold text-brand-600 dark:text-brand-400">
                      {dabba.id}
                    </td>
                    <td className="py-3 px-3 font-medium">
                      {dabba.type}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${statusBadge}`}>
                        {dabba.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">
                      {dabba.holder}
                    </td>
                    <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">
                      {dabba.returnDue}
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-700 dark:text-slate-300">
                      {dabba.cycles} cycles
                    </td>
                    <td className="py-3 px-4 text-right">
                      {dabba.status === 'Available at Hub' || dabba.status === 'Returned & Sanitized' ? (
                        <button
                          onClick={() => handleIssueToDonor(dabba.id)}
                          className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-brand-600 hover:bg-brand-700 text-white transition shadow-sm"
                        >
                          Dispatch to Mess ➔
                        </button>
                      ) : (
                        <button
                          onClick={() => handleReturnAndSanitize(dabba.id)}
                          className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-teal-600 hover:bg-teal-700 text-white transition shadow-sm"
                        >
                          ✓ Confirm Return
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

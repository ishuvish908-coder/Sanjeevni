// =========================================================================
// SANJEEVNI — KINETIC ASSISTANCE & RESCUE NETWORK (KARN) LOGISTICS ENGINE
// 8-Stage Lifecycle + Smooth Animated Countdown + Honest State Handling
// =========================================================================

(function() {
  const STAGES = [
    { id: 'Waiting for Receiver', label: 'Waiting for Receiver', icon: '⏳', desc: 'Listing visible in NGO feed' },
    { id: 'Receiver Accepted', label: 'Receiver Accepted', icon: '🤝', desc: 'Claimed by verified shelter' },
    { id: 'KARN Agent Assignment Pending', label: 'Agent Pending', icon: '📡', desc: 'Searching nearby couriers' },
    { id: 'Agent Assigned', label: 'Agent Assigned', icon: '👤', desc: 'Courier confirmed' },
    { id: 'Agent on the Way', label: 'Agent on the Way', icon: '🚴', desc: 'In transit to pickup' },
    { id: 'Agent Arrived', label: 'Agent Arrived', icon: '🏁', desc: 'At donor loading dock' },
    { id: 'Pickup Completed', label: 'Pickup Completed', icon: '📦', desc: 'In custody of KARN' },
    { id: 'Delivery Completed', label: 'Delivery Completed', icon: '🎉', desc: 'Delivered & verified' }
  ];

  window.KarnTrackerView = function KarnTrackerView({ initialDonationId, onClose }) {
    const [trackingData, setTrackingData] = React.useState(null);
    const [selectedDonationId, setSelectedDonationId] = React.useState(initialDonationId || 'DON-101');
    const [availableDonations, setAvailableDonations] = React.useState([
      { id: 'DON-101', title: 'Fresh Biryani & Curry (50 plates)', status: 'Agent on the Way' },
      { id: 'DON-102', title: 'Surplus Chapati & Sabzi (80 plates)', status: 'Waiting for Receiver' },
      { id: 'DON-103', title: 'Wholesome Vegetable Trimmings (40 kg)', status: 'KARN Agent Assignment Pending' },
      { id: 'DON-104', title: 'Fresh Bakery Dinner Rolls (35 packs)', status: 'Delivery Completed' }
    ]);
    const [loading, setLoading] = React.useState(true);
    const [secondsLeft, setSecondsLeft] = React.useState(18 * 60);
    const [totalSeconds, setTotalSeconds] = React.useState(18 * 60);
    const [arrivedAlert, setArrivedAlert] = React.useState(false);
    const [availableAgents, setAvailableAgents] = React.useState([]);

    const mapRef = React.useRef(null);
    const leafletMapRef = React.useRef(null);

    // Fetch tracking data from backend
    const fetchTracking = async (id) => {
      setLoading(true);
      try {
        if (window.SanjeevniAPI?.karn?.getTracking) {
          const res = await window.SanjeevniAPI.karn.getTracking(id);
          let transportReq = null;
          if (window.SanjeevniAPI?.transport?.getRequestById) {
            transportReq = await window.SanjeevniAPI.transport.getRequestById(id).catch(() => null);
          }
          if (res) {
            const merged = { ...res, ...(transportReq || {}) };
            setTrackingData(merged);
            const remaining = res.etaSecondsRemaining || (res.eta_minutes || 18) * 60;
            setSecondsLeft(remaining);
            setTotalSeconds(Math.max(remaining, 18 * 60));
          }
        }
      } catch (err) {
        console.warn('Failed to fetch KARN tracking:', err);
      } finally {
        setLoading(false);
      }
    };

    // Donor-Controlled Logistics Actions
    const handleApproveQuote = async (approved) => {
      try {
        await window.SanjeevniAPI.transport.approveQuote({
          requestId: trackingData?.id,
          donationId: selectedDonationId,
          approved
        });
        if (window.audio) window.audio.playChime('success');
        fetchTracking(selectedDonationId);
      } catch (err) {
        alert('Quote approval error: ' + err.message);
      }
    };

    const handleConfirmHandover = async (confirmedBy) => {
      try {
        await window.SanjeevniAPI.transport.confirmHandover({
          requestId: trackingData?.id,
          donationId: selectedDonationId,
          confirmedBy
        });
        if (window.audio) window.audio.playChime('success');
        fetchTracking(selectedDonationId);
      } catch (err) {
        alert('Handover confirmation error: ' + err.message);
      }
    };

    const handleSwitchMode = async (newMode, selfType = 'donor_delivery') => {
      try {
        await window.SanjeevniAPI.transport.switchMode({
          requestId: trackingData?.id,
          donationId: selectedDonationId,
          newMode,
          selfArrangedType: selfType,
          quotedCost: 240,
          donorQuoteApproved: newMode === 'donor_paid'
        });
        if (window.audio) window.audio.playChime('click');
        fetchTracking(selectedDonationId);
      } catch (err) {
        alert('Switch mode error: ' + err.message);
      }
    };

    // Load available agents
    React.useEffect(() => {
      if (window.SanjeevniAPI?.karn?.getAgents) {
        window.SanjeevniAPI.karn.getAgents().then(agents => {
          if (agents && agents.length) setAvailableAgents(agents);
        });
      }
    }, []);

    // Initial load and auto refresh
    React.useEffect(() => {
      fetchTracking(selectedDonationId);
    }, [selectedDonationId]);

    // Live Animated Countdown Timer Hook
    React.useEffect(() => {
      if (!trackingData) return;
      const status = trackingData.status;
      const isCounting = ['Agent Assigned', 'Agent on the Way'].includes(status);

      if (!isCounting || secondsLeft <= 0) {
        if (secondsLeft === 0 && isCounting && !arrivedAlert) {
          setArrivedAlert(true);
          if (window.audio) window.audio.playChime('success');
          if (window.confetti) {
            window.confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
          }
        }
        return;
      }

      const timer = setInterval(() => {
        setSecondsLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setArrivedAlert(true);
            if (window.audio) window.audio.playChime('success');
            if (window.confetti) {
              window.confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }, [trackingData?.status, secondsLeft]);

    // Leaflet Live Map Integration
    React.useEffect(() => {
      if (!mapRef.current || !window.L || !trackingData) return;

      const timer = setTimeout(() => {
        if (!mapRef.current) return;
        if (leafletMapRef.current) {
          leafletMapRef.current.remove();
          leafletMapRef.current = null;
        }

        try {
          const donorLat = trackingData.pickup_lat || 22.7256;
          const donorLng = trackingData.pickup_lng || 75.8637;
          const agentLat = donorLat - 0.006;
          const agentLng = donorLng - 0.005;

          const map = window.L.map(mapRef.current, {
            scrollWheelZoom: false,
            zoomControl: true
          }).setView([donorLat, donorLng], 14);

          window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap'
          }).addTo(map);

          map.on('click', () => { map.scrollWheelZoom.enable(); });
          map.on('mouseout', () => { map.scrollWheelZoom.disable(); });
          setTimeout(() => { map.invalidateSize(); }, 150);

          // Donor Pin
          const donorMarker = window.L.marker([donorLat, donorLng]).addTo(map);
          donorMarker.bindPopup(`<b>Pickup Location (Donor)</b><br>${trackingData.pickup_address || 'Donor Dock'}`).openPopup();

          // Agent Pin (if assigned)
          if (['Agent Assigned', 'Agent on the Way', 'Agent Arrived'].includes(trackingData.status)) {
            const agentIcon = window.L.divIcon({
              className: 'karn-agent-pin',
              html: `<div style="background:#028090;color:white;padding:6px;border-radius:50%;font-size:16px;box-shadow:0 4px 12px rgba(2,128,144,0.5);border:2px solid white;">🚴</div>`,
              iconSize: [32, 32],
              iconAnchor: [16, 16]
            });
            const agentMarker = window.L.marker([agentLat, agentLng], { icon: agentIcon }).addTo(map);
            agentMarker.bindPopup(`<b>KARN Agent: ${trackingData.agent_name || 'Kunal Verma'}</b><br>Vehicle: ${trackingData.agent_vehicle || 'Eco-Scooter'}`);

            // Simulated Route Line
            window.L.polyline([[agentLat, agentLng], [donorLat, donorLng]], {
              color: '#028090',
              weight: 4,
              dashArray: '6, 8',
              opacity: 0.8
            }).addTo(map);
          }

          leafletMapRef.current = map;
        } catch (e) {
          console.warn('Map init error:', e);
        }
      }, 100);

      return () => {
        clearTimeout(timer);
        if (leafletMapRef.current) {
          leafletMapRef.current.remove();
          leafletMapRef.current = null;
        }
      };
    }, [trackingData?.id, trackingData?.status]);

    // Status transition helper for testing / simulation
    const handleSimulateStatus = async (newStatus) => {
      try {
        await window.SanjeevniAPI.karn.updateStatus({
          donationId: selectedDonationId,
          status: newStatus
        });
        if (window.audio) window.audio.playChime('click');
        fetchTracking(selectedDonationId);
      } catch (err) {
        alert('Status update error: ' + err.message);
      }
    };

    // Agent assignment helper for testing / simulation
    const handleAssignAgent = async (agent) => {
      try {
        await window.SanjeevniAPI.karn.assignAgent({
          donationId: selectedDonationId,
          agentId: agent.id,
          etaMinutes: 18
        });
        if (window.audio) window.audio.playChime('success');
        fetchTracking(selectedDonationId);
      } catch (err) {
        alert('Assignment error: ' + err.message);
      }
    };

    // Format seconds into HH : MM : SS
    const formatTime = (totalSec) => {
      const h = Math.floor(totalSec / 3600);
      const m = Math.floor((totalSec % 3600) / 60);
      const s = totalSec % 60;
      return {
        hours: String(h).padStart(2, '0'),
        minutes: String(m).padStart(2, '0'),
        seconds: String(s).padStart(2, '0')
      };
    };

    const timeObj = formatTime(secondsLeft);
    const progressPercent = totalSeconds > 0 ? Math.min(100, Math.max(0, ((totalSeconds - secondsLeft) / totalSeconds) * 100)) : 0;
    const currentStatus = trackingData?.status || 'Waiting for Receiver';
    const currentStageIndex = STAGES.findIndex(s => s.id === currentStatus);

    return (
      <div className="space-y-6 animate-fadeIn">
        {/* TOP NAVIGATION & CONTEXT BAR */}
        <div className="p-6 rounded-3xl bg-white border border-[#D3E5DC] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#E4FDE1] text-[#028090] text-xs font-black uppercase tracking-wider">
                KARN Logistics Network
              </span>
              <span className="text-xs text-slate-500 font-bold">Kinetic Assistance & Rescue Network</span>
            </div>
            <h2 className="text-2xl font-black text-[#114B5F] flex items-center gap-2">
              <span>Live Pickup & Delivery Coordination</span>
            </h2>
            <p className="text-xs text-slate-600">
              Honest real-time telemetry, chain of custody tracking and verified volunteer courier dispatch.
            </p>
          </div>

          {/* Quick Donation Selector */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Track Donation:</span>
            <select
              value={selectedDonationId}
              onChange={e => setSelectedDonationId(e.target.value)}
              className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white font-bold text-xs text-[#028090] shadow-sm focus:ring-2 focus:ring-[#028090]"
            >
              {availableDonations.map(d => (
                <option key={d.id} value={d.id}>
                  {d.id} — {d.title} ({d.status})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* =========================================================================
            DONOR-CONTROLLED TRANSPORTATION PREFERENCE & DISPATCH CARD
           ========================================================================= */}
        <div className="p-6 rounded-3xl bg-white border border-[#D3E5DC] shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-xl">
                {trackingData?.transport_mode === 'donor_paid' ? '💳' : (trackingData?.transport_mode === 'self_arranged' ? '📦' : '🤝')}
              </span>
              <div>
                <h3 className="text-sm font-black text-[#114B5F]">
                  Selected Transportation Arrangement
                </h3>
                <span className="text-[11px] text-slate-500">
                  Donor-controlled logistics routing & funding verification
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-black px-3 py-1 rounded-full bg-[#E4FDE1] text-[#028090] border border-[#028090]/30 uppercase">
                Mode: {trackingData?.transport_mode === 'donor_paid' ? 'Donor-Funded' : (trackingData?.transport_mode === 'self_arranged' ? 'Self-Arranged' : 'Sponsored')}
              </span>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                Transport Status: {trackingData?.status || 'Active'}
              </span>
            </div>
          </div>

          {/* MODE 1: DONOR-FUNDED LOGISTICS */}
          {trackingData?.transport_mode === 'donor_paid' && (
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 font-black text-xs text-amber-950">
                  <span>💳 Donor-Funded Logistics Arrangement</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${trackingData?.donor_quote_approved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-200 text-amber-900'}`}>
                    {trackingData?.donor_quote_approved ? '✓ Quoted Cost Approved' : '⏳ Awaiting Donor Approval'}
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  The donor agreed to cover transportation cost. Quoted amount: <strong>₹{(trackingData?.quoted_amount || 240).toFixed(2)}</strong>.
                  Assigned courier: <strong>{trackingData?.assigned_provider_name || trackingData?.agent_name || 'Indore Green EV Logistics'}</strong>.
                </p>
                <div className="text-[11px] text-slate-500 italic">
                  Note: Payment will only be processed after trip completion and recipient sign-off.
                </div>
              </div>

              {!trackingData?.donor_quote_approved ? (
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => handleApproveQuote(true)}
                    className="px-4 py-2 rounded-xl bg-[#028090] hover:bg-[#114B5F] text-white font-bold text-xs shadow-md transition"
                  >
                    ✓ Approve Quote (₹{(trackingData?.quoted_amount || 240).toFixed(2)})
                  </button>
                  <button
                    onClick={() => handleSwitchMode('self_arranged')}
                    className="px-3 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs transition"
                  >
                    Switch to Self-Pickup
                  </button>
                </div>
              ) : (
                <div className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-1.5 self-start md:self-auto">
                  <span>✓</span> Quote Approved. Courier Dispatched.
                </div>
              )}
            </div>
          )}

          {/* MODE 2: SELF-ARRANGED HANDOVER */}
          {trackingData?.transport_mode === 'self_arranged' && (
            <div className="p-4 rounded-2xl bg-[#E4FDE1]/70 border border-[#028090]/30 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="font-black text-xs text-[#114B5F] flex items-center gap-2">
                    <span>📦 Direct Self-Arranged Handover</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#028090] text-white font-black uppercase">
                      {trackingData?.self_arranged_type === 'receiver_pickup' ? 'Receiver / NGO Pickup' : 'Donor Direct Delivery'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    {trackingData?.self_arranged_type === 'receiver_pickup'
                      ? 'The verified receiving organisation will collect the food directly from the donor.'
                      : 'The donor is transporting and delivering the food directly to the receiver.'}
                  </p>
                </div>

                <div className="text-xs font-bold text-emerald-800 bg-white px-3 py-1 rounded-xl border border-emerald-200">
                  Handover Window: <strong>{trackingData?.pickup_window || '15:00 - 16:30'}</strong>
                </div>
              </div>

              {/* Handover Dual Confirmation Controls */}
              <div className="pt-2 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-slate-500 block text-[10px] font-bold uppercase">1. Donor Handover</span>
                    <span className="font-extrabold text-slate-800">
                      {trackingData?.donor_handover_confirmed ? '✓ Confirmed by Donor' : 'Pending Handover'}
                    </span>
                  </div>
                  {!trackingData?.donor_handover_confirmed && (
                    <button
                      onClick={() => handleConfirmHandover('donor')}
                      className="px-3 py-1.5 rounded-lg bg-[#028090] text-white font-bold text-[11px] hover:bg-[#114B5F] transition"
                    >
                      Confirm As Donor
                    </button>
                  )}
                </div>

                <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-slate-500 block text-[10px] font-bold uppercase">2. Receiver Receipt</span>
                    <span className="font-extrabold text-slate-800">
                      {trackingData?.receiver_handover_confirmed ? '✓ Acknowledged by NGO' : 'Pending Receipt'}
                    </span>
                  </div>
                  {!trackingData?.receiver_handover_confirmed && (
                    <button
                      onClick={() => handleConfirmHandover('receiver')}
                      className="px-3 py-1.5 rounded-lg bg-[#114B5F] text-white font-bold text-[11px] hover:bg-midnight-pine transition"
                    >
                      Confirm As Receiver
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* MODE 3: SPONSORED TRANSPORTATION */}
          {(!trackingData?.transport_mode || trackingData?.transport_mode === 'sponsored') && (
            <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="font-black text-xs text-[#114B5F] flex items-center gap-2">
                    <span>🤝 Sponsored Institutional Logistics</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase ${
                      trackingData?.funding_status === 'Approved' || trackingData?.funding_status === 'Paid'
                        ? 'bg-emerald-100 text-emerald-800'
                        : (trackingData?.funding_status === 'Rejected' ? 'bg-rose-100 text-rose-800' : 'bg-sky-200 text-sky-900')
                    }`}>
                      Funding: {trackingData?.funding_status || 'Under Review'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Sponsorship Source: <strong>{trackingData?.funding_source_name || 'Institutional CSR Fund - Kaveri Group'}</strong>
                  </p>
                </div>

                {trackingData?.funding_status === 'Approved' && (
                  <div className="text-xs font-bold text-emerald-800 bg-white px-3 py-1 rounded-xl border border-emerald-200">
                    Allocated: <strong>₹{(trackingData?.quoted_amount || 220).toFixed(2)}</strong>
                  </div>
                )}
              </div>

              {/* If funding is unavailable / rejected: exact required fallback display */}
              {trackingData?.funding_status === 'Rejected' && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs space-y-2">
                  <p className="font-semibold">
                    Sponsorship is currently unavailable for this pickup. You can continue waiting for sponsorship or choose another transportation arrangement.
                  </p>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      onClick={() => handleSwitchMode('donor_paid')}
                      className="px-3 py-1.5 rounded-lg bg-[#028090] hover:bg-[#114B5F] text-white font-bold text-[11px] transition"
                    >
                      Switch to Donor-Funded Pickup
                    </button>
                    <button
                      onClick={() => handleSwitchMode('self_arranged')}
                      className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-[11px] transition"
                    >
                      Arrange Pickup Myself
                    </button>
                    <button
                      onClick={() => alert('Continuing to wait for municipal/community sponsorship allocations.')}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-[11px] transition"
                    >
                      Continue Waiting
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* =========================================================================
            8-STAGE CANONICAL LIFECYCLE STEPPER (SECTION 3 SPEC)
           ========================================================================= */}
        <div className="p-6 rounded-3xl bg-white border border-[#D3E5DC] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-[#114B5F] flex items-center gap-2">
              <span>📍</span> 8-Stage Chain of Custody & Lifecycle Tracker
            </h3>
            <span className="text-xs font-black px-3 py-1 rounded-full bg-[#E4FDE1] text-[#028090] border border-[#028090]/30">
              Active: {currentStatus}
            </span>
          </div>

          <div className="overflow-x-auto pb-2">
            <div className="flex items-center min-w-[760px] justify-between relative">
              {/* Connecting Background Line */}
              <div className="absolute top-5 left-6 right-6 h-1 bg-slate-100 z-0" />
              <div
                className="absolute top-5 left-6 h-1 bg-gradient-to-r from-[#028090] to-[#E4FDE1] z-0 transition-all duration-500"
                style={{
                  width: `${Math.max(0, (currentStageIndex / (STAGES.length - 1)) * 95)}%`
                }}
              />

              {STAGES.map((stg, idx) => {
                const isPassed = idx < currentStageIndex;
                const isCurrent = idx === currentStageIndex;
                return (
                  <div key={stg.id} className="relative z-10 flex flex-col items-center text-center w-24">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center text-base font-black transition-all duration-300 shadow-md ${
                        isCurrent
                          ? 'bg-[#028090] text-white ring-4 ring-[#E4FDE1] scale-110 animate-pulse'
                          : (isPassed ? 'bg-[#114B5F] text-[#E4FDE1]' : 'bg-white border-2 border-slate-200 text-slate-400')
                      }`}
                    >
                      {isPassed ? '✓' : stg.icon}
                    </div>
                    <span className={`text-[11px] mt-2 font-bold leading-tight ${isCurrent ? 'text-[#028090] font-black' : (isPassed ? 'text-[#114B5F]' : 'text-slate-400')}`}>
                      {stg.label}
                    </span>
                    <span className="text-[9px] text-slate-400 leading-none mt-0.5">
                      {stg.desc}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* =========================================================================
            MAIN TRACKER GRID: LIVE COUNTDOWN / HONEST RADAR & AGENT DETAILS
           ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* COLUMN 1 & 2: TELEMETRY & COUNTDOWN / RADAR */}
          <div className="lg:col-span-2 space-y-6">
            {/* HONEST STATE 1: WAITING FOR RECEIVER */}
            {currentStatus === 'Waiting for Receiver' && (
              <div className="p-8 rounded-3xl bg-gradient-to-br from-amber-50 to-white border-2 border-amber-300 text-center space-y-4 shadow-sm">
                <div className="relative w-20 h-20 mx-auto rounded-full bg-amber-100 flex items-center justify-center text-3xl">
                  <span className="animate-spin text-amber-700">⏳</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-amber-200 text-amber-900">
                    Honest State: No Fake Countdown
                  </span>
                  <h4 className="text-xl font-black text-[#114B5F]">
                    Awaiting Verified Receiver Claim
                  </h4>
                  <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                    This surplus batch is currently visible to verified shelters and community kitchens within the safe reachability perimeter. As soon as a verified receiver accepts, KARN agent dispatch will activate.
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => handleSimulateStatus('Receiver Accepted')}
                    className="px-5 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs shadow-md transition"
                  >
                    Simulate: Receiver Claimed Batch ➔
                  </button>
                </div>
              </div>
            )}

            {/* HONEST STATE 2: KARN AGENT ASSIGNMENT PENDING (RADAR) */}
            {currentStatus === 'KARN Agent Assignment Pending' && (
              <div className="p-8 rounded-3xl bg-gradient-to-br from-[#E4FDE1] to-white border-2 border-[#028090] text-center space-y-4 shadow-sm">
                <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-[#028090]/20 animate-ping" />
                  <div className="absolute inset-2 rounded-full bg-[#028090]/30 animate-pulse" />
                  <div className="w-16 h-16 rounded-full bg-[#028090] text-white flex items-center justify-center text-3xl z-10 shadow-lg">
                    📡
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-[#028090] text-white">
                    Honest State Telemetry
                  </span>
                  <h4 className="text-xl font-black text-[#114B5F]">
                    Searching for an available KARN agent in your area...
                  </h4>
                  <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                    Dispatching request to nearest eco-couriers and cargo-scooter volunteers. To uphold integrity, estimated arrival countdown begins only after an agent accepts custody.
                  </p>
                </div>
                <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
                  <span className="text-xs font-bold text-slate-600">Assign nearby agent:</span>
                  {availableAgents.slice(0, 2).map(a => (
                    <button
                      key={a.id}
                      onClick={() => handleAssignAgent(a)}
                      className="px-4 py-2 rounded-xl bg-[#028090] hover:bg-[#114B5F] text-white font-bold text-xs shadow transition"
                    >
                      Assign {a.name} ({a.vehicle.split('(')[0]}) ➔
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* LIVE COUNTDOWN TIMER CARD (WHEN AGENT ASSIGNED OR ON THE WAY) */}
            {['Agent Assigned', 'Agent on the Way', 'Agent Arrived'].includes(currentStatus) && (
              <div className="p-6 rounded-3xl bg-white border-2 border-[#028090] shadow-lg space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                    <span className="font-black text-sm text-[#114B5F]">Live Telemetry & Estimated Arrival</span>
                  </div>
                  <span className="text-xs font-extrabold text-[#028090] bg-[#E4FDE1] px-3 py-1 rounded-full">
                    GPS Transit Active
                  </span>
                </div>

                {/* Arrival Celebration Alert if countdown reached 0 */}
                {secondsLeft === 0 ? (
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-[#028090] text-white text-center space-y-2 animate-bounce">
                    <div className="text-3xl">🏁</div>
                    <h4 className="text-lg font-black">KARN Agent Has Arrived at Pickup Location!</h4>
                    <p className="text-xs text-white/90">
                      Please hand over sealed food packages to courier {trackingData?.agent_name || 'Kunal Verma'}.
                    </p>
                    <button
                      onClick={() => handleSimulateStatus('Pickup Completed')}
                      className="mt-2 px-5 py-2 rounded-xl bg-white text-[#114B5F] font-black text-xs shadow-md"
                    >
                      Confirm Food Handover Complete ➔
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-2">
                    {/* Digital Countdown Timer */}
                    <div className="text-center space-y-1">
                      <div className="text-[11px] font-black uppercase tracking-widest text-slate-500">
                        Estimated Time Until Pickup
                      </div>
                      <div className="flex items-center justify-center gap-2 font-mono">
                        <div className="flex flex-col items-center">
                          <span className="text-3xl sm:text-4xl font-black text-[#114B5F] bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 shadow-inner">
                            {timeObj.hours}
                          </span>
                          <span className="text-[9px] text-slate-400 uppercase font-bold mt-1">Hours</span>
                        </div>
                        <span className="text-2xl font-black text-[#028090] pb-4">:</span>
                        <div className="flex flex-col items-center">
                          <span className="text-3xl sm:text-4xl font-black text-[#028090] bg-[#E4FDE1] px-3 py-1.5 rounded-xl border border-[#028090]/30 shadow-inner">
                            {timeObj.minutes}
                          </span>
                          <span className="text-[9px] text-slate-400 uppercase font-bold mt-1">Mins</span>
                        </div>
                        <span className="text-2xl font-black text-[#028090] pb-4">:</span>
                        <div className="flex flex-col items-center">
                          <span className="text-3xl sm:text-4xl font-black text-[#F45B69] bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200 shadow-inner">
                            {timeObj.seconds}
                          </span>
                          <span className="text-[9px] text-slate-400 uppercase font-bold mt-1">Secs</span>
                        </div>
                      </div>
                    </div>

                    {/* Circular Animated SVG Progress Meter */}
                    <div className="relative w-28 h-28 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle
                          cx="50"
                          cy="50"
                          r="42"
                          stroke="#E4FDE1"
                          strokeWidth="8"
                          fill="none"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="42"
                          stroke="#028090"
                          strokeWidth="8"
                          strokeDasharray="264"
                          strokeDashoffset={264 - (264 * progressPercent) / 100}
                          strokeLinecap="round"
                          fill="none"
                          className="transition-all duration-1000 ease-linear"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className="text-lg font-black text-[#114B5F]">{Math.round(progressPercent)}%</span>
                        <span className="text-[8px] font-bold text-slate-400 uppercase">En Route</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Progress bar */}
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#028090] to-emerald-400 transition-all duration-1000"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )}

            {/* COMPLETED STATE CARD */}
            {['Pickup Completed', 'Delivery Completed'].includes(currentStatus) && (
              <div className="p-8 rounded-3xl bg-gradient-to-br from-[#E4FDE1] to-white border-2 border-emerald-400 text-center space-y-4 shadow-sm">
                <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500 text-white flex items-center justify-center text-3xl shadow-lg">
                  ✓
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-100 text-emerald-900">
                    Chain of Custody Verified
                  </span>
                  <h4 className="text-xl font-black text-[#114B5F]">
                    {currentStatus === 'Pickup Completed' ? 'Surplus Collected by KARN Agent' : 'Delivery & Beneficiary Serving Completed!'}
                  </h4>
                  <p className="text-xs text-slate-600 max-w-md mx-auto">
                    {currentStatus === 'Pickup Completed'
                      ? 'The courier has collected the surplus containers and is navigating to the verified destination.'
                      : 'The meals have arrived safely at the receiving shelter within the food safety window. Green Points credited to donor wallet.'}
                  </p>
                </div>
                {currentStatus === 'Pickup Completed' && (
                  <button
                    onClick={() => handleSimulateStatus('Delivery Completed')}
                    className="px-5 py-2.5 rounded-xl bg-[#028090] hover:bg-[#114B5F] text-white font-black text-xs shadow-md transition"
                  >
                    Simulate: Final Delivery Completed ➔
                  </button>
                )}
              </div>
            )}

            {/* LIVE MAP CONTAINER */}
            <div className="p-5 rounded-3xl bg-white border border-[#D3E5DC] shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-black text-xs text-[#114B5F] flex items-center gap-1.5">
                  <span>🗺️</span> Real-Time Logistics Routing Map
                </span>
                <span className="text-[10px] text-slate-500 font-bold">
                  OpenStreetMap • Live Coordinates
                </span>
              </div>
              <div className="rounded-2xl overflow-hidden border border-[#D3E5DC] h-60 w-full relative">
                <div ref={mapRef} className="w-full h-full" />
              </div>
            </div>
          </div>

          {/* COLUMN 3: AGENT DETAILS, LOCATION & CONTROLS */}
          <div className="space-y-6">
            {/* ASSIGNED AGENT DETAILS CARD */}
            <div className="p-5 rounded-3xl bg-white border border-[#D3E5DC] shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-black text-xs text-[#114B5F] uppercase tracking-wide">
                  Assigned KARN Agent
                </span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#E4FDE1] text-[#028090]">
                  Verified Eco-Courier
                </span>
              </div>

              {['Agent Assigned', 'Agent on the Way', 'Agent Arrived', 'Pickup Completed', 'Delivery Completed'].includes(currentStatus) ? (
                <div className="space-y-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#028090] to-[#E4FDE1] flex items-center justify-center text-2xl font-black text-white shadow-md">
                      👤
                    </div>
                    <div>
                      <h4 className="font-black text-sm text-[#114B5F]">{trackingData?.agent_name || 'Kunal Verma'}</h4>
                      <div className="flex items-center gap-1.5 text-xs text-amber-500 font-bold">
                        <span>★ 4.95</span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-500 font-medium">142 Rescues</span>
                      </div>
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">
                        Battery: 82% EV
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#F7FEF6] border border-[#D3E5DC] space-y-1.5 text-xs">
                    <div>
                      <span className="text-slate-500 text-[10px] block">Rescue Vehicle:</span>
                      <strong className="text-[#114B5F]">{trackingData?.agent_vehicle || 'Hero Electric E-Scooter (MP-09-EV-4421)'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">Direct Contact:</span>
                      <strong className="text-[#028090]">{trackingData?.agent_phone || '+91 98260 11223'}</strong>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <a
                      href={`tel:${trackingData?.agent_phone || '+919826011223'}`}
                      className="py-2.5 px-3 rounded-xl bg-[#028090] hover:bg-[#114B5F] text-white font-bold text-xs text-center shadow transition"
                    >
                      📞 Call Agent
                    </a>
                    <button
                      onClick={() => alert(`Direct SMS sent to courier ${trackingData?.agent_name || 'Kunal'}`)}
                      className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#114B5F] font-bold text-xs transition"
                    >
                      💬 Message
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center space-y-2">
                  <div className="text-3xl text-slate-300">⏳</div>
                  <p className="text-xs text-slate-500 font-medium">
                    No courier assigned yet. Agent details will appear once an eco-courier accepts dispatch.
                  </p>
                </div>
              )}
            </div>

            {/* PICKUP & DELIVERY DETAILS */}
            <div className="p-5 rounded-3xl bg-white border border-[#D3E5DC] shadow-sm space-y-3 text-xs">
              <span className="font-black text-xs text-[#114B5F] uppercase tracking-wide block pb-2 border-b border-slate-100">
                Logistics Addresses
              </span>

              <div className="space-y-2.5">
                <div>
                  <div className="flex items-center gap-1.5 text-[#028090] font-black text-[11px]">
                    <span>🟢</span> PICKUP LOCATION (DONOR)
                  </div>
                  <div className="font-extrabold text-slate-800 mt-0.5">{trackingData?.donor_name || 'Grand Imperial Hotel'}</div>
                  <div className="text-slate-600 text-[11px]">{trackingData?.pickup_address || 'Outer Ring Road, Indore'}</div>
                  <div className="text-slate-500 text-[10px] mt-0.5">Window: {trackingData?.pickup_window || 'Within 2 hours'}</div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-1.5 text-purple-700 font-black text-[11px]">
                    <span>🟣</span> DELIVERY RECIPIENT
                  </div>
                  <div className="font-extrabold text-slate-800 mt-0.5">{trackingData?.receiver_name || 'Aastha Orphanage & Children Care'}</div>
                  <div className="text-slate-600 text-[11px]">{trackingData?.delivery_address || 'Sector 4 Shelter Ground, Indore'}</div>
                </div>
              </div>
            </div>

            {/* SIMULATION & DEMO CONTROL PANEL */}
            <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-black text-xs text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                  <span>⚙️</span> Interactive Test & Simulator
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700">Demo</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Test the 8-stage lifecycle transitions and countdown animations in real-time:
              </p>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleSimulateStatus('Receiver Accepted')}
                  className="py-1.5 px-2.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-300 font-bold text-[10px] text-slate-700 text-left"
                >
                  1. Receiver Accept
                </button>
                <button
                  onClick={() => handleSimulateStatus('Agent Assigned')}
                  className="py-1.5 px-2.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-300 font-bold text-[10px] text-slate-700 text-left"
                >
                  2. Agent Assigned
                </button>
                <button
                  onClick={() => handleSimulateStatus('Agent on the Way')}
                  className="py-1.5 px-2.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-300 font-bold text-[10px] text-slate-700 text-left"
                >
                  3. Agent on Way
                </button>
                <button
                  onClick={() => handleSimulateStatus('Agent Arrived')}
                  className="py-1.5 px-2.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-300 font-bold text-[10px] text-slate-700 text-left"
                >
                  4. Agent Arrived
                </button>
                <button
                  onClick={() => handleSimulateStatus('Pickup Completed')}
                  className="py-1.5 px-2.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-300 font-bold text-[10px] text-slate-700 text-left"
                >
                  5. Complete Pickup
                </button>
                <button
                  onClick={() => handleSimulateStatus('Delivery Completed')}
                  className="py-1.5 px-2.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-300 font-bold text-[10px] text-slate-700 text-left"
                >
                  6. Complete Delivery
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Modal Wrapper for KARN Tracker
  window.KarnTrackerModal = function KarnTrackerModal({ isOpen, onClose, donationId }) {
    if (!isOpen) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-[#114B5F]/80 backdrop-blur-sm animate-fadeIn">
        <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[94vh] overflow-hidden shadow-2xl flex flex-col border border-[#D3E5DC]">
          <div className="p-4 bg-[#114B5F] text-white flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-xl">🚴</span>
              <span className="font-black text-sm">KARN Live Telemetry Modal</span>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold flex items-center justify-center"
            >
              ✕
            </button>
          </div>
          <div className="p-4 sm:p-6 overflow-y-auto flex-1">
            <window.KarnTrackerView initialDonationId={donationId} onClose={onClose} />
          </div>
        </div>
      </div>
    );
  };
})();
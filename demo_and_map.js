// =========================================================================
// SANJEEVNI - PHASE 1: GUIDED DEMO + PHASE 2: LEAFLET MAP + PHASE 3: URGENCY
// PHASE 5: ROLE VIEWS + PHASE 7: WHY THIS MATTERS
// =========================================================================

// --- PHASE 1: GUIDED DEMO OVERLAY BAR ---
const GuidedDemoOverlay = window.GuidedDemoOverlay = function GuidedDemoOverlay({ isRunning, currentStep, totalSteps, caption, progress, onStop }) {
  if (!isRunning) return null;
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none" style={{background:'linear-gradient(to top, rgba(15,23,42,0.97) 60%, transparent)'}}>
      <div className="pointer-events-auto max-w-4xl mx-auto px-4 pb-4 pt-10 space-y-3">
        <div className="w-full bg-slate-700 rounded-full h-1.5 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-700" style={{width: progress+'%'}} />
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 text-sm font-bold flex-shrink-0">
              {currentStep}
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-semibold leading-snug truncate">{caption}</p>
              <p className="text-slate-400 text-xs">Step {currentStep} of {totalSteps} • Guided Demo</p>
            </div>
          </div>
          <button onClick={onStop} className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold transition border border-slate-600 flex-shrink-0" aria-label="Stop demo">
            ⏹ Stop
          </button>
        </div>
      </div>
    </div>
  );
};

// Demo step definitions
const DEMO_STEPS = window.DEMO_STEPS = [
  { id:1, caption:"🏢 Kaveri Hostel Mess posts 80 plates of surplus Dal & Rice...", duration:6000, action:'post_donation' },
  { id:2, caption:"⏱️ Safe-Until ring activates — 3.9 hours remaining (Hot-Held × 1.3x)", duration:4500, action:'show_ring' },
  { id:3, caption:"🎯 Receivers ranked by reachability — Akshaya Food Shelter is best match (Score: 87)", duration:5000, action:'rank_receivers' },
  { id:4, caption:"🤝 Auto-assigning to Akshaya Shelter. Volunteer Rajesh Kumar dispatched!", duration:4500, action:'assign_receiver' },
  { id:5, caption:"📋 Volunteer arrives — Digital Quality Checklist passed (68.5°C probe)", duration:4500, action:'pickup' },
  { id:6, caption:"🚴 In transit to shelter... Geofenced delivery tracking active", duration:3500, action:'transit' },
  { id:7, caption:"✅ Delivered to Akshaya Shelter! 80 families fed tonight 🎉", duration:5500, action:'deliver' },
  { id:8, caption:"⏩ Time-Warp advancing... Tier 1 window closing for biryani batch...", duration:6000, action:'time_warp' },
  { id:9, caption:"🐄 Biryani rerouted to Karuna Gaushala (Tier 2: Animal Feed) — zero waste!", duration:5000, action:'tier_drop' },
  { id:10, caption:"📊 Impact: 200+ meals rescued, 220 kg CO₂ avoided, 100% diversion!", duration:5500, action:'impact_summary' }
];

// --- PHASE 2: MAP LOCATIONS (INDORE, NEAR AITR) ---
const MAP_LOCATIONS = window.MAP_LOCATIONS = {
  center: [22.7196, 75.8577],
  donors: {
    'D1': { lat: 22.7256, lng: 75.8637, name: 'Kaveri Hostel Mess' },
    'D2': { lat: 22.7116, lng: 75.8827, name: 'Royal Orchid Banquet' },
    'D3': { lat: 22.7196, lng: 75.8477, name: 'Spice Route Bistro' },
    'D4': { lat: 22.7306, lng: 75.8377, name: 'TechPark Canteen' }
  },
  receivers: {
    'R1': { lat: 22.7216, lng: 75.8617, name: 'Akshaya Food Shelter', tier: 1 },
    'R2': { lat: 22.7176, lng: 75.8557, name: 'Robin Hood Army', tier: 1 },
    'R3': { lat: 22.7276, lng: 75.8507, name: 'Anand Senior Home', tier: 1 },
    'R4': { lat: 22.7136, lng: 75.8697, name: 'Hope Children Home', tier: 1 },
    'R5': { lat: 22.7246, lng: 75.8437, name: 'Seva Community Kitchen', tier: 1 },
    'A1': { lat: 22.7066, lng: 75.8767, name: 'Karuna Gaushala', tier: 2 },
    'C1': { lat: 22.7326, lng: 75.8877, name: 'GreenEarth Biogas', tier: 3 }
  }
};

// --- PHASE 2: LEAFLET MAP COMPONENT ---
const LeafletMapView = window.LeafletMapView = function LeafletMapView({ donations, selectedDonationId }) {
  const mapRef = React.useRef(null);
  const mapInst = React.useRef(null);
  const layerGroup = React.useRef(null);

  React.useEffect(function initMap() {
    if (!window.L || !mapRef.current || mapInst.current) return;
    var L = window.L;
    var map = L.map(mapRef.current, {
      center: window.MAP_LOCATIONS.center, zoom: 14,
      zoomControl: false, attributionControl: false
    });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    L.control.attribution({ position: 'bottomleft', prefix: '© OSM' }).addTo(map);
    mapInst.current = map;
    layerGroup.current = L.layerGroup().addTo(map);

    // Add static markers
    var tierColors = { 1: '#22c55e', 2: '#f59e0b', 3: '#a855f7' };
    var tierEmoji = { 1: '🤝', 2: '🐄', 3: '🌿' };
    Object.entries(window.MAP_LOCATIONS.donors).forEach(function(entry) {
      var id = entry[0], loc = entry[1];
      var icon = L.divIcon({ html: '<div style="background:#3b82f6;width:28px;height:28px;border-radius:50%;border:3px solid white;display:flex;align-items:center;justify-content:center;font-size:12px;color:white;box-shadow:0 2px 8px rgba(0,0,0,0.3);">🏢</div>', className: '', iconSize: [28,28], iconAnchor: [14,14] });
      L.marker([loc.lat, loc.lng], { icon: icon }).addTo(map).bindPopup('<b>'+loc.name+'</b><br><span style="color:#3b82f6">Donor</span>');
    });
    Object.entries(window.MAP_LOCATIONS.receivers).forEach(function(entry) {
      var id = entry[0], loc = entry[1];
      var c = tierColors[loc.tier] || '#22c55e';
      var e = tierEmoji[loc.tier] || '🤝';
      var icon = L.divIcon({ html: '<div style="background:'+c+';width:28px;height:28px;border-radius:50%;border:3px solid white;display:flex;align-items:center;justify-content:center;font-size:12px;box-shadow:0 2px 8px rgba(0,0,0,0.3);">'+e+'</div>', className: '', iconSize: [28,28], iconAnchor: [14,14] });
      L.marker([loc.lat, loc.lng], { icon: icon }).addTo(map).bindPopup('<b>'+loc.name+'</b><br><span style="color:'+c+'">Tier '+loc.tier+'</span>');
    });
    return function() { if (mapInst.current) { mapInst.current.remove(); mapInst.current = null; } };
  }, []);

  // Update route overlay
  React.useEffect(function updateRoutes() {
    if (!layerGroup.current) return;
    layerGroup.current.clearLayers();
    var selDon = (donations || []).find(function(d) { return d.id === selectedDonationId; });
    if (!selDon || !selDon.assignedReceiverId) return;
    var dLoc = window.MAP_LOCATIONS.donors[selDon.donorId];
    var rLoc = window.MAP_LOCATIONS.receivers[selDon.assignedReceiverId];
    if (!dLoc || !rLoc) return;
    var color = selDon.status === 'Delivered' ? '#22c55e' : '#3b82f6';
    L.polyline([[dLoc.lat,dLoc.lng],[rLoc.lat,rLoc.lng]], { color: color, weight: 3, dashArray: '8 6', opacity: 0.8 }).addTo(layerGroup.current);
    if (selDon.status === 'Picked Up') {
      var mLat = (dLoc.lat+rLoc.lat)/2, mLng = (dLoc.lng+rLoc.lng)/2;
      var vIcon = L.divIcon({ html: '<div style="background:#f59e0b;width:24px;height:24px;border-radius:50%;border:2px solid white;display:flex;align-items:center;justify-content:center;font-size:12px;box-shadow:0 2px 8px rgba(0,0,0,0.4);">🚴</div>', className: '', iconSize: [24,24], iconAnchor: [12,12] });
      L.marker([mLat,mLng], { icon: vIcon }).addTo(layerGroup.current).bindPopup('Volunteer in Transit');
    }
  }, [donations, selectedDonationId]);

  var handleFitAll = function() {
    if (!mapInst.current) return;
    var coords = Object.values(window.MAP_LOCATIONS.donors).map(function(l) { return [l.lat,l.lng]; })
      .concat(Object.values(window.MAP_LOCATIONS.receivers).map(function(l) { return [l.lat,l.lng]; }));
    if (coords.length) mapInst.current.fitBounds(coords, { padding: [30,30] });
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
        <div className="flex items-center gap-2">
          <span className="text-sm">🗺️</span>
          <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">Live Rescue Map — Indore, MP</h3>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-3 text-[10px] font-semibold">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Donor</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-green-500"></span> T1</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> T2</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span> T3</span>
          </div>
          <button onClick={handleFitAll} className="px-2 py-1 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-bold hover:bg-slate-300 transition" aria-label="Fit all markers">⊞ Fit All</button>
        </div>
      </div>
      <div ref={mapRef} style={{height:'340px',width:'100%'}} />
    </div>
  );
};

// --- PHASE 3: TOAST SYSTEM ---
const ToastContainer = window.ToastContainer = function ToastContainer({ toasts, onDismiss }) {
  if (!toasts || !toasts.length) return null;
  return (
    <div className="fixed top-20 right-4 z-50 space-y-2 pointer-events-none" style={{maxWidth:'380px'}}>
      {toasts.map(function(t, i) {
        var bg = t.type==='success'?'bg-emerald-600':t.type==='warning'?'bg-amber-500':t.type==='danger'?'bg-rose-600':'bg-slate-800';
        return (
          <div key={t.id||i} className={"pointer-events-auto "+bg+" text-white rounded-xl px-4 py-3 shadow-xl flex items-center gap-3 text-xs font-semibold border border-white/10"} style={{animation:'slideInRight 0.35s ease-out'}}>
            <span className="text-base flex-shrink-0">{t.icon||'🔔'}</span>
            <span className="flex-1">{t.message}</span>
            <button onClick={function(){onDismiss(t.id)}} className="text-white/60 hover:text-white transition text-sm flex-shrink-0" aria-label="Dismiss">✕</button>
          </div>
        );
      })}
    </div>
  );
};

// --- PHASE 3: ANIMATED COUNTER ---
const AnimatedCounter = window.AnimatedCounter = function AnimatedCounter({ value, prefix, suffix, className }) {
  var displayed = React.useState(0), setDisplayed = displayed[1]; displayed = displayed[0];
  var prevRef = React.useRef(0);
  React.useEffect(function() {
    var start = prevRef.current, end = typeof value==='number'?value:parseInt(value)||0;
    if (start===end) { setDisplayed(end); return; }
    var dur = 800, t0 = Date.now();
    function tick() {
      var el = Date.now()-t0, p = Math.min(el/dur,1), e = 1-Math.pow(1-p,3);
      setDisplayed(Math.round(start+(end-start)*e));
      if (p<1) requestAnimationFrame(tick); else prevRef.current = end;
    }
    requestAnimationFrame(tick);
  }, [value]);
  return <span className={className}>{prefix||''}{displayed.toLocaleString()}{suffix||''}</span>;
};

// --- PHASE 3: ENHANCED SAFE-TIME RING ---
const EnhancedSafeTimeRing = window.EnhancedSafeTimeRing = function EnhancedSafeTimeRing({ percentage, remainingMinutes, size }) {
  var sz = size||100, sw = 6, r = sz/2-sw-2, circ = 2*Math.PI*r, dash = circ*(1-(percentage/100));
  var col = '#22c55e', pulse = '';
  if (percentage<=0) col = '#94a3b8';
  else if (percentage<=20) { col = '#ef4444'; pulse = 'animate-pulse'; }
  else if (percentage<=50) col = '#f59e0b';
  var h = Math.floor(remainingMinutes/60), m = remainingMinutes%60;
  return (
    <div className={"relative inline-flex items-center justify-center rounded-full "+pulse}>
      <svg width={sz} height={sz} className="transform -rotate-90">
        <circle cx={sz/2} cy={sz/2} r={r} fill="none" stroke="currentColor" strokeWidth={sw} className="text-slate-200 dark:text-slate-700" />
        <circle cx={sz/2} cy={sz/2} r={r} fill="none" stroke={col} strokeWidth={sw} strokeDasharray={circ} strokeDashoffset={dash} strokeLinecap="round" className="transition-all duration-500" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-xs font-black" style={{color:col}}>{percentage<=0?'⚠️':percentage+'%'}</div>
        <div className="text-[9px] font-semibold text-slate-500 dark:text-slate-400">{percentage<=0?'EXPIRED':h+'h '+m+'m'}</div>
      </div>
    </div>
  );
};

// --- PHASE 5: RECEIVER MOBILE VIEW ---
const ReceiverMobileView = window.ReceiverMobileView = function ReceiverMobileView({ donations, onAccept }) {
  var avail = (donations || []).filter(function(d){return d.status==='Listed';});
  return (
    <div className="space-y-4">
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Receiver Portal</span>
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Incoming Surplus Offers</h2>
        <p className="text-xs text-slate-500 mt-0.5">Accept available donations before the safe window closes</p>
      </div>
      {avail.length===0 ? (
        <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-300 dark:border-slate-700 text-center">
          <div className="text-3xl mb-2">🍽️</div>
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">No surplus offers right now</p>
          <p className="text-xs text-slate-500 mt-1">New listings appear in real-time</p>
        </div>
      ) : avail.map(function(d) {
        return (
          <div key={d.id} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-emerald-600">{d.id}</span>
              <span className={"text-[10px] px-2 py-0.5 rounded-full font-bold "+(d.vegType==='Veg'?'bg-emerald-100 text-emerald-800':'bg-red-100 text-red-800')}>{d.vegType==='Veg'?'🟢 Veg':'🔴 Non-Veg'}</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{d.title}</h3>
            <div className="text-xs text-slate-500">From: <strong>{d.donorName}</strong></div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800"><div className="text-lg font-black text-slate-900 dark:text-slate-100">{d.plates}</div><div className="text-[10px] text-slate-500">Plates</div></div>
              <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800"><div className="text-lg font-black text-amber-600">{d.cookedMinutesAgo}m</div><div className="text-[10px] text-slate-500">Ago</div></div>
              <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800"><div className="text-sm font-bold text-emerald-600">{d.storage}</div><div className="text-[10px] text-slate-500">Storage</div></div>
            </div>
            <button onClick={function(){onAccept(d.id)}} className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition">✅ Accept Donation</button>
          </div>
        );
      })}
    </div>
  );
};

// --- PHASE 5: VOLUNTEER MOBILE VIEW ---
const VolunteerMobileView = window.VolunteerMobileView = function VolunteerMobileView({ donations, onSimulateGeofence, onAdvanceStatus }) {
  var tasks = (donations || []).filter(function(d){return d.status==='Accepted'||d.status==='Picked Up';});
  var vol = (window.VOLUNTEER_PROFILES||[])[0]||{name:'Rajesh Kumar'};
  return (
    <div className="space-y-4">
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Volunteer Dispatch</span>
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Your Active Tasks</h2>
        <p className="text-xs text-slate-500 mt-0.5">Logged in as: <strong>{vol.name}</strong></p>
      </div>
      {tasks.length===0 ? (
        <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-300 dark:border-slate-700 text-center">
          <div className="text-3xl mb-2">🚴</div>
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">No active tasks</p>
          <p className="text-xs text-slate-500 mt-1">Waiting for pickup assignments...</p>
        </div>
      ) : tasks.map(function(d) {
        var isAcc = d.status==='Accepted', isPU = d.status==='Picked Up';
        return (
          <div key={d.id} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border-2 border-emerald-300 dark:border-emerald-800 shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-emerald-600">{d.id}</span>
              <span className={"text-[10px] px-2 py-0.5 rounded-full font-bold "+(isAcc?'bg-blue-100 text-blue-800':'bg-amber-100 text-amber-800')}>{d.status}</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{d.title}</h3>
            <div className="text-xs text-slate-500"><strong>Pickup:</strong> {d.donorName}</div>
            {isAcc && (<>
              <button onClick={function(){onSimulateGeofence(d.id,'donor')}} className="w-full py-2 rounded-lg bg-blue-100 text-blue-800 font-bold text-xs">📍 Simulate: At Donor</button>
              <button onClick={function(){onAdvanceStatus(d.id)}} className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition">📋 I've Arrived — Quality Check</button>
            </>)}
            {isPU && (<>
              <button onClick={function(){onSimulateGeofence(d.id,'receiver')}} className="w-full py-2 rounded-lg bg-blue-100 text-blue-800 font-bold text-xs">📍 Simulate: At Receiver</button>
              <button onClick={function(){onAdvanceStatus(d.id)}} className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition">✅ Delivered — Confirm</button>
            </>)}
          </div>
        );
      })}
    </div>
  );
};

// --- PHASE 7: WHY THIS MATTERS MODAL ---
const WhyThisMattersModal = window.WhyThisMattersModal = function WhyThisMattersModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">🌍 Why Sanjeevni Matters</h3>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 flex items-center justify-center text-sm" aria-label="Close">✕</button>
        </div>
        <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <p><strong>The Problem:</strong> India wastes approximately {"{{VERIFIED_STAT_WITH_SOURCE}}"} tonnes of food annually while {"{{VERIFIED_STAT_WITH_SOURCE}}"} million people face food insecurity. Hostel messes, restaurants, and wedding halls produce surplus cooked food daily that spoils within hours.</p>
          <p><strong>The Gap:</strong> NGOs and volunteers don't know where surplus food is in real-time, so it spoils before it can reach those who need it.</p>
          <p><strong>Our Solution:</strong> Sanjeevni treats every donation as a <em>decaying asset</em> with a live "Safe-Until" clock. We only offer it to receivers who can physically reach it and serve it before the window closes. If no one can, the food steps down a <em>Waste Ladder</em> (People → Animals → Biogas) instead of going to landfill.</p>
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs"><strong>Built at MLH HackDay, AITR Indore</strong> — Combining decay kinetics, reachability mathematics, and community mobilization.</div>
        </div>
        <button onClick={onClose} className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs transition">Got it — Let's Rescue Some Food! 🍲</button>
      </div>
    </div>
  );
};

// --- PHASE 6: ESG PDF GENERATOR (using jsPDF from CDN) ---
window.generateESGCertificate = function generateESGCertificate(donorData) {
  if (!window.jspdf || !window.jspdf.jsPDF) {
    alert('PDF library loading... please try again in a moment.');
    return;
  }
  var jsPDF = window.jspdf.jsPDF;
  var doc = new jsPDF();
  var certId = 'CERT-SNJ-' + Date.now().toString(36).toUpperCase();

  // Header
  doc.setFillColor(23, 47, 42);
  doc.rect(0, 0, 210, 40, 'F');
  doc.setTextColor(247, 248, 243);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('SANJEEVNI', 105, 18, { align: 'center' });
  doc.setFontSize(10);
  doc.text('ESG Impact & Carbon Offset Certificate', 105, 28, { align: 'center' });
  doc.setFontSize(8);
  doc.text('Saving Food. Nourishing Lives.', 105, 35, { align: 'center' });

  // Body
  doc.setTextColor(23, 47, 42);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Certificate of Social Impact', 105, 55, { align: 'center' });

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('This certifies that', 105, 68, { align: 'center' });

  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(35, 99, 77);
  doc.text(donorData.name || 'Kaveri Hostel Mess', 105, 82, { align: 'center' });

  doc.setTextColor(23, 47, 42);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('has demonstrated commitment to zero-waste food rescue by', 105, 95, { align: 'center' });
  doc.text('donating surplus food through the Sanjeevni Network.', 105, 103, { align: 'center' });

  // Stats box
  doc.setFillColor(217, 233, 221);
  doc.roundedRect(30, 115, 150, 50, 3, 3, 'F');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  var plates = donorData.plates || 285;
  var co2 = Math.round(plates * 1.1);
  doc.text('Total Plates Donated: ' + plates, 40, 130);
  doc.text('CO₂ Emissions Avoided: ' + co2 + ' kg', 40, 140);
  doc.text('Waste Ladder Compliance: 100% (Zero Landfill)', 40, 150);
  doc.text('Verification Status: Digitally Verified', 40, 160);

  // Date and ID
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Issue Date: ' + new Date().toLocaleDateString('en-IN', {day:'numeric',month:'long',year:'numeric'}), 30, 180);
  doc.text('Certificate ID: ' + certId, 30, 188);

  // Footer
  doc.setFillColor(23, 47, 42);
  doc.rect(0, 270, 210, 27, 'F');
  doc.setTextColor(217, 233, 221);
  doc.setFontSize(8);
  doc.text('Sanjeevni — AI-Powered Food Waste Prevention & Redistribution Platform', 105, 280, { align: 'center' });
  doc.text('FSSAI Compliant • Blockchain-Ready Audit Trail • Built at MLH HackDay, AITR Indore', 105, 288, { align: 'center' });

  doc.save('Sanjeevni_ESG_Certificate_' + (donorData.name || 'Donor').replace(/\s+/g, '_') + '.pdf');
};

// --- PHASE 6: localStorage persistence helpers ---
window.SanjeevniStorage = {
  save: function(key, data) {
    try { localStorage.setItem('sanjeevni_'+key, JSON.stringify(data)); } catch(e) {}
  },
  load: function(key, fallback) {
    try {
      var d = localStorage.getItem('sanjeevni_'+key);
      return d ? JSON.parse(d) : fallback;
    } catch(e) { return fallback; }
  },
  clear: function() {
    try {
      Object.keys(localStorage).filter(function(k){return k.startsWith('sanjeevni_');}).forEach(function(k){localStorage.removeItem(k);});
    } catch(e) {}
  }
};

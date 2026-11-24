// =========================================================================
// SANJEEVNI - FOOD DONATION & SMART MATCHING ENGINE (SECTIONS 6 & 7)
// 13-Stage Lifecycle + Quality Checklist + Concurrency-Safe Allocation
// =========================================================================

// Decay kinetics constants (from existing codebase)
window.FOOD_BASELINE_HOURS = {
  'Cooked Meals': 3.5,
  'Rice and Curry': 3.0,
  'Cooked Dal / Lentils': 3.5,
  'Fresh vegetables': 24.0,
  'Fruits': 36.0,
  'Bakery products': 8.0,
  'Dairy Sweets': 2.0,
  'Packaged food': 72.0,
  'Raw food ingredients': 48.0,
  'Dairy products': 3.0,
  'Other eligible food': 4.0
};

window.STORAGE_MULTIPLIERS_MAP = {
  'Room Temp': 1.0,
  'Hot-Held': 1.3,
  'Chilled / Fridge': 2.0
};

// 13 Donation Lifecycle Statuses
window.DONATION_LIFECYCLE_STATUSES = [
  'Draft',
  'Submitted',
  'Pending Review',
  'Available',
  'Requested',
  'Accepted',
  'Pickup Assigned',
  'Collected',
  'Delivered',
  'Completed',
  'Cancelled',
  'Rejected',
  'Expired'
];

// Matching Engine: Ranks eligible receivers based on transparent rule-based algorithm (Section 7)
window.calculateReceiverMatch = function calculateReceiverMatch(donation, receiver, distanceKm) {
  // 1. Dietary Safety Guard
  if (receiver.strictlyVeg && donation.vegType === 'Non-Veg') {
    return { score: 0, eligible: false, reason: 'Strictly Vegetarian Shelter' };
  }

  // 2. Safe Window Reachability Calculation
  const baselineHours = window.FOOD_BASELINE_HOURS[donation.category] || 3.0;
  const storageMult = window.STORAGE_MULTIPLIERS_MAP[donation.storage] || 1.0;
  const totalSafeMinutes = baselineHours * storageMult * 60;
  const elapsedMinutes = (donation.cookedMinutesAgo || 30);
  const remainingSafeMinutes = Math.max(0, totalSafeMinutes - elapsedMinutes);

  // Transit ETA: 3 min per km + 10 min food handling/packaging + 15 min serving buffer
  const transitMinutes = Math.round(distanceKm * 3);
  const totalRequiredMinutes = transitMinutes + 10 + 15;

  if (remainingSafeMinutes < totalRequiredMinutes) {
    return {
      score: 15,
      eligible: false,
      reason: `Safe window expired (${Math.round(remainingSafeMinutes)}m remaining vs ${totalRequiredMinutes}m needed for safe transit & serving)`
    };
  }

  // 3. Multi-factor scoring (0 to 100)
  // Distance Score: closer is better (max 40 pts)
  const distanceScore = Math.max(0, 40 - (distanceKm * 4));

  // Capacity Score: can receiver absorb the batch? (max 30 pts)
  const capacityRatio = Math.min(1.0, (receiver.capacity || 100) / (donation.quantity || 50));
  const capacityScore = capacityRatio * 30;

  // Urgency & Safe Window Margin (max 20 pts)
  const marginRatio = Math.min(1.0, (remainingSafeMinutes - totalRequiredMinutes) / 120);
  const windowScore = marginRatio * 20;

  // Trust / Verification Factor (max 10 pts)
  const trustScore = ((receiver.trustScore || 0.95) * 10);

  const finalScore = Math.min(99, Math.round(distanceScore + capacityScore + windowScore + trustScore));

  return {
    score: finalScore,
    eligible: true,
    distanceKm: distanceKm,
    etaMinutes: transitMinutes + 10,
    remainingSafeMinutes: Math.round(remainingSafeMinutes),
    breakdown: { distanceScore, capacityScore, windowScore, trustScore }
  };
};

// =========================================================================
// GUIDED 3-STEP "POST FOOD / SURPLUS" WIZARD (SECTION 6.1)
// Step 1: Destination Selection (People, Animal Feed, Compost)
// Step 2: Dynamic Material & Safety Details
// Step 3: Precise Location Sharing (GPS / Map Pin / Manual) + Pickup Logistics
// =========================================================================
window.FoodDonationModal = function FoodDonationModal({ isOpen, onClose, onCreated, currentDonor, initialPathway = 'people' }) {
  if (!isOpen) return null;

  const [step, setStep] = React.useState(1);
  const [selectedPathway, setSelectedPathway] = React.useState(initialPathway || 'people');
  const [learnMorePathway, setLearnMorePathway] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [submittedDonation, setSubmittedDonation] = React.useState(null);

  // Form State across all steps
  const [formData, setFormData] = React.useState({
    // Step 2 Common
    title: '',
    quantity: selectedPathway === 'people' ? 60 : 30,
    unit: selectedPathway === 'people' ? 'plates' : 'kg',
    photoPreview: null,
    notes: '',

    // Step 2: Pathway 1 (People) Specific
    category: 'Cooked Meals',
    vegType: 'Veg',
    cookedMinutesAgo: 30,
    prepTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    expiryTime: '',
    storage: 'Hot-Held',
    temperatureProbeC: 68.5,
    packagingSealed: true,
    sensoryInspection: true,
    inspectorName: currentDonor?.name ? `${currentDonor.name} Staff` : 'Supervisor In-Charge',
    allergens: [],
    dietaryTags: ['Pure Veg'],

    // Step 2: Pathway 2 (Animal Feed) Specific
    intendedAnimal: 'Cattle / Gaushala',
    feedCondition: 'Fresh scraps',
    noExcessOnionGarlic: true,
    noMouldSpoiled: true,
    noChocolateToxic: true,
    noCookedBones: true,
    noPackagingMixed: true,

    // Step 2: Pathway 3 (Compost & Organic Recovery) Specific
    wasteCategory: 'Kitchen vegetable peels',
    zeroPlasticVerified: true,
    packagingSeparated: true,

    // Step 3: Location Sharing
    locationMode: 'gps', // 'gps' | 'map' | 'manual'
    lat: 22.7256,
    lng: 75.8637,
    accuracyMeters: 14.5,
    gpsCaptured: false,
    gpsLoading: false,
    gpsError: null,
    address: 'Campus Sector 2, North Block, Indore',
    building: 'Main Canteen Loading Bay 3',
    city: 'Indore',
    district: 'Indore',
    state: 'Madhya Pradesh',
    pincode: '452010',
    landmark: 'Opposite Student Sports Complex',

    // Step 3: Logistics
    pickupWindow: 'Within 2 hours',
    donorPhone: currentDonor?.phone || '+91 98765 00001',
    accessInstructions: 'Enter through back kitchen service gate. Ring buzzer #2 for kitchen supervisor.',

    // Step 3: Donor-Controlled Transportation Preference
    transportMode: 'sponsored', // 'donor_paid' | 'self_arranged' | 'sponsored'
    selfArrangedType: 'donor_delivery', // 'donor_delivery' | 'receiver_pickup'
    quotedCost: 240, // Quoted transport cost
    donorQuoteApproved: false,
    scheduledHandoverTime: 'Within 2 hours',
    fundingAvailable: true,
    selectedFundingSource: 'Institutional CSR Fund - Kaveri Group'
  });

  // Sync initial pathway if prop changes
  React.useEffect(() => {
    if (initialPathway && ['people', 'animal', 'compost'].includes(initialPathway)) {
      setSelectedPathway(initialPathway);
      setFormData(prev => ({
        ...prev,
        unit: initialPathway === 'people' ? 'plates' : 'kg',
        quantity: initialPathway === 'people' ? 60 : 30
      }));
    }
  }, [initialPathway]);

  // Leaflet Map Reference for Step 3 Map Options
  const mapContainerRef = React.useRef(null);
  const mapInstanceRef = React.useRef(null);
  const markerInstanceRef = React.useRef(null);

  React.useEffect(() => {
    if (step === 3 && (formData.locationMode === 'map' || formData.locationMode === 'gps') && mapContainerRef.current && window.L) {
      // Small timeout to allow modal animation to settle before Leaflet calculates bounds
      const timer = setTimeout(() => {
        if (!mapContainerRef.current) return;
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }

        try {
          const map = window.L.map(mapContainerRef.current, {
            scrollWheelZoom: false,
            zoomControl: true
          }).setView([formData.lat, formData.lng], 15);

          window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap'
          }).addTo(map);

          map.on('click', () => { map.scrollWheelZoom.enable(); });
          map.on('mouseout', () => { map.scrollWheelZoom.disable(); });
          setTimeout(() => { map.invalidateSize(); }, 150);

          const marker = window.L.marker([formData.lat, formData.lng], {
            draggable: formData.locationMode === 'map'
          }).addTo(map);

          marker.bindPopup(`<b>Pickup Location</b><br>${formData.address}`).openPopup();

          marker.on('dragend', function (e) {
            const pos = e.target.getLatLng();
            setFormData(prev => ({
              ...prev,
              lat: parseFloat(pos.lat.toFixed(5)),
              lng: parseFloat(pos.lng.toFixed(5)),
              accuracyMeters: 5.0
            }));
          });

          map.on('click', function(e) {
            if (formData.locationMode === 'map') {
              marker.setLatLng(e.latlng);
              setFormData(prev => ({
                ...prev,
                lat: parseFloat(e.latlng.lat.toFixed(5)),
                lng: parseFloat(e.latlng.lng.toFixed(5)),
                accuracyMeters: 5.0
              }));
            }
          });

          mapInstanceRef.current = map;
          markerInstanceRef.current = marker;
          map.invalidateSize();
        } catch (e) {
          console.warn('Leaflet initialization inside modal:', e);
        }
      }, 150);

      return () => {
        clearTimeout(timer);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }
      };
    }
  }, [step, formData.locationMode]);

  // High Accuracy Browser Geolocation API Handler
  const handleCaptureGPS = () => {
    if (!navigator.geolocation) {
      setFormData(prev => ({ ...prev, gpsError: 'Geolocation is not supported by your browser.' }));
      return;
    }
    setFormData(prev => ({ ...prev, gpsLoading: true, gpsError: null }));
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = parseFloat(pos.coords.latitude.toFixed(5));
        const lng = parseFloat(pos.coords.longitude.toFixed(5));
        const acc = Math.round(pos.coords.accuracy || 10);
        setFormData(prev => ({
          ...prev,
          lat,
          lng,
          accuracyMeters: acc,
          gpsCaptured: true,
          gpsLoading: false,
          gpsError: null,
          address: `Precise GPS Location (±${acc}m), Indore`
        }));

        if (mapInstanceRef.current && markerInstanceRef.current) {
          mapInstanceRef.current.setView([lat, lng], 16);
          markerInstanceRef.current.setLatLng([lat, lng]);
          markerInstanceRef.current.bindPopup(`<b>GPS Fixed (±${acc}m)</b><br>${lat}, ${lng}`).openPopup();
        }
        if (window.audio) window.audio.playChime('success');
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setFormData(prev => ({
          ...prev,
          gpsLoading: false,
          gpsError: 'Location permission denied or unavailable. You can pin location on the map or enter address manually.'
        }));
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const ALLERGEN_OPTIONS = [
    'Milk / Dairy',
    'Wheat / Gluten',
    'Peanuts',
    'Tree Nuts',
    'Soy',
    'Eggs',
    'Mustard'
  ];

  const FOOD_CATEGORIES = [
    'Cooked Meals',
    'Fresh vegetables',
    'Fruits',
    'Bakery products',
    'Packaged food',
    'Raw food ingredients',
    'Dairy products',
    'Other eligible food'
  ];

  const handleAllergenToggle = (alg) => {
    setFormData(prev => ({
      ...prev,
      allergens: prev.allergens.includes(alg)
        ? prev.allergens.filter(a => a !== alg)
        : [...prev.allergens, alg]
    }));
  };

  const handleSimulatedPhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setFormData(prev => ({ ...prev, photoPreview: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNextStep1 = () => {
    setError(null);
    setStep(2);
  };

  const handleNextStep2 = () => {
    if (!formData.title.trim()) {
      setError('Please provide a name/title for the surplus material.');
      return;
    }
    if (formData.quantity <= 0) {
      setError('Please specify a valid quantity greater than zero.');
      return;
    }
    // Safety check verification
    if (selectedPathway === 'animal') {
      if (!formData.noMouldSpoiled || !formData.noPackagingMixed || !formData.noChocolateToxic) {
        setError('Please verify all suitability checklist items before proceeding with animal feed.');
        return;
      }
    }
    if (selectedPathway === 'compost') {
      if (!formData.zeroPlasticVerified) {
        setError('Zero-plastic verification is mandatory for organic composting and biomethanation.');
        return;
      }
    }
    setError(null);
    setStep(3);
  };

  const handleSubmitFinal = async (e) => {
    if (e) e.preventDefault();
    if (!formData.address.trim()) {
      setError('Please provide a pickup address.');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const payload = {
        title: formData.title,
        pathway: selectedPathway,
        category: selectedPathway === 'people' ? formData.category : (selectedPathway === 'animal' ? 'Animal Feed' : 'Organic Waste'),
        quantity: formData.quantity,
        unit: formData.unit,
        vegType: formData.vegType,
        cookedMinutesAgo: formData.cookedMinutesAgo,
        prepTime: formData.prepTime,
        expiryTime: formData.expiryTime,
        storage: formData.storage,
        address: `${formData.building ? formData.building + ', ' : ''}${formData.address}`,
        lat: formData.lat,
        lng: formData.lng,
        donorId: currentDonor?.organisationId || 'ORG-D1',
        donorName: currentDonor?.name || 'Verified Food Donor',
        locationType: formData.locationMode,
        accuracyMeters: formData.accuracyMeters,
        pickupWindow: formData.pickupWindow,
        intendedAnimal: formData.intendedAnimal,
        feedCondition: formData.feedCondition,
        wasteCategory: formData.wasteCategory,
        zeroPlasticVerified: formData.zeroPlasticVerified ? 1 : 0,
        packagingSeparated: formData.packagingSeparated ? 1 : 0,
        notes: formData.notes,
        donorPhone: formData.donorPhone,
        dietaryTags: formData.dietaryTags,
        allergens: formData.allergens,
        transportMode: formData.transportMode,
        selfArrangedType: formData.transportMode === 'self_arranged' ? formData.selfArrangedType : null,
        quotedAmount: formData.transportMode === 'donor_paid' ? formData.quotedCost : 0,
        donorQuoteApproved: formData.transportMode === 'donor_paid' ? formData.donorQuoteApproved : false,
        fundingSourceId: formData.transportMode === 'sponsored' ? 'FUND-001' : null,
        fundingSourceName: formData.transportMode === 'sponsored' ? formData.selectedFundingSource : null,
        safetyChecks: {
          temperatureProbeC: formData.temperatureProbeC,
          packagingSealed: formData.packagingSealed,
          sensoryInspection: formData.sensoryInspection,
          inspectorName: formData.inspectorName,
          recordedAt: new Date().toISOString()
        }
      };

      const res = await window.SanjeevniAPI.createDonation(payload);
      const uniqueRef = res.referenceId || `SANJ-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      setSubmittedDonation({
        id: res.id,
        referenceId: uniqueRef,
        pathway: selectedPathway,
        pickupWindow: formData.pickupWindow,
        quantity: formData.quantity,
        unit: formData.unit,
        title: formData.title,
        transportMode: formData.transportMode,
        selfArrangedType: formData.selfArrangedType,
        quotedCost: formData.quotedCost,
        donorQuoteApproved: formData.donorQuoteApproved
      });

      if (window.audio) window.audio.playChime('success');
      if (window.confetti) {
        window.confetti({ particleCount: 75, spread: 60, origin: { y: 0.6 } });
      }

      setStep(4); // Confirmation Screen
      if (onCreated) onCreated();
    } catch (err) {
      setError(err.message || 'Failed to submit surplus registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#114B5F]/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-hidden shadow-2xl border border-[#D3E5DC] flex flex-col">
        {/* WIZARD HEADER WITH PROGRESS STEPPER */}
        <div className="bg-gradient-to-r from-[#114B5F] to-[#028090] p-4 sm:p-5 text-white flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-[#E4FDE1] text-[#028090] font-black flex items-center justify-center text-sm shadow-sm">
                🌱
              </span>
              <div>
                <h3 className="text-base sm:text-lg font-black text-[#F7FEF6]">
                  Post Surplus Resource — Guided Rescue Wizard
                </h3>
                <p className="text-[11px] text-[#E4FDE1] font-medium">
                  Every surplus resource should have a responsible destination.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold flex items-center justify-center transition"
            >
              ✕
            </button>
          </div>

          {/* Stepper Progression Bar */}
          {step <= 3 && (
            <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between text-xs">
              {/* Step 1 */}
              <div
                onClick={() => setStep(1)}
                className={`flex items-center gap-2 cursor-pointer transition ${step === 1 ? 'text-white font-black' : 'text-white/60 font-medium'}`}
              >
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  step > 1 ? 'bg-[#E4FDE1] text-[#028090]' : (step === 1 ? 'bg-white text-[#114B5F]' : 'bg-white/20 text-white')
                }`}>
                  {step > 1 ? '✓' : '1'}
                </span>
                <span className="hidden sm:inline">1. Select Pathway</span>
              </div>
              <div className={`flex-1 h-0.5 mx-2 ${step > 1 ? 'bg-[#E4FDE1]' : 'bg-white/20'}`} />

              {/* Step 2 */}
              <div
                onClick={() => { if (step > 2) setStep(2); }}
                className={`flex items-center gap-2 transition ${step === 2 ? 'text-white font-black' : (step > 2 ? 'text-white/80 cursor-pointer font-bold' : 'text-white/50')}`}
              >
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  step > 2 ? 'bg-[#E4FDE1] text-[#028090]' : (step === 2 ? 'bg-white text-[#114B5F]' : 'bg-white/20 text-white')
                }`}>
                  {step > 2 ? '✓' : '2'}
                </span>
                <span className="hidden sm:inline">2. Material Details</span>
              </div>
              <div className={`flex-1 h-0.5 mx-2 ${step > 2 ? 'bg-[#E4FDE1]' : 'bg-white/20'}`} />

              {/* Step 3 */}
              <div className={`flex items-center gap-2 ${step === 3 ? 'text-white font-black' : 'text-white/50'}`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  step === 3 ? 'bg-white text-[#114B5F]' : 'bg-white/20 text-white'
                }`}>
                  3
                </span>
                <span className="hidden sm:inline">3. Location & Pickup</span>
              </div>
            </div>
          )}
        </div>

        {/* ERROR BANNER */}
        {error && (
          <div className="p-3 mx-4 mt-3 rounded-xl bg-[#FDF2F2] border border-[#FECDCA] text-[#B42318] font-semibold text-xs flex items-center justify-between">
            <span>⚠️ {error}</span>
            <button onClick={() => setError(null)} className="text-[#B42318] font-bold text-sm">✕</button>
          </div>
        )}

        {/* WIZARD SCROLLABLE CONTENT */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs flex-1">
          {/* =========================================================================
              STEP 1: SELECT WHERE YOUR SURPLUS SHOULD GO
             ========================================================================= */}
          {step === 1 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="text-center max-w-md mx-auto space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#028090] bg-[#E4FDE1] px-2.5 py-0.5 rounded-full">
                  Step 1 of 3
                </span>
                <h4 className="text-lg font-black text-[#114B5F]">
                  Select Where Your Surplus Should Go
                </h4>
                <p className="text-xs text-slate-500">
                  Select the appropriate destination for your surplus to ensure responsible redistribution and safety compliance.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                {/* CARD 1: FOOD FOR PEOPLE */}
                <div
                  onClick={() => setSelectedPathway('people')}
                  className={`relative p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                    selectedPathway === 'people'
                      ? 'border-[#028090] bg-[#E4FDE1]/40 shadow-lg ring-2 ring-[#028090]/30'
                      : 'border-slate-200 bg-white hover:border-[#028090]/50 hover:shadow-md'
                  }`}
                >
                  {selectedPathway === 'people' && (
                    <div className="absolute -top-2.5 -right-2.5 w-6 h-6 rounded-full bg-[#028090] text-white flex items-center justify-center text-xs font-black shadow-md">
                      ✓
                    </div>
                  )}

                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-[#E4FDE1] flex items-center justify-center text-2xl">
                        🍲
                      </div>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#028090] text-white uppercase">
                        Tier 1 Priority
                      </span>
                    </div>

                    <div>
                      <h5 className="text-sm font-black text-[#114B5F]">Food for People</h5>
                      <span className="text-[10px] text-[#028090] font-bold">SDG 2: Zero Hunger</span>
                      <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                        Best for untouched, fresh cooked meals & intact groceries.
                      </p>
                    </div>

                    <div className="text-[11px] text-slate-500 pt-1.5 border-t border-slate-100">
                      Redirected to NGOs, orphanages, old-age homes and community kitchens.
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setLearnMorePathway('people'); }}
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-[11px] font-bold transition"
                    >
                      Learn More ℹ️
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedPathway('people')}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold transition ${
                        selectedPathway === 'people'
                          ? 'bg-[#028090] text-white shadow-sm'
                          : 'bg-slate-100 text-[#114B5F] hover:bg-slate-200'
                      }`}
                    >
                      {selectedPathway === 'people' ? 'Selected ✓' : 'Select'}
                    </button>
                  </div>
                </div>

                {/* CARD 2: SUITABLE ANIMAL FEED */}
                <div
                  onClick={() => setSelectedPathway('animal')}
                  className={`relative p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                    selectedPathway === 'animal'
                      ? 'border-[#456990] bg-[#D8E6EC]/50 shadow-lg ring-2 ring-[#456990]/30'
                      : 'border-slate-200 bg-white hover:border-[#456990]/50 hover:shadow-md'
                  }`}
                >
                  {selectedPathway === 'animal' && (
                    <div className="absolute -top-2.5 -right-2.5 w-6 h-6 rounded-full bg-[#456990] text-white flex items-center justify-center text-xs font-black shadow-md">
                      ✓
                    </div>
                  )}

                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-2xl">
                        🐾
                      </div>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#456990] text-white uppercase">
                        Tier 2 Safe Feed
                      </span>
                    </div>

                    <div>
                      <h5 className="text-sm font-black text-[#114B5F]">Suitable Animal Feed</h5>
                      <span className="text-[10px] text-[#456990] font-bold">Animal Welfare & Care</span>
                      <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                        Best for clean vegetable scraps, surplus rotis, plain rice & grains.
                      </p>
                    </div>

                    <div className="text-[11px] text-slate-500 pt-1.5 border-t border-slate-100">
                      Redirected to Gaushalas, cattle shelters & animal rescue centres.
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setLearnMorePathway('animal'); }}
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-[11px] font-bold transition"
                    >
                      Learn More ℹ️
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedPathway('animal')}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold transition ${
                        selectedPathway === 'animal'
                          ? 'bg-[#456990] text-white shadow-sm'
                          : 'bg-slate-100 text-[#114B5F] hover:bg-slate-200'
                      }`}
                    >
                      {selectedPathway === 'animal' ? 'Selected ✓' : 'Select'}
                    </button>
                  </div>
                </div>

                {/* CARD 3: COMPOST & ORGANIC RECOVERY */}
                <div
                  onClick={() => setSelectedPathway('compost')}
                  className={`relative p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                    selectedPathway === 'compost'
                      ? 'border-[#23634D] bg-[#E4FDE1]/30 shadow-lg ring-2 ring-[#23634D]/30'
                      : 'border-slate-200 bg-white hover:border-[#23634D]/50 hover:shadow-md'
                  }`}
                >
                  {selectedPathway === 'compost' && (
                    <div className="absolute -top-2.5 -right-2.5 w-6 h-6 rounded-full bg-[#23634D] text-white flex items-center justify-center text-xs font-black shadow-md">
                      ✓
                    </div>
                  )}

                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-2xl">
                        🌱
                      </div>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#23634D] text-white uppercase">
                        Tier 3 Bio-Recovery
                      </span>
                    </div>

                    <div>
                      <h5 className="text-sm font-black text-[#114B5F]">Compost & Bio-Recovery</h5>
                      <span className="text-[10px] text-[#23634D] font-bold">SDG 12 & 13: Zero Landfill</span>
                      <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                        Best for spoiled, expired or inedible organic waste & peelings.
                      </p>
                    </div>

                    <div className="text-[11px] text-slate-500 pt-1.5 border-t border-slate-100">
                      Redirected to municipal biomethanation & community composting hubs.
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setLearnMorePathway('compost'); }}
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-[11px] font-bold transition"
                    >
                      Learn More ℹ️
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedPathway('compost')}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold transition ${
                        selectedPathway === 'compost'
                          ? 'bg-[#23634D] text-white shadow-sm'
                          : 'bg-slate-100 text-[#114B5F] hover:bg-slate-200'
                      }`}
                    >
                      {selectedPathway === 'compost' ? 'Selected ✓' : 'Select'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Step 1 Actions */}
              <div className="pt-4 flex items-center justify-between border-t border-slate-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleNextStep1}
                  className="px-6 py-2.5 rounded-xl bg-[#028090] hover:bg-[#114B5F] text-white font-black text-xs shadow-md transition flex items-center gap-1.5"
                >
                  <span>Continue to Step 2: Material Details</span>
                  <span>➔</span>
                </button>
              </div>
            </div>
          )}

          {/* =========================================================================
              STEP 2: DYNAMIC MATERIAL DETAILS (ACCORDING TO SELECTED PATHWAY)
             ========================================================================= */}
          {step === 2 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#028090] bg-[#E4FDE1] px-2.5 py-0.5 rounded-full">
                    Step 2 of 3
                  </span>
                  <h4 className="text-base font-black text-[#114B5F] mt-1">
                    Enter Material Details ({
                      selectedPathway === 'people' ? 'Food for People' : (selectedPathway === 'animal' ? 'Suitable Animal Feed' : 'Compost & Organic Recovery')
                    })
                  </h4>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold">
                  <span>Selected:</span>
                  <span className="text-[#028090] font-black">{selectedPathway.toUpperCase()}</span>
                </div>
              </div>

              {/* PATHWAY 1: FOOD FOR PEOPLE FORM FIELDS */}
              {selectedPathway === 'people' && (
                <div className="space-y-3.5">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Food / Dish Name & Description *</label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={e => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g. Steamed Basmati Rice, Dal Tadka & 80 Fresh Chapatis"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium text-xs focus:ring-2 focus:ring-[#028090]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Food Category</label>
                      <select
                        value={formData.category}
                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                      >
                        {FOOD_CATEGORIES.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Quantity & Units</label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          min="1"
                          required
                          value={formData.quantity}
                          onChange={e => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })}
                          className="w-2/3 px-3 py-2 rounded-xl border border-slate-300 font-bold"
                        />
                        <select
                          value={formData.unit}
                          onChange={e => setFormData({ ...formData, unit: e.target.value })}
                          className="w-1/3 px-2 py-2 rounded-xl border border-slate-300 bg-white font-bold"
                        >
                          <option value="plates">Plates</option>
                          <option value="kg">kg</option>
                          <option value="packets">Packs</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Dietary Classification</label>
                      <select
                        value={formData.vegType}
                        onChange={e => setFormData({ ...formData, vegType: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-bold text-[#028090]"
                      >
                        <option value="Veg">🟢 Pure Veg</option>
                        <option value="Non-Veg">🔴 Non-Veg</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Storage Condition</label>
                      <select
                        value={formData.storage}
                        onChange={e => setFormData({ ...formData, storage: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                      >
                        <option value="Hot-Held">♨️ Hot-Held (≥63°C Bain-Marie - 1.3x)</option>
                        <option value="Chilled / Fridge">❄️ Chilled / Fridge (≤4°C - 2.0x)</option>
                        <option value="Room Temp">🌡️ Room Temp (25-30°C - 1.0x)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Cooked Time</label>
                      <div className="flex gap-2 items-center">
                        <input
                          type="number"
                          min="0"
                          value={formData.cookedMinutesAgo}
                          onChange={e => setFormData({ ...formData, cookedMinutesAgo: parseInt(e.target.value) || 0 })}
                          className="w-1/2 px-3 py-2 rounded-xl border border-slate-300 font-bold"
                        />
                        <span className="text-[11px] text-slate-500 whitespace-nowrap">mins ago</span>
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Preparation Time</label>
                      <input
                        type="text"
                        value={formData.prepTime}
                        onChange={e => setFormData({ ...formData, prepTime: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300"
                      />
                    </div>
                  </div>

                  {/* Food Safety Checklist */}
                  <div className="p-4 rounded-2xl bg-[#E4FDE1]/60 border border-[#028090]/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-[#114B5F] flex items-center gap-1.5">
                        <span>🛡️</span> Food Safety & Quality Verification (FSSAI Aligned)
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[#028090] text-white font-bold">Mandatory</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Core Probe Temperature (°C)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={formData.temperatureProbeC}
                          onChange={e => setFormData({ ...formData, temperatureProbeC: parseFloat(e.target.value) || 0 })}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-bold text-[#028090]"
                        />
                        <span className="text-[10px] text-slate-500">Standard: ≥63°C for hot, ≤4°C for chilled</span>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Inspector / Supervisor Name</label>
                        <input
                          type="text"
                          value={formData.inspectorName}
                          onChange={e => setFormData({ ...formData, inspectorName: e.target.value })}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 pt-1">
                      <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                        <input
                          type="checkbox"
                          checked={formData.packagingSealed}
                          onChange={e => setFormData({ ...formData, packagingSealed: e.target.checked })}
                          className="rounded text-[#028090] focus:ring-[#028090]"
                        />
                        <span>Hygienic sealed packaging checked</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                        <input
                          type="checkbox"
                          checked={formData.sensoryInspection}
                          onChange={e => setFormData({ ...formData, sensoryInspection: e.target.checked })}
                          className="rounded text-[#028090] focus:ring-[#028090]"
                        />
                        <span>Sensory freshness & odor verified</span>
                      </label>
                    </div>
                  </div>

                  {/* Declared Allergens */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">
                      Declared Allergens (Clearly flagged for beneficiary safety):
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {ALLERGEN_OPTIONS.map(alg => (
                        <button
                          type="button"
                          key={alg}
                          onClick={() => handleAllergenToggle(alg)}
                          className={`px-2.5 py-1 rounded-lg border font-semibold text-[11px] transition ${
                            formData.allergens.includes(alg)
                              ? 'bg-amber-100 border-amber-300 text-amber-900 font-bold'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {formData.allergens.includes(alg) ? '⚠️ ' : '+ '}{alg}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* PATHWAY 2: SUITABLE ANIMAL FEED FORM FIELDS */}
              {selectedPathway === 'animal' && (
                <div className="space-y-3.5">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Feed / Material Description *</label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={e => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g. Fresh vegetable peelings, leftover chapatis & boiled rice"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium text-xs focus:ring-2 focus:ring-[#456990]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Intended Animal Group</label>
                      <select
                        value={formData.intendedAnimal}
                        onChange={e => setFormData({ ...formData, intendedAnimal: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-bold"
                      >
                        <option value="Cattle / Gaushala">🐄 Cattle / Gaushala (Cows, Bulls)</option>
                        <option value="Dogs / Stray Animals">🐕 Canines / Stray Animal Shelters</option>
                        <option value="Birds / Poultry">🕊️ Birds / Fowl Feed</option>
                        <option value="General Livestock">🐐 General Farm Livestock</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Quantity (kg) *</label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={formData.quantity}
                        onChange={e => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Feed Physical Condition</label>
                      <select
                        value={formData.feedCondition}
                        onChange={e => setFormData({ ...formData, feedCondition: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                      >
                        <option value="Fresh scraps">🥬 Fresh raw kitchen trimmings</option>
                        <option value="Stale (non-mouldy)">🍞 Stale (strictly non-mouldy bread/rotis)</option>
                        <option value="Dry grains">🌾 Dry grain scraps & spent grains</option>
                      </select>
                    </div>
                  </div>

                  {/* Animal Suitability Checklist */}
                  <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-300 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-amber-950 flex items-center gap-1.5">
                        <span>🐾</span> Mandatory Animal Health & Suitability Checks
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-800 text-white font-bold">Strict Rule</span>
                    </div>

                    <div className="space-y-2 text-xs text-amber-900">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.noExcessOnionGarlic}
                          onChange={e => setFormData({ ...formData, noExcessOnionGarlic: e.target.checked })}
                          className="rounded text-amber-700"
                        />
                        <span>Confirmed: NO excess onion, garlic, or sharp spicy masala curries</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.noMouldSpoiled}
                          onChange={e => setFormData({ ...formData, noMouldSpoiled: e.target.checked })}
                          className="rounded text-amber-700"
                        />
                        <span>Confirmed: NO fermented, mouldy, discolored, or toxic food</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.noChocolateToxic}
                          onChange={e => setFormData({ ...formData, noChocolateToxic: e.target.checked })}
                          className="rounded text-amber-700"
                        />
                        <span>Confirmed: NO chocolate, caffeine, xylitol, or toxic compounds</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.noCookedBones}
                          onChange={e => setFormData({ ...formData, noCookedBones: e.target.checked })}
                          className="rounded text-amber-700"
                        />
                        <span>Confirmed: NO cooked chicken/mutton bones (splinter hazards)</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer font-bold text-amber-950">
                        <input
                          type="checkbox"
                          checked={formData.noPackagingMixed}
                          onChange={e => setFormData({ ...formData, noPackagingMixed: e.target.checked })}
                          className="rounded text-amber-700"
                        />
                        <span>Confirmed: 100% Free of plastic bags, twine, rubber bands & foil wrappers</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* PATHWAY 3: COMPOST & ORGANIC RECOVERY FORM FIELDS */}
              {selectedPathway === 'compost' && (
                <div className="space-y-3.5">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Organic Waste Description *</label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={e => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g. Mixed kitchen vegetable peels, coffee grounds & banquet scraps"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium text-xs focus:ring-2 focus:ring-[#23634D]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Organic Waste Category</label>
                      <select
                        value={formData.wasteCategory}
                        onChange={e => setFormData({ ...formData, wasteCategory: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                      >
                        <option value="Fruit/Vegetable waste">Market Fruit & Vegetable Rejects</option>
                        <option value="Mixed cooked food waste">Inedible Mixed Cooked Food Scraps</option>
                        <option value="Brewery/Bakery spent waste">Bakery & Brewery Spent Residuals</option>
                        <option value="Floral waste">Temple Floral & Botanical Waste</option>
                        <option value="Coffee & Tea grounds">Coffee Grounds & Organic Filter Cake</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Quantity (kg) *</label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={formData.quantity}
                        onChange={e => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold"
                      />
                    </div>
                  </div>

                  {/* Compost Zero-Plastic Checklist */}
                  <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-300 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-emerald-950 flex items-center gap-1.5">
                        <span>🌱</span> Mandatory Zero-Plastic & Bio-Purity Verification
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-800 text-white font-bold">Landfill Diverted</span>
                    </div>

                    <div className="space-y-2 text-xs text-emerald-950">
                      <label className="flex items-center gap-2 cursor-pointer font-bold">
                        <input
                          type="checkbox"
                          checked={formData.zeroPlasticVerified}
                          onChange={e => setFormData({ ...formData, zeroPlasticVerified: e.target.checked })}
                          className="rounded text-emerald-700"
                        />
                        <span>Confirmed: 100% Zero Plastic verified (no polythene bags, twist ties, or plastic stickers)</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.packagingSeparated}
                          onChange={e => setFormData({ ...formData, packagingSeparated: e.target.checked })}
                          className="rounded text-emerald-700"
                        />
                        <span>Confirmed: Packaging separated into wet organic and dry recyclables at source</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* COMMON FIELDS TO ALL PATHWAYS (PHOTO & SPECIAL NOTES) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Photo Upload (Optional visual inspection)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleSimulatedPhotoUpload}
                    className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#E4FDE1] file:text-[#028090] hover:file:bg-[#c5ecc0]"
                  />
                  {formData.photoPreview && (
                    <div className="mt-2 relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200">
                      <img src={formData.photoPreview} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, photoPreview: null })}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-600 text-white text-[10px] flex items-center justify-center font-bold"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Handling / Quality Notes</label>
                  <textarea
                    rows="2"
                    value={formData.notes}
                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="e.g. Packed in clean 20-litre buckets; handle with care."
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
              </div>

              {/* Step 2 Actions */}
              <div className="pt-3 flex items-center justify-between border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition"
                >
                  ← Back to Step 1
                </button>
                <button
                  type="button"
                  onClick={handleNextStep2}
                  className="px-6 py-2.5 rounded-xl bg-[#028090] hover:bg-[#114B5F] text-white font-black text-xs shadow-md transition flex items-center gap-1.5"
                >
                  <span>Next: Location & Pickup</span>
                  <span>➔</span>
                </button>
              </div>
            </div>
          )}

          {/* =========================================================================
              STEP 3: PRECISE LOCATION SHARING & PICKUP LOGISTICS
             ========================================================================= */}
          {step === 3 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#028090] bg-[#E4FDE1] px-2.5 py-0.5 rounded-full">
                    Step 3 of 3
                  </span>
                  <h4 className="text-base font-black text-[#114B5F] mt-1">
                    Precise Location & Pickup Confirmation
                  </h4>
                </div>
                <div className="text-xs text-slate-500 font-medium">
                  KARN Pickup Network
                </div>
              </div>

              {/* SECTION A: PRECISE LOCATION SHARING WITH 3 OPTIONS */}
              <div className="p-4 rounded-2xl bg-[#F7FEF6] border border-[#D3E5DC] space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-black text-xs text-[#114B5F] flex items-center gap-1.5 uppercase tracking-wide">
                    <span>📍</span> Share My Current Location
                  </span>
                  <div className="flex items-center p-0.5 rounded-xl bg-slate-200/80 text-[11px] font-bold">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, locationMode: 'gps' }))}
                      className={`px-3 py-1 rounded-lg transition ${formData.locationMode === 'gps' ? 'bg-[#028090] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                      📡 GPS Current
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, locationMode: 'map' }))}
                      className={`px-3 py-1 rounded-lg transition ${formData.locationMode === 'map' ? 'bg-[#028090] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                      🗺️ Select on Map
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, locationMode: 'manual' }))}
                      className={`px-3 py-1 rounded-lg transition ${formData.locationMode === 'manual' ? 'bg-[#028090] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                      ✍️ Manual Address
                    </button>
                  </div>
                </div>

                {/* Option A: Use My Current Location */}
                {formData.locationMode === 'gps' && (
                  <div className="space-y-2.5 pt-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={handleCaptureGPS}
                        disabled={formData.gpsLoading}
                        className="px-4 py-2 rounded-xl bg-[#028090] hover:bg-[#114B5F] text-white font-black text-xs shadow-md transition flex items-center gap-2"
                      >
                        <span>{formData.gpsLoading ? '⏳ Detecting GPS...' : '📍 Use My Current Location'}</span>
                      </button>

                      <div className="text-[11px] text-slate-600 font-semibold">
                        {formData.gpsCaptured ? (
                          <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md font-bold">
                            ✓ Fixed: ±{formData.accuracyMeters}m ({formData.lat}, {formData.lng})
                          </span>
                        ) : (
                          <span>Coordinates: {formData.lat}, {formData.lng} (Campus Hub Default)</span>
                        )}
                      </div>
                    </div>

                    {formData.gpsError && (
                      <div className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200">
                        ⚠️ {formData.gpsError}
                      </div>
                    )}

                    {/* Interactive mini-map container */}
                    <div className="relative rounded-xl overflow-hidden border border-[#D3E5DC] h-48 w-full shadow-inner bg-slate-100">
                      <div ref={mapContainerRef} className="w-full h-full" />
                      <div className="absolute bottom-2 left-2 z-10 px-2 py-1 rounded-lg bg-white/90 backdrop-blur-sm text-[10px] font-bold text-[#114B5F] shadow">
                        Live GPS Map Pin: {formData.lat}, {formData.lng}
                      </div>
                    </div>
                  </div>
                )}

                {/* Option B: Select Location on Map */}
                {formData.locationMode === 'map' && (
                  <div className="space-y-2.5 pt-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-600">
                      <span>Drag the marker or click on map to set your exact pickup dock:</span>
                      <span className="font-bold text-[#028090]">{formData.lat}, {formData.lng}</span>
                    </div>
                    <div className="relative rounded-xl overflow-hidden border border-[#D3E5DC] h-52 w-full shadow-inner bg-slate-100">
                      <div ref={mapContainerRef} className="w-full h-full" />
                    </div>
                  </div>
                )}

                {/* Option C: Manual Address Entry */}
                {formData.locationMode === 'manual' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Building / Facility / Dock Name</label>
                      <input
                        type="text"
                        value={formData.building}
                        onChange={e => setFormData({ ...formData, building: e.target.value })}
                        placeholder="e.g. Block B, Central Kitchen Loading Dock"
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Street / Colony / Area *</label>
                      <input
                        type="text"
                        required
                        value={formData.address}
                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">City & PIN Code</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={formData.city}
                          onChange={e => setFormData({ ...formData, city: e.target.value })}
                          className="w-2/3 px-3 py-1.5 rounded-lg border border-slate-300"
                        />
                        <input
                          type="text"
                          value={formData.pincode}
                          onChange={e => setFormData({ ...formData, pincode: e.target.value })}
                          className="w-1/3 px-2 py-1.5 rounded-lg border border-slate-300"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Landmark / Gate Marker</label>
                      <input
                        type="text"
                        value={formData.landmark}
                        onChange={e => setFormData({ ...formData, landmark: e.target.value })}
                        placeholder="e.g. Near Gate 3 security booth"
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300"
                      />
                    </div>
                  </div>
                )}

                {/* Privacy & Consent Notice */}
                <div className="p-2.5 rounded-xl bg-white border border-[#D3E5DC] text-[11px] text-slate-600 flex items-start gap-2">
                  <span className="text-base text-[#028090]">🔒</span>
                  <div>
                    <strong>Strict Privacy & Consent Guarantee:</strong> Exact GPS coordinates are encrypted and only accessible to the verified receiving organisation and assigned KARN rescue volunteer agent for active pickup navigation. Coordinates are never made public.
                  </div>
                </div>
              </div>

              {/* SECTION B: PICKUP WINDOW & ACCESS LOGISTICS */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Preferred Pickup Window *</label>
                  <select
                    value={formData.pickupWindow}
                    onChange={e => setFormData({ ...formData, pickupWindow: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-bold text-[#028090]"
                  >
                    <option value="Immediately / Next 45 mins">⚡ Immediately (Next 45 mins)</option>
                    <option value="Within 2 hours">⏳ Within 2 hours</option>
                    <option value="Evening (17:00 - 19:00)">🌇 Evening (17:00 - 19:00)</option>
                    <option value="Tonight (21:30 - 23:00)">🌙 Post-Dinner (21:30 - 23:00)</option>
                    <option value="Tomorrow Morning (08:00 - 10:00)">☀️ Tomorrow Morning</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Donor Phone Number *</label>
                  <input
                    type="text"
                    required
                    value={formData.donorPhone}
                    onChange={e => setFormData({ ...formData, donorPhone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Dock / Gate Access Notes</label>
                  <input
                    type="text"
                    value={formData.accessInstructions}
                    onChange={e => setFormData({ ...formData, accessInstructions: e.target.value })}
                    placeholder="e.g. Ring kitchen buzzer, ask for Suresh"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              {/* SECTION C: DONOR-CONTROLLED TRANSPORTATION PREFERENCE */}
              <div className="p-5 rounded-3xl bg-white border-2 border-[#D3E5DC] shadow-sm space-y-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xl text-[#028090]">🚚</span>
                    <h4 className="text-sm font-black text-[#114B5F]">
                      How would you like to arrange transportation?
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Choose how your donation will reach the receiving organisation. SANJEEVNI's KARN network will help coordinate the selected arrangement.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                  {/* OPTION 1: I'll Pay for Transportation */}
                  <div
                    onClick={() => setFormData({ ...formData, transportMode: 'donor_paid' })}
                    className={`p-4 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between ${
                      formData.transportMode === 'donor_paid'
                        ? 'bg-[#E4FDE1]/50 border-[#028090] ring-2 ring-[#028090]/20 shadow-md'
                        : 'bg-white border-slate-200 hover:border-[#028090]/50'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl">💳</span>
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                          formData.transportMode === 'donor_paid' ? 'bg-[#028090] text-white' : 'bg-slate-100 text-slate-600'
                        }`}>
                          Donor Funded
                        </span>
                      </div>
                      <div className="font-black text-xs text-[#114B5F]">
                        I'll Pay for Transportation
                      </div>
                      <p className="text-[11px] text-slate-600 leading-normal">
                        I am willing to cover the transportation cost for this donation.
                      </p>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-200/80 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-semibold">Estimated Quote:</span>
                        <strong className="text-[#028090] font-black text-sm">₹{formData.quotedCost.toFixed(2)}</strong>
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Provider: <strong>Indore Green EV Logistics</strong>
                      </div>
                      {formData.transportMode === 'donor_paid' && (
                        <label className="mt-2 flex items-start gap-2 p-2 rounded-xl bg-white border border-[#028090]/30 cursor-pointer text-[10px] text-slate-700">
                          <input
                            type="checkbox"
                            checked={formData.donorQuoteApproved}
                            onChange={e => setFormData({ ...formData, donorQuoteApproved: e.target.checked })}
                            className="mt-0.5 rounded text-[#028090] focus:ring-[#028090]"
                          />
                          <span>I explicitly review and approve the quoted logistics cost of <strong>₹{formData.quotedCost.toFixed(2)}</strong>.</span>
                        </label>
                      )}
                    </div>
                  </div>

                  {/* OPTION 2: I'll Arrange Pickup Myself */}
                  <div
                    onClick={() => setFormData({ ...formData, transportMode: 'self_arranged' })}
                    className={`p-4 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between ${
                      formData.transportMode === 'self_arranged'
                        ? 'bg-[#E4FDE1]/50 border-[#028090] ring-2 ring-[#028090]/20 shadow-md'
                        : 'bg-white border-slate-200 hover:border-[#028090]/50'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl">📦</span>
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                          formData.transportMode === 'self_arranged' ? 'bg-[#028090] text-white' : 'bg-slate-100 text-slate-600'
                        }`}>
                          Self-Arranged
                        </span>
                      </div>
                      <div className="font-black text-xs text-[#114B5F]">
                        I'll Arrange Pickup Myself
                      </div>
                      <p className="text-[11px] text-slate-600 leading-normal">
                        I will arrange transportation for this donation myself.
                      </p>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-200/80 space-y-1.5">
                      {formData.transportMode === 'self_arranged' ? (
                        <div className="space-y-1.5 text-[11px]">
                          <label className="flex items-center gap-1.5 p-1.5 rounded-lg bg-white border border-slate-200 cursor-pointer">
                            <input
                              type="radio"
                              name="selfArrangedType"
                              value="donor_delivery"
                              checked={formData.selfArrangedType === 'donor_delivery'}
                              onChange={() => setFormData({ ...formData, selfArrangedType: 'donor_delivery' })}
                              className="text-[#028090]"
                            />
                            <span><strong>A.</strong> Donor delivers to receiver</span>
                          </label>
                          <label className="flex items-center gap-1.5 p-1.5 rounded-lg bg-white border border-slate-200 cursor-pointer">
                            <input
                              type="radio"
                              name="selfArrangedType"
                              value="receiver_pickup"
                              checked={formData.selfArrangedType === 'receiver_pickup'}
                              onChange={() => setFormData({ ...formData, selfArrangedType: 'receiver_pickup' })}
                              className="text-[#028090]"
                            />
                            <span><strong>B.</strong> Receiver / NGO collects food</span>
                          </label>
                        </div>
                      ) : (
                        <div className="text-[10px] text-slate-500 italic">
                          Choose direct donor drop-off or NGO collection. No courier fees.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* OPTION 3: Request Sponsored Transportation */}
                  <div
                    onClick={() => setFormData({ ...formData, transportMode: 'sponsored' })}
                    className={`p-4 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between ${
                      formData.transportMode === 'sponsored'
                        ? 'bg-[#E4FDE1]/50 border-[#028090] ring-2 ring-[#028090]/20 shadow-md'
                        : 'bg-white border-slate-200 hover:border-[#028090]/50'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl">🤝</span>
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                          formData.transportMode === 'sponsored' ? 'bg-[#028090] text-white' : 'bg-slate-100 text-slate-600'
                        }`}>
                          Sponsorship
                        </span>
                      </div>
                      <div className="font-black text-xs text-[#114B5F]">
                        Request Sponsored Transportation
                      </div>
                      <p className="text-[11px] text-slate-600 leading-normal">
                        I would like SANJEEVNI to arrange transportation through available sponsorship or institutional support.
                      </p>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-200/80 space-y-1.5 text-[11px]">
                      {formData.fundingAvailable ? (
                        <div className="p-2 rounded-xl bg-white border border-emerald-200 text-emerald-800 text-[10px] flex items-center gap-1.5">
                          <span>✓</span>
                          <span><strong>Funding Active:</strong> Institutional CSR allocation approved.</span>
                        </div>
                      ) : (
                        <div className="p-2 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-[10px] space-y-1">
                          <p><strong>Notice:</strong> Sponsorship is currently unavailable for this pickup. You can continue waiting for sponsorship or choose another transportation arrangement.</p>
                          <div className="flex flex-wrap gap-1 pt-1">
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); setFormData({ ...formData, transportMode: 'donor_paid' }); }}
                              className="px-2 py-0.5 rounded bg-[#028090] text-white text-[9px] font-bold"
                            >
                              Switch to Paid
                            </button>
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); setFormData({ ...formData, transportMode: 'self_arranged' }); }}
                              className="px-2 py-0.5 rounded bg-slate-200 text-slate-800 text-[9px] font-bold"
                            >
                              Self-Pickup
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION D: REVIEW & SUMMARY CARD */}
              <div className="p-4 rounded-2xl bg-[#E4FDE1]/70 border border-[#028090]/30 space-y-2">
                <div className="font-extrabold text-xs text-[#114B5F] flex items-center justify-between">
                  <span>📋 Review Surplus Registration Summary</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[#028090] text-white font-black uppercase">
                    Ready for Dispatch
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px] text-slate-700">
                  <div>
                    <span className="text-slate-500 block">Pathway:</span>
                    <strong className="text-[#028090] font-black uppercase">{selectedPathway}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Item:</span>
                    <strong className="text-[#114B5F]">{formData.title || 'Untitled'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Quantity:</span>
                    <strong>{formData.quantity} {formData.unit}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Window:</span>
                    <strong className="text-emerald-800">{formData.pickupWindow}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Logistics:</span>
                    <strong className="text-[#028090] font-black">
                      {formData.transportMode === 'donor_paid' ? `Donor Funded (₹${formData.quotedCost})` : (formData.transportMode === 'self_arranged' ? 'Self-Arranged' : 'Sponsored')}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Step 3 Actions */}
              <div className="pt-3 flex items-center justify-between border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition"
                >
                  ← Back to Step 2
                </button>
                <button
                  type="button"
                  onClick={handleSubmitFinal}
                  disabled={loading}
                  className="px-6 py-2.5 rounded-xl bg-[#F45B69] hover:bg-[#e04856] text-[#072A35] font-black text-xs shadow-xl transition transform active:scale-95 disabled:opacity-50 flex items-center gap-2 border border-[#F45B69]"
                >
                  <span>{loading ? '⏳ Dispatching to KARN...' : '🚀 Confirm & Dispatch to Rescue Network ➔'}</span>
                </button>
              </div>
            </div>
          )}

          {/* =========================================================================
              STEP 4: CONFIRMATION SCREEN & KARN LIVE TRACKING HANDOFF
             ========================================================================= */}
          {step === 4 && submittedDonation && (
            <div className="py-6 px-4 text-center space-y-5 animate-fadeIn">
              <div className="w-16 h-16 mx-auto rounded-full bg-[#E4FDE1] text-[#028090] flex items-center justify-center text-3xl shadow-lg border-2 border-[#028090]">
                ✓
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                  Dispatched to Kinetic Assistance & Rescue Network (KARN)
                </span>
                <h4 className="text-xl font-black text-[#114B5F]">
                  Surplus Registration Confirmed!
                </h4>
                <p className="text-xs text-slate-600 max-w-md mx-auto">
                  Your surplus has been securely registered in the SANJEEVNI decentralized network and assigned to the KARN logistics queue.
                </p>
              </div>

              {/* Reference ID Card */}
              <div className="max-w-sm mx-auto p-4 rounded-2xl bg-[#F7FEF6] border-2 border-[#028090] shadow-md space-y-2">
                <div className="text-[10px] uppercase font-bold text-slate-500">Unique Tracking & Custody ID</div>
                <div className="text-2xl font-black text-[#028090] tracking-wider font-mono">
                  {submittedDonation.referenceId}
                </div>
                <div className="flex items-center justify-center gap-3 pt-2 text-[11px] text-slate-600 border-t border-slate-200">
                  <span>Pathway: <strong className="text-[#114B5F] uppercase">{submittedDonation.pathway}</strong></span>
                  <span>•</span>
                  <span>Transport: <strong className="text-[#028090] font-black">{submittedDonation.transportMode === 'donor_paid' ? 'Donor Funded (₹' + (submittedDonation.quotedCost || 240) + ')' : (submittedDonation.transportMode === 'self_arranged' ? 'Self-Arranged' : 'Sponsored (CSR)')}</strong></span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    window.dispatchEvent(new CustomEvent('view-karn-tracking', {
                      detail: { donationId: submittedDonation.id, referenceId: submittedDonation.referenceId }
                    }));
                  }}
                  className="px-6 py-2.5 rounded-xl bg-[#028090] hover:bg-[#114B5F] text-white font-black text-xs shadow-lg transition transform active:scale-95 flex items-center gap-2"
                >
                  <span>🚴</span>
                  <span>Track KARN Pickup Live ➔</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#114B5F] font-bold text-xs transition"
                >
                  Done & Return to Feed
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* LEARN MORE MODAL FOR PATHWAY SELECTION */}
      {learnMorePathway && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2 font-black text-[#114B5F] text-sm">
                <span>{learnMorePathway === 'people' ? '🍲' : (learnMorePathway === 'animal' ? '🐾' : '🌱')}</span>
                <span>
                  {learnMorePathway === 'people' ? 'Food for People Guide' : (learnMorePathway === 'animal' ? 'Suitable Animal Feed Guide' : 'Compost & Bio-Recovery Guide')}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setLearnMorePathway(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-slate-600 leading-relaxed">
              {learnMorePathway === 'people' && (
                <>
                  <p><strong>Strictly intended for:</strong> Freshly prepared cooked food, packaged shelf-stable items, unblemished fruit and baked bread that meets human microbiological safety standards.</p>
                  <p><strong>Safety Margins:</strong> Must be kept at safe temperatures (&gt; 60°C or &lt; 5°C) and consumed within verified Safe-Until countdown windows.</p>
                </>
              )}
              {learnMorePathway === 'animal' && (
                <>
                  <p><strong>Strictly intended for:</strong> Wholesome plant residues, clean leftover roti, plain rice, and vegetable peels directed to Gaushalas and shelter animals.</p>
                  <p><strong>Prohibitions:</strong> Absolutely NO onion/garlic, chocolate, moldy/spoiled food, cooked chicken bones, or plastic wrappers.</p>
                </>
              )}
              {learnMorePathway === 'compost' && (
                <>
                  <p><strong>Strictly intended for:</strong> Plate-scrapings, expired or spoiled food, fruit rinds, coffee grounds and biological residuals.</p>
                  <p><strong>Mandatory Rule:</strong> 100% Zero-plastic segregation to enable anaerobic biomethanation and certified vermicomposting.</p>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                setSelectedPathway(learnMorePathway);
                setLearnMorePathway(null);
              }}
              className="w-full py-2.5 rounded-xl bg-[#028090] text-white font-black text-xs shadow-md"
            >
              Select This Pathway ({learnMorePathway.toUpperCase()})
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

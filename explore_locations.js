// =========================================================================
// SANJEEVNI - EXPLORE LOCATIONS & ORGANISATION NETWORK
// Interactive Leaflet OpenStreetMap Discovery + Category Filters + Registration
// =========================================================================

window.ExploreLocationsView = function ExploreLocationsView({ onOpenRegisterOrg }) {
  const [organisations, setOrganisations] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [viewMode, setViewMode] = React.useState('map'); // 'map' or 'list'
  const [selectedCategory, setSelectedCategory] = React.useState('All');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCity, setSelectedCity] = React.useState('All');
  const [selectedOrg, setSelectedOrg] = React.useState(null);
  const [userLocation, setUserLocation] = React.useState({ lat: 22.7196, lng: 75.8577, name: 'Indore Central (AITR Area)' });
  const [isLocating, setIsLocating] = React.useState(false);
  const [showRegModal, setShowRegModal] = React.useState(false);

  const mapRef = React.useRef(null);
  const mapInstance = React.useRef(null);
  const markersRef = React.useRef([]);

  // Category definitions with icons and colors
  const CATEGORIES = [
    { id: 'All', label: 'All Facilities', icon: '🌐' },
    { id: 'Food Donor', label: 'Food Donors', icon: '🏢', color: '#028090' },
    { id: 'Human Food Receiver', label: 'Human Food Receivers', icon: '🤝', color: '#114B5F' },
    { id: 'Animal Welfare Organisation', label: 'Animal Welfare', icon: '🐄', color: '#456990' },
    { id: 'Food Collection & Storage', label: 'Food Banks & Fridges', icon: '❄️', color: '#0284c7' },
    { id: 'Waste Processing Partner', label: 'Waste Recovery & Biogas', icon: '🌿', color: '#16a34a' },
    { id: 'Supporting Facility', label: 'Supporting & Testing Labs', icon: '🔬', color: '#7c3aed' }
  ];

  // Load organisations from API
  const loadData = async () => {
    setLoading(true);
    try {
      const data = await window.SanjeevniAPI.getOrganisations();
      setOrganisations(data);
      if (data.length > 0 && !selectedOrg) {
        setSelectedOrg(data[0]);
      }
    } catch (err) {
      console.error('Failed to load organisations:', err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadData();
  }, []);

  // Distance calculation helper (Haversine formula in km)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return (R * c).toFixed(1);
  };

  // Browser GPS detection
  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          name: 'Your Current GPS Location'
        };
        setUserLocation(coords);
        setIsLocating(false);
        if (mapInstance.current) {
          mapInstance.current.setView([coords.lat, coords.lng], 14);
        }
      },
      (err) => {
        alert('Could not acquire GPS coordinates: ' + err.message);
        setIsLocating(false);
      },
      { timeout: 10000 }
    );
  };

  // Filtered organisations
  const filteredOrgs = React.useMemo(() => {
    return organisations.filter(org => {
      const matchCat = selectedCategory === 'All' || org.category === selectedCategory;
      const matchCity = selectedCity === 'All' || org.city === selectedCity;
      const matchQuery = !searchQuery ||
        org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (org.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (org.address || '').toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchCity && matchQuery;
    });
  }, [organisations, selectedCategory, selectedCity, searchQuery]);

  // Cities list
  const availableCities = React.useMemo(() => {
    const set = new Set(organisations.map(o => o.city).filter(Boolean));
    return ['All', ...Array.from(set)];
  }, [organisations]);

  // Leaflet Map Initialization
  React.useEffect(() => {
    if (viewMode !== 'map') return;
    if (!window.L || !mapRef.current) return;

    if (!mapInstance.current) {
      const L = window.L;
      const map = L.map(mapRef.current, {
        center: [userLocation.lat, userLocation.lng],
        zoom: 13,
        zoomControl: true,
        scrollWheelZoom: false
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(map);

      // Prevent wheel hijacking page scroll while allowing intentional zooming
      map.on('click', () => { map.scrollWheelZoom.enable(); });
      map.on('mouseout', () => { map.scrollWheelZoom.disable(); });
      setTimeout(() => { map.invalidateSize(); }, 200);

      mapInstance.current = map;
    } else {
      setTimeout(() => { mapInstance.current?.invalidateSize(); }, 150);
    }

    // Refresh markers
    const L = window.L;
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    // Add User Location Marker
    const userMarker = L.circleMarker([userLocation.lat, userLocation.lng], {
      radius: 9,
      fillColor: '#2563eb',
      color: '#ffffff',
      weight: 3,
      fillOpacity: 0.9
    }).addTo(mapInstance.current);
    userMarker.bindPopup(`<b>📍 ${userLocation.name}</b><br>Reference search anchor`);
    markersRef.current.push(userMarker);

    // Add Organisation Markers
    filteredOrgs.forEach(org => {
      if (!org.lat || !org.lng) return;

      const catInfo = CATEGORIES.find(c => c.id === org.category) || { icon: '📍', color: '#028090' };
      const customIcon = L.divIcon({
        className: 'custom-map-icon',
        html: `
          <div style="
            background:${catInfo.color};
            color:white;
            width:34px;
            height:34px;
            border-radius:10px;
            border:2px solid white;
            box-shadow:0 3px 8px rgba(0,0,0,0.3);
            display:flex;
            align-items:center;
            justify-content:center;
            font-size:16px;
            cursor:pointer;
          ">
            ${catInfo.icon}
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 34]
      });

      const dist = calculateDistance(userLocation.lat, userLocation.lng, org.lat, org.lng);
      const marker = L.marker([org.lat, org.lng], { icon: customIcon }).addTo(mapInstance.current);

      marker.bindPopup(`
        <div style="font-family:Inter,sans-serif;padding:4px;max-width:220px;">
          <div style="font-size:10px;font-weight:700;color:${catInfo.color};text-transform:uppercase;">${org.category}</div>
          <div style="font-size:13px;font-weight:700;color:#114B5F;margin:2px 0;">${org.name}</div>
          <div style="font-size:11px;color:#64748b;">${org.address || ''}</div>
          ${dist ? `<div style="font-size:11px;font-weight:700;color:#028090;margin-top:4px;">📍 ${dist} km away</div>` : ''}
          <div style="margin-top:6px;">
            <span style="font-size:10px;padding:2px 6px;border-radius:4px;font-weight:700;background:#E4FDE1;color:#114B5F;">
              ✓ ${org.verification_status || 'Verified'}
            </span>
          </div>
        </div>
      `);

      marker.on('click', () => {
        setSelectedOrg(org);
        if (window.audio) window.audio.playChime('click');
      });

      markersRef.current.push(marker);
    });

  }, [viewMode, filteredOrgs, userLocation]);

  return (
    <div className="space-y-6">
      {/* Page Title & Action Bar */}
      <div className="p-6 rounded-3xl bg-white border border-soft-mint shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-soft-mint text-deep-emerald text-xs font-bold">
            <span>🗺️</span> Verified Organisation & Facility Network
          </div>
          <h2 className="text-2xl font-black text-midnight-pine mt-1">Explore Community Locations</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Discover verified food donors, shelters, gaushalas, food banks, and organic waste processing plants.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* View Toggle */}
          <div className="flex items-center bg-cloud-white p-1 rounded-xl border border-soft-mint">
            <button
              onClick={() => setViewMode('map')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                viewMode === 'map' ? 'bg-deep-emerald text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>🗺️</span> Map View
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                viewMode === 'list' ? 'bg-deep-emerald text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>📋</span> List View ({filteredOrgs.length})
            </button>
          </div>

          {/* GPS Button */}
          <button
            onClick={handleDetectGPS}
            disabled={isLocating}
            className="px-3.5 py-2 rounded-xl bg-cloud-white hover:bg-soft-mint text-midnight-pine border border-soft-mint font-bold text-xs transition flex items-center gap-1.5"
            title="Use my current GPS location to sort by distance"
          >
            <span>{isLocating ? '⏳' : '🎯'}</span>
            <span>{isLocating ? 'Locating...' : 'My GPS'}</span>
          </button>

          {/* Register Organisation Button */}
          <button
            onClick={() => setShowRegModal(true)}
            className="px-4 py-2 rounded-xl bg-deep-emerald hover:bg-midnight-pine text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
          >
            <span>+</span> Register New Facility
          </button>
        </div>
      </div>

      {/* Filter Chips Bar */}
      <div className="space-y-3">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                if (window.audio) window.audio.playChime('click');
              }}
              className={`px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition flex items-center gap-1.5 border ${
                selectedCategory === cat.id
                  ? 'bg-midnight-pine text-white border-midnight-pine shadow-sm'
                  : 'bg-white text-slate-700 border-soft-mint hover:bg-cloud-white'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Search & City Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by facility name, address, or service description..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-soft-mint bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#028090]"
            />
            <span className="absolute left-3 top-3 text-slate-400 text-xs">🔍</span>
          </div>

          <div className="sm:w-48">
            <select
              value={selectedCity}
              onChange={e => setSelectedCity(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-soft-mint bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#028090]"
            >
              {availableCities.map(city => (
                <option key={city} value={city}>
                  {city === 'All' ? 'All Districts / Cities' : city}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* VIEW: MAP VIEW */}
      {viewMode === 'map' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Interactive Leaflet Map */}
          <div className="lg:col-span-2 rounded-3xl overflow-hidden border border-soft-mint shadow-sm relative bg-cloud-white" style={{ height: '550px' }}>
            <div ref={mapRef} className="w-full h-full" style={{ height: '100%', minHeight: '550px', width: '100%' }} />
            <div className="absolute top-3 right-3 z-[1000] bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-xl shadow-md border border-soft-mint text-[11px] font-semibold text-midnight-pine">
              Showing {filteredOrgs.length} locations
            </div>
          </div>

          {/* Selected Facility Details Card */}
          <div className="rounded-3xl bg-white border border-soft-mint p-6 shadow-sm space-y-4">
            {selectedOrg ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-deep-emerald px-2.5 py-0.5 rounded-full bg-soft-mint">
                    {selectedOrg.category}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    selectedOrg.verification_status === 'Verified' ? 'bg-soft-mint text-deep-emerald' : 'bg-amber-100 text-amber-800'
                  }`}>
                    ✓ {selectedOrg.verification_status || 'Verified Partner'}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-black text-midnight-pine">{selectedOrg.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{selectedOrg.description}</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-cloud-white border border-soft-mint space-y-2 text-xs">
                  <div className="flex items-start gap-2">
                    <span className="text-slate-400">📍</span>
                    <span className="text-slate-700 font-medium">
                      {selectedOrg.address}, {selectedOrg.city} - {selectedOrg.pincode}
                    </span>
                  </div>

                  {selectedOrg.lat && selectedOrg.lng && (
                    <div className="flex items-center gap-2">
                      <span className="text-deep-emerald font-bold">📏 Distance:</span>
                      <span className="font-bold text-midnight-pine">
                        {calculateDistance(userLocation.lat, userLocation.lng, selectedOrg.lat, selectedOrg.lng)} km
                      </span>
                      <span className="text-[10px] text-slate-400">from {userLocation.name}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">🕒</span>
                    <span className="text-slate-600">Hours: <strong>{selectedOrg.operating_hours || '08:00 - 22:00'}</strong></span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">📞</span>
                    <span className="text-slate-700 font-bold">{selectedOrg.phone || 'Available for verified inquiries'}</span>
                  </div>

                  {selectedOrg.contact_person && (
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">👤</span>
                      <span className="text-slate-600">Contact: {selectedOrg.contact_person}</span>
                    </div>
                  )}

                  {selectedOrg.facilities && (
                    <div className="pt-1 border-t border-soft-mint text-[11px] text-slate-600">
                      <strong>Facilities:</strong> {selectedOrg.facilities}
                    </div>
                  )}
                </div>

                {/* Directions Action Link */}
                <div className="pt-2 flex flex-col gap-2">
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${selectedOrg.lat},${selectedOrg.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 rounded-xl bg-deep-emerald hover:bg-midnight-pine text-white font-bold text-xs text-center shadow-md transition flex items-center justify-center gap-1.5"
                  >
                    <span>🧭</span> Open Navigation Directions ➔
                  </a>

                  <p className="text-[10px] text-slate-400 text-center leading-normal">
                    * Listed organisations confirm donation availability on a per-batch basis.
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 text-xs">
                Select an organisation marker on the map to inspect full facility details.
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW: LIST VIEW */}
      {viewMode === 'list' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOrgs.map(org => {
            const dist = calculateDistance(userLocation.lat, userLocation.lng, org.lat, org.lng);
            return (
              <div
                key={org.id}
                className="p-5 rounded-2xl bg-white border border-soft-mint hover:border-impact-green shadow-sm flex flex-col justify-between space-y-3 transition"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold text-deep-emerald text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-soft-mint">
                      {org.category}
                    </span>
                    <span className="text-[10px] font-bold text-impact-green">
                      ✓ {org.verification_status || 'Verified'}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-midnight-pine">{org.name}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2">{org.description}</p>

                  <div className="text-xs text-slate-600 space-y-1 pt-1">
                    <div>📍 {org.address}, {org.city}</div>
                    {dist && (
                      <div className="text-deep-emerald font-bold">
                        📏 {dist} km from current location
                      </div>
                    )}
                    <div>🕒 {org.operating_hours || '09:00 - 21:00'}</div>
                  </div>
                </div>

                <div className="pt-2 border-t border-soft-mint flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">📞 {org.phone}</span>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${org.lat},${org.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-deep-emerald hover:bg-midnight-pine text-white text-[11px] font-bold transition"
                  >
                    Directions ➔
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* REGISTRATION MODAL (5.2 SPEC) */}
      {showRegModal && (
        <OrganisationRegistrationModal
          onClose={() => setShowRegModal(false)}
          onSuccess={() => {
            setShowRegModal(false);
            loadData();
          }}
        />
      )}
    </div>
  );
};

// Sub-component: Organisation Registration Form Modal
function OrganisationRegistrationModal({ onClose, onSuccess }) {
  const [formData, setFormData] = React.useState({
    name: '',
    category: 'Food Donor',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    city: 'Indore',
    district: 'Indore',
    state: 'Madhya Pradesh',
    pincode: '452001',
    lat: 22.7196,
    lng: 75.8577,
    description: '',
    operatingHours: '08:00 - 22:00',
    facilities: ''
  });
  const [loading, setLoading] = React.useState(false);
  const [gpsLoading, setGpsLoading] = React.useState(false);

  const handleGPS = () => {
    if (!navigator.geolocation) return alert('GPS not supported');
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData(prev => ({
          ...prev,
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        }));
        setGpsLoading(false);
      },
      () => {
        alert('Could not retrieve GPS coordinates');
        setGpsLoading(false);
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      alert('Please fill organisation name and phone');
      return;
    }
    setLoading(true);
    try {
      await window.SanjeevniAPI.registerOrganisation(formData);
      if (window.audio) window.audio.playChime('success');
      alert('Organisation registration submitted successfully! Status set to Pending review.');
      onSuccess();
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-midnight-pine/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-deep-emerald/20 overflow-hidden">
        <div className="bg-gradient-to-r from-midnight-pine to-deep-emerald p-5 text-white flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold tracking-wider uppercase text-soft-mint">Facility Intake</span>
            <h3 className="text-lg font-bold">Register Organisation on Network</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Organisation / Facility Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Malwa Organic Composting Hub"
              className="w-full px-3 py-2 rounded-xl border border-slate-300"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Category (5.1 Spec)</label>
              <select
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
              >
                <option value="Food Donor">A. Food Donor</option>
                <option value="Human Food Receiver">B. Human Food Receiver</option>
                <option value="Animal Welfare Organisation">C. Animal Welfare (Gaushala)</option>
                <option value="Food Collection & Storage">D. Food Collection & Storage</option>
                <option value="Waste Processing Partner">E. Waste Recovery & Biogas</option>
                <option value="Supporting Facility">F. Supporting Facility</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Contact Person</label>
              <input
                type="text"
                value={formData.contactPerson}
                onChange={e => setFormData({ ...formData, contactPerson: e.target.value })}
                placeholder="Full name & title"
                className="w-full px-3 py-2 rounded-xl border border-slate-300"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98765 00000"
                className="w-full px-3 py-2 rounded-xl border border-slate-300"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Official Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                placeholder="contact@org.in"
                className="w-full px-3 py-2 rounded-xl border border-slate-300"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Physical Address</label>
            <input
              type="text"
              required
              value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
              placeholder="Street, Landmark, Sector"
              className="w-full px-3 py-2 rounded-xl border border-slate-300"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block font-bold text-slate-700 mb-1">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={e => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-300"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">District</label>
              <input
                type="text"
                value={formData.district}
                onChange={e => setFormData({ ...formData, district: e.target.value })}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-300"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">PIN Code</label>
              <input
                type="text"
                value={formData.pincode}
                onChange={e => setFormData({ ...formData, pincode: e.target.value })}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-300"
              />
            </div>
          </div>

          {/* Location Selection Method (5.3 Spec) */}
          <div className="p-3.5 rounded-2xl bg-cloud-white border border-soft-mint space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700">GPS Coordinates (5.3 Selection)</span>
              <button
                type="button"
                onClick={handleGPS}
                disabled={gpsLoading}
                className="px-2.5 py-1 rounded bg-deep-emerald text-white text-[11px] font-bold"
              >
                {gpsLoading ? 'Acquiring...' : '📍 Auto-Detect Device GPS'}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[10px] text-slate-500">Latitude:</span>
                <input
                  type="number"
                  step="0.0001"
                  value={formData.lat}
                  onChange={e => setFormData({ ...formData, lat: parseFloat(e.target.value) })}
                  className="w-full px-2 py-1 rounded border border-slate-300 bg-white"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-500">Longitude:</span>
                <input
                  type="number"
                  step="0.0001"
                  value={formData.lng}
                  onChange={e => setFormData({ ...formData, lng: parseFloat(e.target.value) })}
                  className="w-full px-2 py-1 rounded border border-slate-300 bg-white"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Available Facilities & Equipment</label>
            <input
              type="text"
              value={formData.facilities}
              onChange={e => setFormData({ ...formData, facilities: e.target.value })}
              placeholder="e.g. Cold storage, Bain-marie, Reusable transport crates"
              className="w-full px-3 py-2 rounded-xl border border-slate-300"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Brief Description of Services</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe capacity, operational scope, and mission..."
              className="w-full px-3 py-2 rounded-xl border border-slate-300"
            />
          </div>

          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 leading-normal">
            ℹ️ <strong>Verification Protocol:</strong> Submitted listings enter <em>Pending</em> status. Our municipal team verifies phone, location coordinates, and service capacity before granting <em>Verified</em> status.
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-deep-emerald hover:bg-midnight-pine text-white font-bold shadow-md"
            >
              {loading ? 'Submitting...' : 'Submit for Verification ➔'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

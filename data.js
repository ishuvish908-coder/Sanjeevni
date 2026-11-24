// =========================================================================
// SANJEEVNI EXTENDED DATA & STATE ENGINE (13 NEW MODULES)
// =========================================================================

// --- FEATURE 1: OVERPRODUCTION INSIGHTS DATA ---
window.HISTORICAL_OVERPRODUCTION_DATA = [
  { day: 'Monday', cookedPlates: 450, surplusPlates: 28, surplusPct: 6.2, reason: 'Regular mess attendance' },
  { day: 'Tuesday', cookedPlates: 460, surplusPlates: 32, surplusPct: 6.9, reason: 'Mid-week stable' },
  { day: 'Wednesday', cookedPlates: 480, surplusPlates: 45, surplusPct: 9.3, reason: 'Special sweet dish prepared' },
  { day: 'Thursday', cookedPlates: 450, surplusPlates: 30, surplusPct: 6.6, reason: 'Regular routine' },
  { day: 'Friday', cookedPlates: 470, surplusPlates: 58, surplusPct: 12.3, reason: 'Students dining out' },
  { day: 'Saturday', cookedPlates: 420, surplusPlates: 64, surplusPct: 15.2, reason: 'Weekend departures' },
  { day: 'Sunday', cookedPlates: 500, surplusPlates: 92, surplusPct: 18.4, reason: 'High weekend outings & late brunch' }
];

window.OVERPRODUCTION_RECOMMENDATIONS = [
  {
    id: 'REC-1',
    facility: 'Kaveri Hostel Mess',
    finding: 'Sunday Dinner consistently generates 18.4% surplus over the last 6 weeks.',
    action: 'Reduce Sunday dinner rice & dal batch size by 15% (~75 plates).',
    monthlySavings: '₹14,500 / month saved in unpurchased raw staples',
    applied: false
  },
  {
    id: 'REC-2',
    facility: 'Royal Orchid Banquet Hall',
    finding: 'Post-wedding dessert trays have a 28% leftover rate on Friday events.',
    action: 'Adopt a staged dessert buffet replenishment cycle (fill half-trays post 10 PM).',
    monthlySavings: '₹22,800 / month saved in dairy & dry fruit ingredients',
    applied: false
  },
  {
    id: 'REC-3',
    facility: 'TechPark Cyber Canteen',
    finding: 'Friday late-afternoon snacks experience 22% overproduction due to hybrid work-from-home.',
    action: 'Switch to on-demand snack frying post 4 PM on Fridays.',
    monthlySavings: '₹8,200 / month in cooking oil and LPG fuel saved',
    applied: true
  }
];

// --- FEATURE 2: PRE-EVENT PLEDGES ---
window.INITIAL_PLEDGES = [
  {
    id: 'PLG-201',
    donorName: 'Grand Hyatt Convention Hall',
    donorType: 'Wedding / Banquet',
    eventName: 'Mehta-Sharma Wedding Reception',
    expectedDate: 'Tonight, 11:00 PM',
    expectedPlates: 160,
    foodCategory: 'Cooked Meals',
    foodDetails: 'Paneer Butter Masala, Dal Makhani, Pulao, Butter Naan',
    dietary: 'Pure Veg (Jain Options Available)',
    status: 'Upcoming', // Upcoming, Reserved, Confirmed, Completed, Cancelled
    reservedBy: null,
    notes: 'Buffet ends at 10:30 PM. Containers will be packed by catering staff.'
  },
  {
    id: 'PLG-202',
    donorName: 'Global Tech Summit 2026',
    donorType: 'Corporate Conference',
    eventName: 'Annual Developer Conclave Lunch',
    expectedDate: 'Tomorrow, 2:30 PM',
    expectedPlates: 90,
    foodCategory: 'Cooked Meals',
    foodDetails: 'Assorted Lunch Boxes (Veg & Non-Veg Sandwiches, Fruit Bowls, Pasta)',
    dietary: 'Mixed (Individual sealed boxes)',
    status: 'Reserved',
    reservedBy: 'Robin Hood Army - Central Hub',
    notes: 'Pickup from Gate 3 loading dock. Insulated van needed.'
  },
  {
    id: 'PLG-203',
    donorName: 'Kaveri Hostel Mess',
    donorType: 'Campus Mess',
    eventName: 'Campus Alumni Dinner',
    expectedDate: 'Tonight, 10:15 PM',
    expectedPlates: 70,
    foodCategory: 'Cooked Meals',
    foodDetails: 'Jeera Rice, Chana Masala, Mixed Veg Sabzi',
    dietary: 'Pure Veg',
    status: 'Confirmed',
    reservedBy: 'Akshaya Food Shelter',
    notes: 'Hot-held in commercial dispensers.'
  }
];

// --- FEATURE 3: DABBA BANK (REUSABLE CONTAINER MANAGEMENT) ---
window.INITIAL_DABBAS = [
  { id: 'DB-101', type: '50L Insulated Stainless Steel Drum', status: 'In Use (Transit)', holder: 'Volunteer Rajesh Kumar', destination: 'Akshaya Food Shelter', returnDue: 'Today 22:30', cycles: 42 },
  { id: 'DB-102', type: '30L Food-Grade Thermal Crate', status: 'Available at Hub', holder: 'Central Hub Stock', destination: '-', returnDue: '-', cycles: 65 },
  { id: 'DB-103', type: '30L Food-Grade Thermal Crate', status: 'Available at Hub', holder: 'Central Hub Stock', destination: '-', returnDue: '-', cycles: 58 },
  { id: 'DB-104', type: '15L Gastronorm Pan with Locking Lid', status: 'Delivered to NGO', holder: 'Hope Children Home', destination: 'Hope Children Home', returnDue: 'Tomorrow 10:00', cycles: 31 },
  { id: 'DB-105', type: '15L Gastronorm Pan with Locking Lid', status: 'Overdue for Return', holder: 'Spice Route Bistro', destination: 'Spice Route Bistro', returnDue: 'Yesterday 21:00', cycles: 29 },
  { id: 'DB-106', type: '50L Insulated Stainless Steel Drum', status: 'Returned & Sanitized', holder: 'Central Hub Stock', destination: '-', returnDue: '-', cycles: 84 }
];

// --- FEATURE 4: DIGITAL FOOD QUALITY CHECKLIST ITEMS ---
window.QUALITY_CHECKLIST_TEMPLATE = [
  { id: 'q_visual', label: 'Visual Check', desc: 'No discoloration, mold, or foreign particles', mandatory: true },
  { id: 'q_smell', label: 'Olfactory / Smell Check', desc: 'Natural freshly cooked aroma; no sour or rancid odor', mandatory: true },
  { id: 'q_temp', label: 'Temperature Verification', desc: 'Hot-held (≥60°C), Chilled (≤5°C), or Safe Ambient', mandatory: true },
  { id: 'q_pack', label: 'Packaging Integrity', desc: 'Sealed food-grade containers with zero leakages', mandatory: true },
  { id: 'q_photo', label: 'Visual Proof Attached', desc: 'Verified photo taken on-site at handover', mandatory: true }
];

window.INSPECTION_LOGS = [
  { id: 'INS-801', donationId: 'DON-101', volunteer: 'Rajesh Kumar', tempC: 68.4, status: 'PASSED', timestamp: '20:18', notes: 'Piping hot, sealed food drums, fresh aroma.' },
  { id: 'INS-802', donationId: 'DON-102', volunteer: 'Priya Sharma', tempC: 31.2, status: 'PASSED WITH CAUTION', timestamp: '19:45', notes: 'Room temp. Recommended urgent distribution within 40 min.' },
  { id: 'INS-799', donationId: 'DON-098', volunteer: 'Vikram Singh', tempC: 28.0, status: 'FAILED_HUMAN_TIER', timestamp: 'Yesterday', notes: 'Slight sour odor detected in coconut gravy. Stepped down to Tier 3 Compost.' }
];

// --- FEATURE 5: TWO-WAY RATINGS ---
window.INITIAL_RATINGS = [
  { id: 'RAT-1', fromRole: 'NGO', fromName: 'Akshaya Food Shelter', toRole: 'Donor', toName: 'Kaveri Hostel Mess', rating: 5, tags: ['Fresh & Steaming', 'Hygiene Packaging'], comment: 'Food was delicious and warm. Served 120 residents happily.', date: 'Today' },
  { id: 'RAT-2', fromRole: 'Donor', fromName: 'Royal Orchid Banquet', toRole: 'Volunteer', toName: 'Amit Patel', rating: 5, tags: ['Punctual', 'Handled with Care'], comment: 'Arrived within 15 minutes with clean crates.', date: 'Yesterday' },
  { id: 'RAT-3', fromRole: 'NGO', fromName: 'Hope Children Home', toRole: 'Volunteer', toName: 'Priya Sharma', rating: 5, tags: ['Super Polite', 'Kids Loved It'], comment: 'Fast delivery with thermal insulation bag.', date: '2 days ago' }
];

// --- FEATURE 6: ALLERGENS MASTER LIST ---
window.ALLERGEN_OPTIONS = [
  { key: 'nuts', label: 'Contains Peanuts / Tree Nuts', icon: '🥜' },
  { key: 'dairy', label: 'Contains Dairy / Lactose', icon: '🥛' },
  { key: 'gluten', label: 'Contains Gluten / Wheat', icon: '🌾' },
  { key: 'eggs', label: 'Contains Eggs', icon: '🥚' },
  { key: 'soy', label: 'Contains Soy / Legumes', icon: '🫘' },
  { key: 'unknown', label: 'Unknown / Unverified Ingredients (Flagged)', icon: '⚠️' }
];

// --- FEATURE 10: VOLUNTEER KARMA GAMIFICATION & BADGES ---
window.VOLUNTEER_PROFILES = [
  {
    id: 'V1',
    name: 'Rajesh Kumar',
    vehicle: 'Motorcycle (Insulated Bag)',
    phone: '+91 98111 00101',
    hoursVerified: 38.5,
    karmaPoints: 1240,
    level: 'Gold Guardian',
    streakDays: 6,
    mealsRescued: 480,
    containersReturned: 24,
    badges: [
      { id: 'b1', name: 'Annadaan Hero', icon: '🎖️', desc: 'Rescued > 400 meals' },
      { id: 'b2', name: 'Food Saver', icon: '🛡️', desc: '100% On-time deliveries' },
      { id: 'b3', name: 'Zero Waste Warrior', icon: '🌿', desc: 'Returned 20+ Dabbas' },
      { id: 'b4', name: 'Rapid Responder', icon: '⚡', desc: 'Pickup in under 15 mins' }
    ]
  },
  {
    id: 'V2',
    name: 'Priya Sharma',
    vehicle: 'EV Scooter',
    phone: '+91 98111 00202',
    hoursVerified: 45.0,
    karmaPoints: 1480,
    level: 'Diamond Annadata',
    streakDays: 12,
    mealsRescued: 620,
    containersReturned: 35,
    badges: [
      { id: 'b1', name: 'Annadaan Hero', icon: '🎖️', desc: 'Rescued > 400 meals' },
      { id: 'b3', name: 'Zero Waste Warrior', icon: '🌿', desc: 'Returned 20+ Dabbas' },
      { id: 'b5', name: 'Community Champion', icon: '🤝', desc: 'Served 5+ distinct shelters' }
    ]
  }
];

// --- FEATURE 11: CRISIS AND EMERGENCY RELIEF MODE ---
window.INITIAL_CRISIS_STATE = {
  isActive: false,
  crisisName: 'Sector 3 Urban Cloudburst & Waterlogging Relief',
  declaredAt: '23-Nov-2026',
  reliefCamps: [
    { id: 'CAMP-A', name: 'Govt Model School Relief Camp Alpha', targetMeals: 400, fulfilledMeals: 210, location: 'Sector 3 Community Hall' },
    { id: 'CAMP-B', name: 'Red Cross Flood Shelter Beta', targetMeals: 350, fulfilledMeals: 140, location: 'Stadium Indoor Complex' }
  ]
};

// --- FEATURE 12: BEYOND COOKED FOOD CATEGORIES ---
window.SURPLUS_CATEGORIES = {
  'Cooked Meals': {
    baselineHours: 3.5,
    unitLabel: 'plates',
    reqFields: ['Cooking Time', 'Temperature Condition'],
    desc: 'Hot or chilled freshly cooked dishes from messes, banquets & restaurants'
  },
  'Bakery Leftovers': {
    baselineHours: 36.0,
    unitLabel: 'kg / loaves',
    reqFields: ['Baking Date', 'Packaging Type'],
    desc: 'Unsold day-end breads, buns, croissants, dry cakes'
  },
  'Near-Expiry Packaged Food': {
    baselineHours: 72.0,
    unitLabel: 'sealed packets',
    reqFields: ['Best Before Date', 'FSSAI Batch No'],
    desc: 'Biscuits, packaged milk tetra packs, cereal boxes within safe consumption'
  },
  'Fresh Fruits & Vegetables': {
    baselineHours: 96.0,
    unitLabel: 'crates / kg',
    reqFields: ['Harvest / Inward Date', 'Grade'],
    desc: 'Surplus seasonal produce from supermarkets, canteens, wholesale distributors'
  },
  'Surplus Agricultural Produce': {
    baselineHours: 120.0,
    unitLabel: 'quintals / kg',
    reqFields: ['Farm Origin', 'Crop Type'],
    desc: 'Direct harvest glut from peri-urban farmers, distributed to community langars'
  },
  'Mandi-Rejected Produce': {
    baselineHours: 48.0,
    unitLabel: 'crates',
    reqFields: ['Cosmetic Imperfection Type', 'Sorting Status'],
    desc: 'Edible grade-B produce rejected purely for size/shape, ideal for curry & soup bases'
  }
};

// --- FEATURE 13: CITY FOOD WASTE HOTSPOT ANALYTICS ---
window.CITY_HOTSPOT_METRICS = {
  totalRescuedKg: 14850,
  landfillMethaneDivertedTonnes: 16.3,
  peakWasteHours: [
    { timeWindow: '13:30 - 15:00', label: 'Lunch Buffet Spikes', pct: 38 },
    { timeWindow: '21:30 - 23:30', label: 'Wedding & Dinner Rush', pct: 54 },
    { timeWindow: '08:00 - 09:30', label: 'Breakfast Overhang', pct: 8 }
  ],
  hotspotZones: [
    { zone: 'Sector 2 (University & Mess Cluster)', surplusMonthlyPlates: 6400, riskLevel: 'High', primaryCause: 'Unpredictable student weekend dinner attendance' },
    { zone: 'Sector 7 (Banquet & Event Belt)', surplusMonthlyPlates: 9800, riskLevel: 'Critical', primaryCause: 'Excess wedding buffet safety buffers' },
    { zone: 'Indiranagar Commercial Market', surplusMonthlyPlates: 4200, riskLevel: 'Medium', primaryCause: 'Fast food & cafe day-end excess' },
    { zone: 'Electronic City TechPark Hub', surplusMonthlyPlates: 5100, riskLevel: 'Medium', primaryCause: 'Corporate Friday hybrid work variances' }
  ]
};

// Fallback sample organisations across all 6 categories
window.SAMPLE_ORGANISATIONS = [
  { id: 'ORG-D1', name: 'Kaveri Hostel Mess', category: 'Food Donor', contact_person: 'Suresh Patel (Mess Supervisor)', phone: '+91 98765 00001', email: 'kaveri.mess@campus.edu', address: 'Campus Sector 2, North Block', city: 'Indore', district: 'Indore', state: 'Madhya Pradesh', pincode: '452010', lat: 22.7256, lng: 75.8637, description: 'College student mess serving 450+ meals per batch. Prepares fresh daily meals.', operating_hours: '07:00 - 22:30', facilities: 'Commercial Bain-Marie, Cold Chiller', verification_status: 'Verified' },
  { id: 'ORG-D2', name: 'Royal Orchid Banquet Hall', category: 'Food Donor', contact_person: 'Dinesh Sharma (Catering Lead)', phone: '+91 98765 00002', email: 'events@royalorchid.in', address: 'Outer Ring Rd, Event Zone', city: 'Indore', district: 'Indore', state: 'Madhya Pradesh', pincode: '452016', lat: 22.7116, lng: 75.8827, description: 'Premium wedding and corporate convention banquet accommodating up to 1,500 guests.', operating_hours: '10:00 - 01:00', facilities: 'Walk-in Chiller, Food Warming Cabinets', verification_status: 'Verified' },
  { id: 'ORG-D3', name: 'Spice Route Bistro', category: 'Food Donor', contact_person: 'Rahul Verma (Manager)', phone: '+91 98765 00003', email: 'gm@spiceroute.com', address: 'Indiranagar 100ft Road', city: 'Indore', district: 'Indore', state: 'Madhya Pradesh', pincode: '452001', lat: 22.7196, lng: 75.8477, description: 'Specialty restaurant committed to zero edible landfill waste.', operating_hours: '11:30 - 23:30', facilities: 'Deep Freeze, Foil Sealing', verification_status: 'Verified' },
  { id: 'ORG-D4', name: 'TechPark Cyber Canteen', category: 'Food Donor', contact_person: 'Amit Joshi', phone: '+91 98765 00004', email: 'canteen@techpark.indore.in', address: 'Phase 1 Food Court, Super Corridor', city: 'Indore', district: 'Indore', state: 'Madhya Pradesh', pincode: '452005', lat: 22.7306, lng: 75.8377, description: 'Multi-vendor corporate food court serving 2,000+ IT professionals daily.', operating_hours: '08:00 - 21:00', facilities: 'Blast Chiller, Loading Dock', verification_status: 'Verified' },
  { id: 'ORG-R1', name: 'Akshaya Food Shelter', category: 'Human Food Receiver', contact_person: 'Meena Sen (Coordinator)', phone: '+91 98765 11001', email: 'contact@akshayashelter.org', address: 'Sector 4 Shelter Ground, Bapat Chauraha', city: 'Indore', district: 'Indore', state: 'Madhya Pradesh', pincode: '452010', lat: 22.7216, lng: 75.8617, description: 'Night shelter providing hygienic dinner for 120 daily wage workers and urban homeless.', operating_hours: '18:00 - 23:00', facilities: 'Stainless Steel Dining, Holding Tanks', verification_status: 'Verified' },
  { id: 'ORG-R2', name: 'Robin Hood Army - Indore', category: 'Human Food Receiver', contact_person: 'Arjun Saxena (City Lead)', phone: '+91 98765 22002', email: 'indore@robinhoodarmy.com', address: 'Navlakha Transport Hub', city: 'Indore', district: 'Indore', state: 'Madhya Pradesh', pincode: '452001', lat: 22.7176, lng: 75.8557, description: 'Volunteer network redistributing surplus food across 3 slum settlements.', operating_hours: '19:00 - 23:30', facilities: 'Volunteer Motorbike Fleet', verification_status: 'Verified' },
  { id: 'ORG-R3', name: 'Anand Senior Citizen Home', category: 'Human Food Receiver', contact_person: 'Dr. V. K. Trivedi', phone: '+91 98765 33003', email: 'care@anandseniors.org', address: 'Old Palasia Residential Zone', city: 'Indore', district: 'Indore', state: 'Madhya Pradesh', pincode: '452001', lat: 22.7276, lng: 75.8507, description: 'Assisted living home for 50 senior citizens requiring soft, mild meals.', operating_hours: '07:30 - 21:00', facilities: 'Steam Warming Bain-Marie', verification_status: 'Verified' },
  { id: 'ORG-R4', name: 'Hope Children Home', category: 'Human Food Receiver', contact_person: 'Sister Teresa Joseph', phone: '+91 98765 44004', email: 'hope.indore@childwelfare.org', address: 'Scheme 54, Near Vijay Nagar', city: 'Indore', district: 'Indore', state: 'Madhya Pradesh', pincode: '452010', lat: 22.7136, lng: 75.8697, description: 'Residential home caring for 65 children aged 5 to 17.', operating_hours: '06:30 - 21:30', facilities: 'Dedicated Clean Kitchenette', verification_status: 'Verified' },
  { id: 'ORG-R5', name: 'Seva Community Kitchen', category: 'Human Food Receiver', contact_person: 'Harpreet Singh', phone: '+91 98765 55005', email: 'seva.langar@gurudwaraindore.org', address: 'Near MY Hospital, Chhawani', city: 'Indore', district: 'Indore', state: 'Madhya Pradesh', pincode: '452001', lat: 22.7246, lng: 75.8437, description: 'Free meal counter serving patients and attendants visiting the government hospital.', operating_hours: 'Open 24 Hours', facilities: 'Cauldrons, Industrial Chapati Press', verification_status: 'Verified' },
  { id: 'ORG-A1', name: 'Karuna Gaushala & Stray Haven', category: 'Animal Welfare Organisation', contact_person: 'Pandit R. K. Shastri', phone: '+91 98765 66006', email: 'karuna.gaushala@indore.org', address: 'Khandwa Road Bypass', city: 'Indore', district: 'Indore', state: 'Madhya Pradesh', pincode: '452020', lat: 22.7066, lng: 75.8767, description: 'Sanctuary caring for 320 cattle and 140 stray dogs. Accepts verified vegetarian grains and produce.', operating_hours: '06:00 - 19:00', facilities: 'Fodder Troughs, Chopping Unit', verification_status: 'Verified' },
  { id: 'ORG-S1', name: 'Indore Community Refrigerator', category: 'Food Collection & Storage', contact_person: 'Deepak Chouhan', phone: '+91 98765 77100', email: 'fridge.hub@sanjeevni.org', address: 'Palasia Square Civic Garden', city: 'Indore', district: 'Indore', state: 'Madhya Pradesh', pincode: '452001', lat: 22.7220, lng: 75.8520, description: 'Public cold storage cabinet with solar backup, monitored by volunteer caretakers.', operating_hours: '08:00 - 22:00', facilities: 'Solar Cold Storage, CCTV', verification_status: 'Verified' },
  { id: 'ORG-W1', name: 'GreenEarth Biomethanation Plant', category: 'Waste Processing Partner', contact_person: 'Er. Naveen Kothari', phone: '+91 98765 77007', email: 'biogas.operations@greenearthindore.gov.in', address: 'Devguradia Municipal Processing Corridor', city: 'Indore', district: 'Indore', state: 'Madhya Pradesh', pincode: '452016', lat: 22.7326, lng: 75.8877, description: 'Central anaerobic digestion plant converting organic food residues into biogas electricity and grade-A biofertilizer.', operating_hours: '07:00 - 20:00', facilities: '50 TPD Anaerobic Digesters, Vermicompost Beds', verification_status: 'Verified' },
  { id: 'ORG-F1', name: 'Indore Volunteer & Food Lab', category: 'Supporting Facility', contact_person: 'Sunita Rao', phone: '+91 98765 88008', email: 'qc.hub@sanjeevni.org', address: 'AITR Innovation Wing, Manglia', city: 'Indore', district: 'Indore', state: 'Madhya Pradesh', pincode: '453771', lat: 22.7196, lng: 75.8577, description: 'Food safety testing point training volunteers in FSSAI hygiene standards.', operating_hours: '09:00 - 18:00', facilities: 'Microbial Test Kits, Probes', verification_status: 'Verified' }
];

// Fallback sample waste listings
window.SAMPLE_WASTE_LISTINGS = [
  { id: 'WST-301', source_org_id: 'ORG-D1', source_name: 'Kaveri Hostel Mess', category: 'Vegetable peels & kitchen trimmings', material_description: 'Uncooked vegetable trimmings, potato peels, carrot tops, cabbage leaves', quantity_kg: 45.0, waste_condition: 'Fresh Raw Scraps', pickup_location: 'Campus Sector 2 Mess Backdock', lat: 22.7256, lng: 75.8637, packaging_separated: 1, recovery_pathway: 'Pathway B: Suitable Animal Feed', target_partner_id: 'ORG-A1', status: 'Accepted', processing_outcome: 'Scheduled for morning cattle feed supplement' },
  { id: 'WST-302', source_org_id: 'ORG-D2', source_name: 'Royal Orchid Banquet Hall', category: 'Over-fermented cooked gravies & buffet trimmings', material_description: 'Post-event food trimmings and buffet plate scrape-offs', quantity_kg: 110.0, waste_condition: 'Biodegradable Organic Residue', pickup_location: 'Banquet Service Gate 3', lat: 22.7116, lng: 75.8827, packaging_separated: 1, recovery_pathway: 'Pathway C: Composting & Organic Recovery', target_partner_id: 'ORG-W1', status: 'Processed', processing_outcome: 'Digested into 24 kWh biogas electricity & 35 kg grade-A bio-fertilizer' },
  { id: 'WST-303', source_org_id: 'ORG-D4', source_name: 'TechPark Cyber Canteen', category: 'Spent tea leaves & coffee grounds', material_description: 'High-nitrogen coffee grounds and black tea leaves from beverage stations', quantity_kg: 30.0, waste_condition: 'Clean Organic Residual', pickup_location: 'Cyber Canteen Beverage Dock', lat: 22.7306, lng: 75.8377, packaging_separated: 1, recovery_pathway: 'Pathway C: Composting & Organic Recovery', target_partner_id: 'ORG-W1', status: 'Registered', processing_outcome: 'Pending vermicomposting bed routing' }
];


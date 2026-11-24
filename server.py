import http.server
import socketserver
import os
import sys
import json
import sqlite3
import urllib.parse
from datetime import datetime, timedelta

PORT = 5173
DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "sanjeevni.db")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL,
        phone TEXT,
        organisation_id TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS organisations (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        contact_person TEXT,
        phone TEXT,
        email TEXT,
        address TEXT,
        city TEXT,
        district TEXT,
        state TEXT,
        pincode TEXT,
        lat REAL,
        lng REAL,
        description TEXT,
        operating_hours TEXT,
        facilities TEXT,
        photos_json TEXT,
        verification_status TEXT DEFAULT 'Pending',
        verified_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS donations (
        id TEXT PRIMARY KEY,
        donor_id TEXT,
        donor_name TEXT,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        quantity REAL,
        unit TEXT DEFAULT 'plates',
        veg_type TEXT DEFAULT 'Veg',
        cooked_minutes_ago INTEGER DEFAULT 30,
        prep_time TEXT,
        expiry_time TEXT,
        storage TEXT DEFAULT 'Room Temp',
        address TEXT,
        lat REAL,
        lng REAL,
        dietary_tags_json TEXT,
        allergens_json TEXT,
        status TEXT DEFAULT 'Available',
        assigned_receiver_id TEXT,
        assigned_volunteer_id TEXT,
        volunteer_simulated_near TEXT DEFAULT 'far',
        custody_log_json TEXT,
        safety_checks_json TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS donation_allocations (
        id TEXT PRIMARY KEY,
        donation_id TEXT NOT NULL,
        receiver_id TEXT NOT NULL,
        allocated_quantity REAL NOT NULL,
        status TEXT DEFAULT 'Reserved',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS waste_listings (
        id TEXT PRIMARY KEY,
        source_org_id TEXT,
        source_name TEXT NOT NULL,
        category TEXT NOT NULL,
        material_description TEXT NOT NULL,
        quantity_kg REAL NOT NULL,
        waste_condition TEXT,
        pickup_location TEXT,
        lat REAL,
        lng REAL,
        packaging_separated INTEGER DEFAULT 1,
        recovery_pathway TEXT NOT NULL,
        target_partner_id TEXT,
        status TEXT DEFAULT 'Registered',
        processing_outcome TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS volunteer_tasks (
        id TEXT PRIMARY KEY,
        donation_id TEXT,
        waste_id TEXT,
        volunteer_id TEXT,
        volunteer_name TEXT,
        task_type TEXT DEFAULT 'Food Rescue',
        pickup_address TEXT,
        delivery_address TEXT,
        status TEXT DEFAULT 'Available',
        hours_spent REAL DEFAULT 0,
        verified INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS dabba_containers (
        id TEXT PRIMARY KEY,
        qr_code TEXT,
        current_holder_id TEXT,
        holder_name TEXT,
        status TEXT DEFAULT 'In Stock',
        reuse_count INTEGER DEFAULT 0,
        condition TEXT DEFAULT 'Clean & Sanitized',
        last_inspected TEXT,
        history_json TEXT
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS crisis_state (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        is_active INTEGER DEFAULT 0,
        title TEXT,
        disaster_type TEXT,
        affected_zone TEXT,
        relief_camps_json TEXT,
        priority_need TEXT,
        activated_by TEXT,
        activated_at TIMESTAMP
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT,
        action TEXT NOT NULL,
        details TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS reward_categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        icon TEXT NOT NULL,
        description TEXT,
        display_order INTEGER DEFAULT 0
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS reward_products (
        id TEXT PRIMARY KEY,
        category_id TEXT NOT NULL,
        name TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        tagline TEXT,
        description TEXT NOT NULL,
        features_json TEXT,
        specifications_json TEXT,
        points_cost INTEGER NOT NULL,
        stock_quantity INTEGER NOT NULL DEFAULT 50,
        reserved_quantity INTEGER NOT NULL DEFAULT 0,
        fulfilment_type TEXT NOT NULL DEFAULT 'physical',
        availability_status TEXT NOT NULL DEFAULT 'Available',
        image_url TEXT NOT NULL,
        gallery_images_json TEXT,
        is_featured INTEGER DEFAULT 0,
        is_popular INTEGER DEFAULT 0,
        is_demo_inventory INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS green_wallet_transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        type TEXT NOT NULL,
        points INTEGER NOT NULL,
        balance_after INTEGER NOT NULL,
        description TEXT NOT NULL,
        reference_id TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS reward_orders (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        user_name TEXT NOT NULL,
        user_email TEXT NOT NULL,
        product_id TEXT NOT NULL,
        product_name TEXT NOT NULL,
        product_image TEXT NOT NULL,
        fulfilment_type TEXT NOT NULL DEFAULT 'physical',
        quantity INTEGER NOT NULL DEFAULT 1,
        points_spent INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'Redemption Placed',
        delivery_recipient_name TEXT,
        delivery_phone TEXT,
        delivery_address TEXT,
        delivery_city TEXT,
        delivery_state TEXT,
        delivery_pincode TEXT,
        delivery_notes TEXT,
        tracking_number TEXT,
        courier_partner TEXT,
        digital_download_url TEXT,
        status_notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS reward_order_status_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id TEXT NOT NULL,
        status TEXT NOT NULL,
        note TEXT,
        updated_by TEXT DEFAULT 'Sanjeevni Logistics Engine',
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS reward_addresses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        recipient_name TEXT NOT NULL,
        phone TEXT NOT NULL,
        address TEXT NOT NULL,
        city TEXT NOT NULL,
        state TEXT NOT NULL,
        pincode TEXT NOT NULL,
        is_default INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS reward_wishlist (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        product_id TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, product_id)
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS karn_pickups (
        id TEXT PRIMARY KEY,
        donation_id TEXT NOT NULL,
        reference_id TEXT NOT NULL,
        pathway TEXT DEFAULT 'people',
        status TEXT DEFAULT 'Waiting for Receiver',
        donor_id TEXT,
        donor_name TEXT,
        pickup_address TEXT,
        pickup_lat REAL,
        pickup_lng REAL,
        pickup_window TEXT,
        receiver_id TEXT,
        receiver_name TEXT,
        delivery_address TEXT,
        agent_id TEXT,
        agent_name TEXT,
        agent_phone TEXT,
        agent_vehicle TEXT,
        eta_timestamp TEXT,
        eta_minutes INTEGER DEFAULT 0,
        delay_reason TEXT,
        pickup_completed_at TEXT,
        delivery_completed_at TEXT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS karn_agents (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        vehicle TEXT NOT NULL,
        status TEXT DEFAULT 'Available',
        rating REAL DEFAULT 4.9,
        rescues_completed INTEGER DEFAULT 100,
        current_battery INTEGER DEFAULT 85,
        lat REAL DEFAULT 22.7196,
        lng REAL DEFAULT 75.8577,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # --- DONOR-CONTROLLED TRANSPORTATION & FUNDING TABLES ---
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS transportation_requests (
        id TEXT PRIMARY KEY,
        donation_id TEXT NOT NULL,
        reference_id TEXT NOT NULL,
        donor_id TEXT,
        donor_name TEXT,
        receiver_id TEXT,
        receiver_name TEXT,
        transport_mode TEXT NOT NULL DEFAULT 'sponsored',
        self_arranged_type TEXT,
        status TEXT NOT NULL DEFAULT 'Awaiting Receiver Acceptance',
        quoted_amount REAL DEFAULT 0,
        donor_quote_approved INTEGER DEFAULT 0,
        donor_quote_approved_at TEXT,
        assigned_provider_id TEXT,
        assigned_provider_name TEXT,
        assigned_provider_phone TEXT,
        assigned_provider_vehicle TEXT,
        funding_source_id TEXT,
        funding_source_name TEXT,
        funding_status TEXT DEFAULT 'Unfunded',
        handover_scheduled_at TEXT,
        donor_handover_confirmed INTEGER DEFAULT 0,
        receiver_handover_confirmed INTEGER DEFAULT 0,
        estimated_arrival TEXT,
        pickup_address TEXT,
        pickup_lat REAL,
        pickup_lng REAL,
        delivery_address TEXT,
        delivery_lat REAL,
        delivery_lng REAL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS funding_sources (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        total_budget REAL NOT NULL DEFAULT 10000,
        allocated_amount REAL NOT NULL DEFAULT 0,
        spent_amount REAL NOT NULL DEFAULT 0,
        status TEXT DEFAULT 'Active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS transportation_expenses (
        id TEXT PRIMARY KEY,
        request_id TEXT NOT NULL,
        donation_id TEXT NOT NULL,
        funding_source_id TEXT,
        payer_type TEXT NOT NULL,
        payer_name TEXT NOT NULL,
        provider_id TEXT,
        provider_name TEXT,
        amount REAL NOT NULL,
        status TEXT NOT NULL DEFAULT 'Payment Pending',
        receipt_url TEXT,
        notes TEXT,
        approved_by TEXT,
        approved_at TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS logistics_providers (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        contact_person TEXT,
        phone TEXT NOT NULL,
        email TEXT,
        vehicle_type TEXT NOT NULL,
        carrying_capacity_kg REAL NOT NULL DEFAULT 100,
        service_areas TEXT DEFAULT 'Indore Central, Palasia, Vijay Nagar, Rau',
        verification_status TEXT DEFAULT 'Verified',
        rating REAL DEFAULT 4.9,
        completed_trips INTEGER DEFAULT 25,
        is_active INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # Safe migrations for donations table
    cursor.execute("PRAGMA table_info(donations)")
    donations_cols = [r[1] for r in cursor.fetchall()]
    new_donation_cols = [
        ('pathway', "TEXT DEFAULT 'people'"),
        ('karn_status', "TEXT DEFAULT 'Waiting for Receiver'"),
        ('karn_agent_id', "TEXT"),
        ('karn_agent_name', "TEXT"),
        ('karn_agent_phone', "TEXT"),
        ('karn_agent_vehicle', "TEXT"),
        ('karn_eta_timestamp', "TEXT"),
        ('karn_eta_minutes', "INTEGER DEFAULT 0"),
        ('karn_pickup_window', "TEXT"),
        ('karn_delay_notice', "TEXT"),
        ('location_type', "TEXT DEFAULT 'manual'"),
        ('accuracy_meters', "REAL"),
        ('photos_json', "TEXT DEFAULT '[]'"),
        ('intended_animal', "TEXT"),
        ('waste_condition', "TEXT"),
        ('packaging_separated', "INTEGER DEFAULT 1"),
        ('transport_mode', "TEXT DEFAULT 'sponsored'"),
        ('self_arranged_type', "TEXT"),
        ('quoted_amount', "REAL DEFAULT 0"),
        ('donor_quote_approved', "INTEGER DEFAULT 0"),
        ('transport_status', "TEXT DEFAULT 'Awaiting Receiver Acceptance'")
    ]
    for col_name, col_def in new_donation_cols:
        if col_name not in donations_cols:
            cursor.execute(f"ALTER TABLE donations ADD COLUMN {col_name} {col_def}")

    # Safe migrations for karn_pickups table
    cursor.execute("PRAGMA table_info(karn_pickups)")
    kp_cols = [r[1] for r in cursor.fetchall()]
    new_kp_cols = [
        ('transport_mode', "TEXT DEFAULT 'sponsored'"),
        ('self_arranged_type', "TEXT"),
        ('quoted_amount', "REAL DEFAULT 0"),
        ('donor_quote_approved', "INTEGER DEFAULT 0"),
        ('funding_source_id', "TEXT"),
        ('funding_status', "TEXT DEFAULT 'Unfunded'"),
        ('donor_handover_confirmed', "INTEGER DEFAULT 0"),
        ('receiver_handover_confirmed', "INTEGER DEFAULT 0")
    ]
    for col_name, col_def in new_kp_cols:
        if col_name not in kp_cols:
            cursor.execute(f"ALTER TABLE karn_pickups ADD COLUMN {col_name} {col_def}")

    conn.commit()

    # Seed initial crisis state
    cursor.execute("SELECT COUNT(*) FROM crisis_state")
    if cursor.fetchone()[0] == 0:
        cursor.execute("""
            INSERT INTO crisis_state (id, is_active, title, disaster_type, affected_zone, relief_camps_json, priority_need, activated_by, activated_at)
            VALUES (1, 0, 'Sector 3 Monsoon Flood Relief', 'Urban Flooding', 'Vijay Nagar & Bapat Square', '["Sector 3 Govt School Camp", "Khajrana Community Center", "Pardesipura Relief Shed"]', '1,200 dry meal packets & potable water', 'Municipal Disaster Cell', CURRENT_TIMESTAMP)
        """)

    # Seed sample organisations across all 6 categories
    cursor.execute("SELECT COUNT(*) FROM organisations")
    if cursor.fetchone()[0] == 0:
        seed_orgs = [
            # A. Food Donors
            ('ORG-D1', 'Kaveri Hostel Mess', 'Food Donor', 'Suresh Patel (Mess Supervisor)', '+91 98765 00001', 'kaveri.mess@campus.edu', 'Campus Sector 2, North Block', 'Indore', 'Indore', 'Madhya Pradesh', '452010', 22.7256, 75.8637, 'College student mess serving 450+ meals per batch. Prepares fresh daily breakfast, lunch, and dinner.', '07:00 - 22:30', 'Commercial Bain-Marie, Cold Chiller, Insulated Transport Crates', '[]', 'Verified', datetime.now().isoformat()),
            ('ORG-D2', 'Royal Orchid Banquet Hall', 'Food Donor', 'Dinesh Sharma (Catering Lead)', '+91 98765 00002', 'events@royalorchid.in', 'Outer Ring Rd, Event Zone', 'Indore', 'Indore', 'Madhya Pradesh', '452016', 22.7116, 75.8827, 'Premium wedding and corporate convention banquet accommodating up to 1,500 guests.', '10:00 - 01:00', 'Walk-in Chiller, Industrial Dishwashers, Food Warming Cabinets', '[]', 'Verified', datetime.now().isoformat()),
            ('ORG-D3', 'Spice Route Bistro', 'Food Donor', 'Rahul Verma (General Manager)', '+91 98765 00003', 'gm@spiceroute.com', 'Indiranagar 100ft Road', 'Indore', 'Indore', 'Madhya Pradesh', '452001', 22.7196, 75.8477, 'North Indian and Mughlai specialty restaurant committed to zero edible landfill waste.', '11:30 - 23:30', 'Standard Restaurant Deep Freeze, Foil Sealing Equipment', '[]', 'Verified', datetime.now().isoformat()),
            ('ORG-D4', 'TechPark Cyber Canteen', 'Food Donor', 'Amit Joshi (Facility Lead)', '+91 98765 00004', 'canteen@techpark.indore.in', 'Phase 1 Food Court, Super Corridor', 'Indore', 'Indore', 'Madhya Pradesh', '452005', 22.7306, 75.8377, 'Multi-vendor corporate food court serving 2,000+ IT professionals daily.', '08:00 - 21:00', 'Blast Chiller, Reusable Dabba Station, Loading Dock', '[]', 'Verified', datetime.now().isoformat()),
            
            # B. Human Food Receivers (NGOs, Shelters)
            ('ORG-R1', 'Akshaya Food Shelter', 'Human Food Receiver', 'Meena Sen (Coordinator)', '+91 98765 11001', 'contact@akshayashelter.org', 'Sector 4 Shelter Ground, Bapat Chauraha', 'Indore', 'Indore', 'Madhya Pradesh', '452010', 22.7216, 75.8617, 'Night shelter providing hygienic dinner and sleeping beds for 120 daily wage workers and urban homeless.', '18:00 - 23:00', 'Stainless Steel Dining Area, Thermal Food Holding Tanks, Hygiene Inspection Kit', '[]', 'Verified', datetime.now().isoformat()),
            ('ORG-R2', 'Robin Hood Army - Indore Chapter', 'Human Food Receiver', 'Arjun Saxena (City Lead)', '+91 98765 22002', 'indore@robinhoodarmy.com', 'Navlakha Transport Hub', 'Indore', 'Indore', 'Madhya Pradesh', '452001', 22.7176, 75.8557, 'Zero-funds volunteer organization redistributing surplus food across 3 informal settlement clusters.', '19:00 - 23:30', 'Volunteer Motorbike Fleet, Insulated Distribution Backpacks', '[]', 'Verified', datetime.now().isoformat()),
            ('ORG-R3', 'Anand Senior Citizen Home', 'Human Food Receiver', 'Dr. V. K. Trivedi', '+91 98765 33003', 'care@anandseniors.org', 'Old Palasia Residential Zone', 'Indore', 'Indore', 'Madhya Pradesh', '452001', 22.7276, 75.8507, 'Assisted living sanctuary for 50 senior citizens requiring soft, mildly spiced, easily digestible meals.', '07:30 - 21:00', 'Steam Warming Bain-Marie, Medical Diet Compliance Officer', '[]', 'Verified', datetime.now().isoformat()),
            ('ORG-R4', 'Hope Children Home & Orphanage', 'Human Food Receiver', 'Sister Teresa Joseph', '+91 98765 44004', 'hope.indore@childwelfare.org', 'Scheme 54, Near Vijay Nagar', 'Indore', 'Indore', 'Madhya Pradesh', '452010', 22.7136, 75.8697, 'Residential home and learning center caring for 65 children aged 5 to 17.', '06:30 - 21:30', 'Dedicated Clean Kitchenette, Food Reheating Ovens, Milk Storage Refrigerator', '[]', 'Verified', datetime.now().isoformat()),
            ('ORG-R5', 'Seva Community Kitchen', 'Human Food Receiver', 'Harpreet Singh (Head Sewadar)', '+91 98765 55005', 'seva.langar@gurudwaraindore.org', 'Near MY Hospital, Chhawani', 'Indore', 'Indore', 'Madhya Pradesh', '452001', 22.7246, 75.8437, '24/7 community kitchen serving free nutritious meals to patients and attendants visiting the district government hospital.', 'Open 24 Hours', 'Mega Cauldrons, Industrial Chapati Press, Continuous Water Purifiers', '[]', 'Verified', datetime.now().isoformat()),
            
            # C. Animal Welfare Organisations
            ('ORG-A1', 'Karuna Gaushala & Stray Haven', 'Animal Welfare Organisation', 'Pandit R. K. Shastri', '+91 98765 66006', 'karuna.gaushala@indore.org', 'Khandwa Road Bypass Rural Cluster', 'Indore', 'Indore', 'Madhya Pradesh', '452020', 22.7066, 75.8767, 'Sanctuary caring for 320 rescued cattle and 140 community stray animals. Accepts verified vegetarian grains, rotis, and produce.', '06:00 - 19:00', 'Cattle Fodder Troughs, Vegetable Chopping Unit, Veterinary First Aid Dispensary', '[]', 'Verified', datetime.now().isoformat()),
            
            # D. Food Collection & Storage
            ('ORG-S1', 'Indore Central Community Refrigerator', 'Food Collection & Storage', 'Deepak Chouhan', '+91 98765 77100', 'fridge.hub@sanjeevni.org', 'Palasia Square Civic Garden', 'Indore', 'Indore', 'Madhya Pradesh', '452001', 22.7220, 75.8520, 'Public cold storage cabinet with solar backup, monitored by volunteer caretakers for packaging integrity.', '08:00 - 22:00', 'Solar Inverter Cold Storage, CCTV Safety Monitoring, Barcode Inspection Log', '[]', 'Verified', datetime.now().isoformat()),
            
            # E. Waste Recovery and Processing
            ('ORG-W1', 'GreenEarth City Biomethanation & Compost Plant', 'Waste Processing Partner', 'Er. Naveen Kothari', '+91 98765 77007', 'biogas.operations@greenearthindore.gov.in', 'Devguradia Municipal Processing Corridor', 'Indore', 'Indore', 'Madhya Pradesh', '452016', 22.7326, 75.8877, 'Central anaerobic digestion plant converting unavoidable organic food residues into biogas electricity and grade-A biofertilizer.', '07:00 - 20:00', '50 TPD Anaerobic Digesters, Vermicompost Curing Beds, Moisture Analyzers', '[]', 'Verified', datetime.now().isoformat()),
            
            # F. Supporting Facilities
            ('ORG-F1', 'Indore Youth Volunteer & Food Testing Lab', 'Supporting Facility', 'Sunita Rao (Lead Technologist)', '+91 98765 88008', 'qc.hub@sanjeevni.org', 'AITR Innovation Wing, Manglia', 'Indore', 'Indore', 'Madhya Pradesh', '453771', 22.7196, 75.8577, 'Food safety testing and rapid ATP swab testing point, training college volunteers in FSSAI hygiene standards.', '09:00 - 18:00', 'Rapid Microbial Test Kits, Digital Thermal Probes, Safe Handling Certification Kiosk', '[]', 'Verified', datetime.now().isoformat())
        ]
        cursor.executemany("""
            INSERT INTO organisations (id, name, category, contact_person, phone, email, address, city, district, state, pincode, lat, lng, description, operating_hours, facilities, photos_json, verification_status, verified_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, seed_orgs)

    # Seed sample users for each of the 6 roles
    cursor.execute("SELECT COUNT(*) FROM users")
    if cursor.fetchone()[0] == 0:
        seed_users = [
            ('USR-001', 'Suresh Patel', 'donor@kaveri.edu', 'hashed_pass_123', 'Food Donor', '+91 98765 00001', 'ORG-D1'),
            ('USR-002', 'Meena Sen', 'ngo@akshaya.org', 'hashed_pass_123', 'NGO / Food Receiver', '+91 98765 11001', 'ORG-R1'),
            ('USR-003', 'Rajesh Kumar', 'volunteer@sanjeevni.org', 'hashed_pass_123', 'Volunteer', '+91 98111 00101', None),
            ('USR-004', 'Pandit R. K. Shastri', 'gaushala@karuna.org', 'hashed_pass_123', 'Animal Welfare Organisation', '+91 98765 66006', 'ORG-A1'),
            ('USR-005', 'Er. Naveen Kothari', 'biogas@greenearth.gov.in', 'hashed_pass_123', 'Waste Processing Partner', '+91 98765 77007', 'ORG-W1'),
            ('USR-006', 'Admin Sanjeevni', 'admin@sanjeevni.org', 'hashed_pass_admin', 'Admin', '+91 98000 99999', None)
        ]
        cursor.executemany("""
            INSERT INTO users (id, name, email, password_hash, role, phone, organisation_id)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, seed_users)

    # Seed sample donations covering various lifecycle statuses
    cursor.execute("SELECT COUNT(*) FROM donations")
    if cursor.fetchone()[0] == 0:
        seed_donations = [
            (
                'DON-101', 'ORG-D1', 'Kaveri Hostel Mess', 'Fresh Matar Paneer & 120 Phulka Rotis', 'Cooked Meals',
                120.0, 'plates', 'Veg', 35, '20:00', '23:54', 'Hot-Held',
                'Campus Sector 2, North Block', 22.7256, 75.8637,
                '["Pure Veg", "No Onion-Garlic (Jain Friendly)", "Soft Food for Elderly"]',
                '["Contains Dairy / Lactose", "Contains Gluten / Wheat"]',
                'Accepted', 'ORG-R1', 'USR-003', 'donor',
                '[{"time": "20:00", "event": "Listed by Kaveri Hostel Mess Staff (Temp: 68°C)", "by": "Mess Supervisor Suresh"}, {"time": "20:12", "event": "Accepted by Akshaya Food Shelter (ETA: 22 min)", "by": "R1 Coordinator Meena"}, {"time": "20:14", "event": "Volunteer Rajesh Kumar assigned (0.4 km away)", "by": "Auto-Dispatcher"}]',
                '{"temperatureProbeC": 68.5, "packagingSealed": true, "sensoryInspection": true, "allergenLabeled": true, "inspectorName": "Rajesh Kumar (Volunteer)"}'
            ),
            (
                'DON-102', 'ORG-D3', 'Spice Route Bistro', 'Hyderabadi Chicken Biryani & Mirchi Salan', 'Cooked Meals',
                75.0, 'plates', 'Non-Veg', 105, '18:50', '21:20', 'Room Temp',
                'Indiranagar 100ft Road', 22.7196, 75.8477,
                '["Halal", "Child-Friendly"]',
                '["Contains Dairy / Lactose"]',
                'Available', None, None, 'far',
                '[{"time": "18:50", "event": "Cooked & packed in food-grade foil containers", "by": "Chef Imtiaz"}, {"time": "19:40", "event": "Listed as surplus after dinner rush (75 plates)", "by": "Manager Rahul"}]',
                '{"temperatureProbeC": 52.0, "packagingSealed": true, "sensoryInspection": true, "allergenLabeled": true, "inspectorName": "Rahul Verma"}'
            ),
            (
                'DON-103', 'ORG-D2', 'Royal Orchid Banquet Hall', 'Assorted Rasgulla, Kheer & Gulab Jamun', 'Bakery products',
                90.0, 'plates', 'Veg', 60, '19:30', '23:30', 'Chilled / Fridge',
                'Outer Ring Rd, Event Zone', 22.7116, 75.8827,
                '["Pure Veg", "Child-Friendly"]',
                '["Contains Dairy / Lactose", "Contains Peanuts / Tree Nuts"]',
                'Available', None, None, 'far',
                '[{"time": "19:30", "event": "Transferred to walk-in chiller (3°C) post wedding buffet", "by": "Catering Lead Dinesh"}, {"time": "20:00", "event": "Listed on Sanjeevni portal", "by": "Catering Lead Dinesh"}]',
                '{"temperatureProbeC": 3.8, "packagingSealed": true, "sensoryInspection": true, "allergenLabeled": true, "inspectorName": "Dinesh Sharma"}'
            ),
            (
                'DON-104', 'ORG-D4', 'TechPark Cyber Canteen', 'Wholesome Vegetable Pulao & Curd Raita', 'Cooked Meals',
                60.0, 'plates', 'Veg', 45, '19:45', '22:45', 'Hot-Held',
                'Phase 1 Food Court, Super Corridor', 22.7306, 75.8377,
                '["Pure Veg", "Nut-Free"]',
                '["Contains Dairy / Lactose"]',
                'Completed', 'ORG-R2', 'USR-003', 'receiver',
                '[{"time": "19:45", "event": "Listed as evening dinner surplus", "by": "Amit Joshi"}, {"time": "20:05", "event": "Accepted by Robin Hood Army", "by": "Arjun Saxena"}, {"time": "20:30", "event": "Picked up by volunteer Rajesh Kumar", "by": "Rajesh Kumar"}, {"time": "21:05", "event": "Delivered to Navlakha Slum Community & Signed", "by": "Arjun Saxena"}]',
                '{"temperatureProbeC": 64.0, "packagingSealed": true, "sensoryInspection": true, "allergenLabeled": true, "inspectorName": "Rajesh Kumar"}'
            )
        ]
        cursor.executemany("""
            INSERT INTO donations (
                id, donor_id, donor_name, title, category, quantity, unit, veg_type,
                cooked_minutes_ago, prep_time, expiry_time, storage, address, lat, lng,
                dietary_tags_json, allergens_json, status, assigned_receiver_id, assigned_volunteer_id,
                volunteer_simulated_near, custody_log_json, safety_checks_json
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, seed_donations)

    # Seed sample waste listings across Pathways B and C
    cursor.execute("SELECT COUNT(*) FROM waste_listings")
    if cursor.fetchone()[0] == 0:
        seed_waste = [
            (
                'WST-301', 'ORG-D1', 'Kaveri Hostel Mess', 'Vegetable peels & kitchen scraps',
                'Uncooked vegetable trimmings, potato peels, carrot tops, cabbage leaves',
                45.0, 'Fresh Raw Scraps', 'Campus Sector 2 Mess Backdock', 22.7256, 75.8637,
                1, 'Pathway B: Suitable Animal Feed', 'ORG-A1', 'Accepted',
                'Scheduled for daily morning cattle feed supplement batch at Karuna Gaushala'
            ),
            (
                'WST-302', 'ORG-D2', 'Royal Orchid Banquet Hall', 'Over-fermented cooked gravies & buffet trimmings',
                'Post-event food trimmings and unavoidable buffet plate scrape-offs, non-edible for human/animal',
                110.0, 'Biodegradable Organic Residue', 'Banquet Service Gate 3', 22.7116, 75.8827,
                1, 'Pathway C: Composting & Organic Recovery', 'ORG-W1', 'Processed',
                'Digested into 24 kWh methane biogas electricity & 35 kg grade-A nutrient bio-fertilizer'
            ),
            (
                'WST-303', 'ORG-D4', 'TechPark Cyber Canteen', 'Spent tea leaves & coffee grounds',
                'High-nitrogen coffee grounds and strained black tea leaves from morning and evening beverage stations',
                30.0, 'Clean Organic Residual', 'Cyber Canteen Beverage Dock', 22.7306, 75.8377,
                1, 'Pathway C: Composting & Organic Recovery', 'ORG-W1', 'Registered',
                'Pending pickup batch routing to Devguradia vermicomposting bed'
            )
        ]
        cursor.executemany("""
            INSERT INTO waste_listings (
                id, source_org_id, source_name, category, material_description,
                quantity_kg, waste_condition, pickup_location, lat, lng,
                packaging_separated, recovery_pathway, target_partner_id, status, processing_outcome
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, seed_waste)

    # Seed sample volunteer tasks
    cursor.execute("SELECT COUNT(*) FROM volunteer_tasks")
    if cursor.fetchone()[0] == 0:
        seed_tasks = [
            (
                'TSK-401', 'DON-101', None, 'USR-003', 'Rajesh Kumar', 'Food Rescue',
                'Kaveri Hostel Mess (Sector 2)', 'Akshaya Food Shelter (Bapat Chauraha)',
                'Accepted', 0.5, 0
            ),
            (
                'TSK-402', 'DON-104', None, 'USR-003', 'Rajesh Kumar', 'Food Rescue',
                'TechPark Cyber Canteen', 'Robin Hood Army Navlakha Hub',
                'Completed', 1.2, 1
            ),
            (
                'TSK-403', None, 'WST-301', 'USR-003', 'Rajesh Kumar', 'Organic Waste Transfer',
                'Kaveri Hostel Mess', 'Karuna Gaushala (Khandwa Rd)',
                'Available', 0.0, 0
            )
        ]
        cursor.executemany("""
            INSERT INTO volunteer_tasks (
                id, donation_id, waste_id, volunteer_id, volunteer_name,
                task_type, pickup_address, delivery_address, status, hours_spent, verified
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, seed_tasks)

    # Seed Dabba containers
    cursor.execute("SELECT COUNT(*) FROM dabba_containers")
    if cursor.fetchone()[0] == 0:
        seed_dabbas = [
            ('DAB-01', 'QR-SANJEEVNI-DAB-01', 'ORG-D1', 'Kaveri Hostel Mess', 'In Transit', 14, 'Clean & Sanitized', 'Today, 18:30', '[{"date":"2026-11-20","from":"Akshaya Shelter","to":"Kaveri Mess"},{"date":"2026-11-24","dispatchedTo":"Rajesh Kumar"}]'),
            ('DAB-02', 'QR-SANJEEVNI-DAB-02', 'ORG-R1', 'Akshaya Food Shelter', 'At Receiver', 22, 'Awaiting Return Sanitization', 'Yesterday, 21:00', '[{"date":"2026-11-22","from":"Royal Orchid","to":"Akshaya Shelter"}]'),
            ('DAB-03', 'QR-SANJEEVNI-DAB-03', 'ORG-D2', 'Royal Orchid Banquet', 'In Stock', 31, 'Clean & Sanitized', 'Today, 15:00', '[{"date":"2026-11-23","returnedBy":"Volunteer Rajesh"}]'),
            ('DAB-04', 'QR-SANJEEVNI-DAB-04', 'ORG-S1', 'Indore Central Community Refrigerator', 'In Stock', 9, 'Clean & Sanitized', 'Today, 12:00', '[]')
        ]
        cursor.executemany("""
            INSERT INTO dabba_containers (
                id, qr_code, current_holder_id, holder_name, status, reuse_count, condition, last_inspected, history_json
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, seed_dabbas)

    # Seed KARN Agents
    cursor.execute("SELECT COUNT(*) FROM karn_agents")
    if cursor.fetchone()[0] == 0:
        seed_agents = [
            ('AGENT-001', 'Kunal Verma', '+91 98260 11223', 'Hero Electric E-Scooter (MP-09-EV-4421)', 'Active On Route', 4.95, 142, 82, 22.7210, 75.8620),
            ('AGENT-002', 'Pooja Sharma', '+91 98261 55667', 'TVS King Eco Cargo (MP-09-CC-8109)', 'Available', 4.98, 210, 94, 22.7180, 75.8540),
            ('AGENT-003', 'Rohit Mandloi', '+91 98932 77412', 'Mahindra Treo Electric Cargo (MP-09-EV-1902)', 'Available', 4.88, 95, 78, 22.7290, 75.8690),
            ('AGENT-004', 'Sunita Joshi', '+91 94250 88231', 'Ather 450X (MP-09-SQ-6511)', 'Available', 4.91, 118, 91, 22.7150, 75.8480)
        ]
        cursor.executemany("""
            INSERT INTO karn_agents (id, name, phone, vehicle, status, rating, rescues_completed, current_battery, lat, lng)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, seed_agents)

    # Seed KARN Pickups
    cursor.execute("SELECT COUNT(*) FROM karn_pickups")
    if cursor.fetchone()[0] == 0:
        now_dt = datetime.now()
        seed_pickups = [
            (
                'KARN-101', 'DON-101', 'REF-SANJ-8912', 'people', 'Agent on the Way',
                'ORG-D1', 'Kaveri Hostel Mess (Sector 2)', 'Campus Sector 2, North Block, Indore',
                22.7256, 75.8637, '13:30 - 14:15', 'ORG-R1', 'Akshaya Food Shelter',
                'Sector 4 Shelter Ground, Bapat Chauraha, Indore',
                'AGENT-001', 'Kunal Verma', '+91 98260 11223', 'Hero Electric E-Scooter (MP-09-EV-4421)',
                (now_dt + timedelta(minutes=18)).isoformat(), 18, None, None, None,
                'Temperature verified at 68.4°C. Hot-insulated container mounted.'
            ),
            (
                'KARN-102', 'DON-102', 'REF-SANJ-8913', 'people', 'Waiting for Receiver',
                'ORG-D2', 'Royal Orchid Banquet Hall', 'Outer Ring Rd, Event Zone, Indore',
                22.7116, 75.8827, '15:00 - 16:00', None, None, None,
                None, None, None, None, None, 0, None, None, None,
                'Surplus afternoon meal trays. Awaiting verified NGO claim.'
            ),
            (
                'KARN-103', 'DON-103', 'REF-SANJ-8914', 'animal', 'KARN Agent Assignment Pending',
                'ORG-D4', 'TechPark Cyber Canteen', 'Phase 1 Food Court, Super Corridor, Indore',
                22.7306, 75.8377, '16:00 - 17:30', 'ORG-A1', 'Karuna Gaushala & Animal Shelter',
                'Khandwa Road, Near Ralamandal Sanctuary',
                None, None, None, None, None, 0, None, None, None,
                'Sorted organic vegetable greens and surplus chapatis for cattle.'
            ),
            (
                'KARN-104', 'DON-104', 'REF-SANJ-8915', 'people', 'Delivery Completed',
                'ORG-D3', 'Spice Route Bistro', 'Indiranagar 100ft Road, Indore',
                22.7196, 75.8477, '10:00 - 11:00', 'ORG-R2', 'Robin Hood Army - Navlakha Hub',
                'Navlakha Transport Hub, Indore',
                'AGENT-002', 'Pooja Sharma', '+91 98261 55667', 'TVS King Eco Cargo (MP-09-CC-8109)',
                None, 0, None, '2026-11-24 10:15', '2026-11-24 10:48',
                'Delivered 35 meal boxes. Recipient acknowledgment signed.'
            )
        ]
        cursor.executemany("""
            INSERT INTO karn_pickups (
                id, donation_id, reference_id, pathway, status,
                donor_id, donor_name, pickup_address, pickup_lat, pickup_lng, pickup_window,
                receiver_id, receiver_name, delivery_address,
                agent_id, agent_name, agent_phone, agent_vehicle,
                eta_timestamp, eta_minutes, delay_reason, pickup_completed_at, delivery_completed_at, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, seed_pickups)

    # Seed Funding Sources
    cursor.execute("SELECT COUNT(*) FROM funding_sources")
    if cursor.fetchone()[0] == 0:
        seed_funds = [
            ('FUND-001', 'Institutional CSR Fund - Kaveri Group', 'CSR sponsorship', 50000.0, 12400.0, 8600.0, 'Active'),
            ('FUND-002', 'Indore Community Food Transport Fund', 'Community sponsorship', 25000.0, 4800.0, 3200.0, 'Active'),
            ('FUND-003', 'Emergency Hunger Mitigation Allocation', 'Emergency transportation fund', 75000.0, 15000.0, 9500.0, 'Active'),
            ('FUND-004', 'Municipal Green Transit Grant (IMC)', 'College/institutional support', 40000.0, 8000.0, 4500.0, 'Active')
        ]
        cursor.executemany("""
            INSERT INTO funding_sources (id, name, category, total_budget, allocated_amount, spent_amount, status)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, seed_funds)

    # Seed Logistics Providers
    cursor.execute("SELECT COUNT(*) FROM logistics_providers")
    if cursor.fetchone()[0] == 0:
        seed_provs = [
            ('PROV-001', 'Indore Green EV Logistics', 'Er. Alok Verma', '+91 98260 22334', 'alok@indoregreen.in', 'EV Cargo 3-Wheeler', 350.0, 'Indore Central, Palasia, Vijay Nagar', 'Verified', 4.95, 142, 1),
            ('PROV-002', 'Sanjeevni Rapid Eco-Couriers', 'Pooja Sharma', '+91 98260 44556', 'pooja@sanjeevni.org', 'Electric Scooter', 40.0, 'Geeta Bhawan, Navlakha, Chhotigwaltoli', 'Verified', 4.91, 98, 1),
            ('PROV-003', 'Narmada Valley Cold Chain', 'Dr. Vikram Joshi', '+91 98260 66778', 'vikram@narmadacold.com', 'Insulated Temp-Controlled Van', 800.0, 'All Indore Metro & Outskirts', 'Verified', 4.88, 64, 1),
            ('PROV-004', 'City Cycle Food Brigade', 'Kunal Verma', '+91 98260 11223', 'kunal@sanjeevni.org', 'Cargo Bicycle', 25.0, 'Old City, Rajwada, Sarafa, Bada Ganpati', 'Verified', 4.92, 53, 1)
        ]
        cursor.executemany("""
            INSERT INTO logistics_providers (id, name, contact_person, phone, email, vehicle_type, carrying_capacity_kg, service_areas, verification_status, rating, completed_trips, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, seed_provs)

    # Seed Transportation Requests
    cursor.execute("SELECT COUNT(*) FROM transportation_requests")
    if cursor.fetchone()[0] == 0:
        seed_tr = [
            (
                'TR-101', 'DON-101', 'REF-SANJ-8912', 'ORG-D1', 'Kaveri Hostel Mess (Sector 2)',
                'ORG-R1', 'Akshaya Food Shelter', 'sponsored', None, 'In Transit',
                220.0, 1, '2026-11-24 13:20', 'PROV-001', 'Indore Green EV Logistics',
                '+91 98260 22334', 'EV Cargo 3-Wheeler (MP-09-EV-4421)', 'FUND-001',
                'Institutional CSR Fund - Kaveri Group', 'Approved', '2026-11-24 13:45',
                1, 0, '18 mins remaining', 'Campus Sector 2, North Block, Indore', 22.7256, 75.8637,
                'Sector 4 Shelter Ground, Bapat Chauraha, Indore', 22.7410, 75.8850,
                'Sponsored via Kaveri CSR. Insulated food crates mounted.'
            ),
            (
                'TR-102', 'DON-102', 'REF-SANJ-8913', 'ORG-D2', 'Royal Orchid Banquet Hall',
                None, None, 'donor_paid', None, 'Awaiting Receiver Acceptance',
                280.0, 1, '2026-11-24 14:10', None, None,
                None, None, None, None, 'Unfunded', '2026-11-24 15:30',
                0, 0, 'Estimated 25 mins on match', 'Outer Ring Rd, Event Zone, Indore', 22.7116, 75.8827,
                None, None, None,
                'Donor pre-approved ₹280 paid logistics dispatch once claimed.'
            ),
            (
                'TR-103', 'DON-103', 'REF-SANJ-8914', 'ORG-D4', 'TechPark Cyber Canteen',
                'ORG-A1', 'Karuna Gaushala & Animal Shelter', 'self_arranged', 'receiver_pickup', 'Pickup Scheduled',
                0.0, 0, None, None, None,
                None, None, None, None, 'Not Required', '2026-11-24 16:30',
                0, 0, 'Receiver vehicle scheduled at 16:30', 'Phase 1 Food Court, Super Corridor, Indore', 22.7306, 75.8377,
                'Khandwa Road, Near Ralamandal Sanctuary', 22.6850, 75.8920,
                'Self-Arranged: Karuna Gaushala green fodder tractor will collect.'
            ),
            (
                'TR-104', 'DON-104', 'REF-SANJ-8915', 'ORG-D3', 'Spice Route Bistro',
                'ORG-R2', 'Robin Hood Army - Navlakha Hub', 'sponsored', None, 'Completed',
                160.0, 1, '2026-11-24 09:40', 'PROV-002', 'Sanjeevni Rapid Eco-Couriers',
                '+91 98260 44556', 'Electric Scooter (MP-09-EV-8821)', 'FUND-002',
                'Indore Community Food Transport Fund', 'Paid', '2026-11-24 10:15',
                1, 1, 'Completed', 'Indiranagar 100ft Road, Indore', 22.7196, 75.8477,
                'Navlakha Transport Hub, Indore', 22.7050, 75.8750,
                'Delivered & signed off by Meena Sen.'
            )
        ]
        cursor.executemany("""
            INSERT INTO transportation_requests (
                id, donation_id, reference_id, donor_id, donor_name,
                receiver_id, receiver_name, transport_mode, self_arranged_type, status,
                quoted_amount, donor_quote_approved, donor_quote_approved_at,
                assigned_provider_id, assigned_provider_name, assigned_provider_phone, assigned_provider_vehicle,
                funding_source_id, funding_source_name, funding_status, handover_scheduled_at,
                donor_handover_confirmed, receiver_handover_confirmed, estimated_arrival,
                pickup_address, pickup_lat, pickup_lng, delivery_address, delivery_lat, delivery_lng, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, seed_tr)

    # Seed Transportation Expenses
    cursor.execute("SELECT COUNT(*) FROM transportation_expenses")
    if cursor.fetchone()[0] == 0:
        seed_exp = [
            ('EXP-001', 'TR-101', 'DON-101', 'FUND-001', 'sponsor', 'Kaveri Group CSR Fund', 'PROV-001', 'Indore Green EV Logistics', 220.0, 'Approved', 'https://sanjeevni.org/receipts/rec-101.pdf', 'Kaveri Mess to Akshaya Shelter (7.2 km)', 'Admin Sanjeevni', '2026-11-24 13:25'),
            ('EXP-002', 'TR-102', 'DON-102', None, 'donor', 'Royal Orchid Banquet Hall', 'PROV-003', 'Narmada Valley Cold Chain', 280.0, 'Payment Pending', None, 'Donor approved quote. Awaiting trip completion.', None, None),
            ('EXP-004', 'TR-104', 'DON-104', 'FUND-002', 'sponsor', 'Indore Community Food Transport Fund', 'PROV-002', 'Sanjeevni Rapid Eco-Couriers', 160.0, 'Paid', 'https://sanjeevni.org/receipts/rec-104.pdf', 'Spice Route to Navlakha Hub (4.8 km)', 'Admin Sanjeevni', '2026-11-24 10:50')
        ]
        cursor.executemany("""
            INSERT INTO transportation_expenses (
                id, request_id, donation_id, funding_source_id, payer_type, payer_name,
                provider_id, provider_name, amount, status, receipt_url, notes, approved_by, approved_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, seed_exp)

    conn.commit()
    conn.close()

class SanjeevniHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Disable caching for snappy prototype development
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def send_json(self, status_code, data):
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(data, default=str).encode('utf-8'))

    def read_body(self):
        content_length = int(self.headers.get('Content-Length', 0))
        if content_length > 0:
            body = self.rfile.read(content_length).decode('utf-8')
            try:
                return json.loads(body)
            except Exception:
                return {}
        return {}

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        query = urllib.parse.parse_qs(parsed.query)

        # Health Check
        if path == '/api/health':
            return self.send_json(200, {
                'status': 'healthy',
                'service': 'SANJEEVNI Social Impact Backend',
                'version': '2.0.0',
                'time': datetime.now().isoformat()
            })

        # API: Current user / session mock
        if path == '/api/auth/me':
            role = query.get('role', ['Admin'])[0]
            conn = get_db()
            user = conn.execute("SELECT * FROM users WHERE role = ? LIMIT 1", (role,)).fetchone()
            conn.close()
            if user:
                return self.send_json(200, dict(user))
            return self.send_json(200, {
                'id': 'USR-006',
                'name': 'Sanjeevni Admin',
                'role': 'Admin',
                'email': 'admin@sanjeevni.org'
            })

        # API: Organisations
        if path == '/api/organisations':
            conn = get_db()
            category = query.get('category', [None])[0]
            status = query.get('status', [None])[0]
            sql = "SELECT * FROM organisations WHERE 1=1"
            params = []
            if category and category != 'All':
                sql += " AND category = ?"
                params.append(category)
            if status:
                sql += " AND verification_status = ?"
                params.append(status)
            sql += " ORDER BY name ASC"
            rows = conn.execute(sql, params).fetchall()
            conn.close()
            return self.send_json(200, [dict(r) for r in rows])

        # API: Single Organisation
        if path.startswith('/api/organisations/'):
            org_id = path.replace('/api/organisations/', '')
            conn = get_db()
            row = conn.execute("SELECT * FROM organisations WHERE id = ?", (org_id,)).fetchone()
            conn.close()
            if row:
                return self.send_json(200, dict(row))
            return self.send_json(404, {'error': 'Organisation not found'})

        # API: Donations
        if path == '/api/donations':
            conn = get_db()
            status = query.get('status', [None])[0]
            sql = "SELECT * FROM donations WHERE 1=1"
            params = []
            if status:
                sql += " AND status = ?"
                params.append(status)
            sql += " ORDER BY created_at DESC"
            rows = conn.execute(sql, params).fetchall()
            conn.close()
            donations = []
            for r in rows:
                item = dict(r)
                try:
                    item['dietaryTags'] = json.loads(item.get('dietary_tags_json') or '[]')
                    item['allergens'] = json.loads(item.get('allergens_json') or '[]')
                    item['custodyLog'] = json.loads(item.get('custody_log_json') or '[]')
                    item['safetyChecks'] = json.loads(item.get('safety_checks_json') or '{}')
                except Exception:
                    pass
                donations.append(item)
            return self.send_json(200, donations)

        # API: Waste Listings
        if path == '/api/waste':
            conn = get_db()
            pathway = query.get('pathway', [None])[0]
            sql = "SELECT * FROM waste_listings WHERE 1=1"
            params = []
            if pathway:
                sql += " AND recovery_pathway LIKE ?"
                params.append(f"%{pathway}%")
            sql += " ORDER BY created_at DESC"
            rows = conn.execute(sql, params).fetchall()
            conn.close()
            return self.send_json(200, [dict(r) for r in rows])

        # API: Volunteer Tasks
        if path == '/api/volunteers/tasks':
            conn = get_db()
            rows = conn.execute("SELECT * FROM volunteer_tasks ORDER BY created_at DESC").fetchall()
            conn.close()
            return self.send_json(200, [dict(r) for r in rows])

        # API: Dabba Bank
        if path == '/api/dabba-bank':
            conn = get_db()
            rows = conn.execute("SELECT * FROM dabba_containers ORDER BY id ASC").fetchall()
            conn.close()
            dabbas = []
            for r in rows:
                item = dict(r)
                try:
                    item['history'] = json.loads(item.get('history_json') or '[]')
                except Exception:
                    item['history'] = []
                dabbas.append(item)
            return self.send_json(200, dabbas)

        # API: Crisis State
        if path == '/api/crisis':
            conn = get_db()
            row = conn.execute("SELECT * FROM crisis_state WHERE id = 1").fetchone()
            conn.close()
            if row:
                res = dict(row)
                try:
                    res['relief_camps'] = json.loads(res.get('relief_camps_json') or '[]')
                except Exception:
                    res['relief_camps'] = []
                return self.send_json(200, res)
            return self.send_json(200, {'is_active': 0})

        # API: Impact Stats
        if path == '/api/stats':
            conn = get_db()
            total_donations = conn.execute("SELECT COUNT(*), COALESCE(SUM(quantity), 0) FROM donations").fetchone()
            completed_donations = conn.execute("SELECT COUNT(*), COALESCE(SUM(quantity), 0) FROM donations WHERE status IN ('Delivered', 'Completed')").fetchone()
            total_waste = conn.execute("SELECT COUNT(*), COALESCE(SUM(quantity_kg), 0) FROM waste_listings").fetchone()
            total_orgs = conn.execute("SELECT COUNT(*) FROM organisations").fetchone()[0]
            total_volunteers = conn.execute("SELECT COUNT(*) FROM users WHERE role = 'Volunteer'").fetchone()[0]
            conn.close()
            return self.send_json(200, {
                'totalDonationsCount': total_donations[0],
                'totalPlatesDonated': total_donations[1],
                'completedMeals': completed_donations[1],
                'peopleFedToday': int(completed_donations[1]),
                'estimatedValueSaved': int(completed_donations[1] * 45),
                'co2AvoidedKg': int(completed_donations[1] * 1.1 + total_waste[1] * 0.9),
                'totalWasteKg': total_waste[1],
                'organisationsCount': total_orgs,
                'volunteersCount': max(total_volunteers, 6),
                'zeroWasteRate': '100%'
            })

        # =========================================================================
        # REWARDS STORE & GREEN WALLET GET ENDPOINTS
        # =========================================================================
        if path == '/api/rewards/categories':
            conn = get_db()
            cats = conn.execute("SELECT * FROM reward_categories ORDER BY display_order ASC").fetchall()
            conn.close()
            return self.send_json(200, [dict(c) for c in cats])

        if path == '/api/rewards/products':
            conn = get_db()
            category = query.get('category', [None])[0]
            search = query.get('search', [None])[0]
            min_pts = query.get('min_points', [None])[0]
            max_pts = query.get('max_points', [None])[0]
            avail = query.get('availability', [None])[0]
            sort_by = query.get('sort', ['popular'])[0]
            fulfilment = query.get('fulfilment_type', [None])[0]

            sql = "SELECT p.*, c.name as category_name FROM reward_products p LEFT JOIN reward_categories c ON p.category_id = c.id WHERE 1=1"
            params = []
            if category and category != 'all':
                sql += " AND (p.category_id = ? OR c.slug = ?)"
                params.extend([category, category])
            if search:
                sql += " AND (p.name LIKE ? OR p.tagline LIKE ? OR p.description LIKE ?)"
                params.extend([f"%{search}%", f"%{search}%", f"%{search}%"])
            if min_pts:
                sql += " AND p.points_cost >= ?"
                params.append(int(min_pts))
            if max_pts:
                sql += " AND p.points_cost <= ?"
                params.append(int(max_pts))
            if avail and avail != 'all':
                sql += " AND p.availability_status = ?"
                params.append(avail)
            if fulfilment and fulfilment != 'all':
                sql += " AND p.fulfilment_type = ?"
                params.append(fulfilment)

            if sort_by == 'points_asc':
                sql += " ORDER BY p.points_cost ASC"
            elif sort_by == 'points_desc':
                sql += " ORDER BY p.points_cost DESC"
            elif sort_by == 'newest':
                sql += " ORDER BY p.created_at DESC"
            else:
                sql += " ORDER BY p.is_featured DESC, p.is_popular DESC, p.id ASC"

            rows = conn.execute(sql, params).fetchall()
            conn.close()
            products = []
            for r in rows:
                item = dict(r)
                try:
                    item['features'] = json.loads(item.get('features_json') or '[]')
                    item['specifications'] = json.loads(item.get('specifications_json') or '{}')
                    item['galleryImages'] = json.loads(item.get('gallery_images_json') or '[]')
                except Exception:
                    pass
                products.append(item)
            return self.send_json(200, products)

        if path.startswith('/api/rewards/products/'):
            product_id = path.replace('/api/rewards/products/', '')
            conn = get_db()
            row = conn.execute("""
                SELECT p.*, c.name as category_name 
                FROM reward_products p 
                LEFT JOIN reward_categories c ON p.category_id = c.id 
                WHERE p.id = ?
            """, (product_id,)).fetchone()
            conn.close()
            if row:
                item = dict(row)
                try:
                    item['features'] = json.loads(item.get('features_json') or '[]')
                    item['specifications'] = json.loads(item.get('specifications_json') or '{}')
                    item['galleryImages'] = json.loads(item.get('gallery_images_json') or '[]')
                except Exception:
                    pass
                return self.send_json(200, item)
            return self.send_json(404, {'error': 'Reward product not found'})

        if path == '/api/rewards/wallet':
            user_id = query.get('user_id', ['USR-001'])[0]
            conn = get_db()
            txs = conn.execute("""
                SELECT * FROM green_wallet_transactions 
                WHERE user_id = ? 
                ORDER BY created_at DESC, id DESC
            """, (user_id,)).fetchall()
            
            # Compute current balance, total earned and total redeemed
            balance = 0
            earned = 0
            redeemed = 0
            for t in txs:
                pts = t['points']
                if pts > 0:
                    earned += pts
                else:
                    redeemed += abs(pts)
            balance = earned - redeemed
            conn.close()
            return self.send_json(200, {
                'userId': user_id,
                'balance': balance,
                'totalEarned': earned,
                'totalRedeemed': redeemed,
                'transactions': [dict(t) for t in txs]
            })

        if path == '/api/rewards/orders':
            user_id = query.get('user_id', [None])[0]
            status = query.get('status', [None])[0]
            search = query.get('search', [None])[0]
            conn = get_db()
            sql = "SELECT * FROM reward_orders WHERE 1=1"
            params = []
            if user_id and user_id != 'ALL' and user_id != 'admin':
                sql += " AND user_id = ?"
                params.append(user_id)
            if status and status != 'All':
                sql += " AND status = ?"
                params.append(status)
            if search:
                sql += " AND (id LIKE ? OR product_name LIKE ? OR user_name LIKE ?)"
                params.extend([f"%{search}%", f"%{search}%", f"%{search}%"])
            sql += " ORDER BY created_at DESC"
            rows = conn.execute(sql, params).fetchall()
            conn.close()
            return self.send_json(200, [dict(r) for r in rows])

        if path.startswith('/api/rewards/orders/'):
            order_id = path.replace('/api/rewards/orders/', '')
            conn = get_db()
            order = conn.execute("SELECT * FROM reward_orders WHERE id = ?", (order_id,)).fetchone()
            if not order:
                conn.close()
                return self.send_json(404, {'error': 'Redemption order not found'})
            history = conn.execute("SELECT * FROM reward_order_status_history WHERE order_id = ? ORDER BY timestamp ASC, id ASC", (order_id,)).fetchall()
            conn.close()
            res = dict(order)
            res['statusTimeline'] = [dict(h) for h in history]
            return self.send_json(200, res)

        if path == '/api/rewards/wishlist':
            user_id = query.get('user_id', ['USR-001'])[0]
            conn = get_db()
            rows = conn.execute("""
                SELECT p.*, c.name as category_name, w.created_at as saved_at
                FROM reward_wishlist w
                JOIN reward_products p ON w.product_id = p.id
                LEFT JOIN reward_categories c ON p.category_id = c.id
                WHERE w.user_id = ?
                ORDER BY w.created_at DESC
            """, (user_id,)).fetchall()
            conn.close()
            wishlist = []
            for r in rows:
                item = dict(r)
                try:
                    item['features'] = json.loads(item.get('features_json') or '[]')
                    item['specifications'] = json.loads(item.get('specifications_json') or '{}')
                except Exception:
                    pass
                wishlist.append(item)
            return self.send_json(200, wishlist)

        if path == '/api/rewards/addresses':
            user_id = query.get('user_id', ['USR-001'])[0]
            conn = get_db()
            rows = conn.execute("SELECT * FROM reward_addresses WHERE user_id = ? ORDER BY is_default DESC, id DESC", (user_id,)).fetchall()
            conn.close()
            return self.send_json(200, [dict(r) for r in rows])

        if path == '/api/rewards/analytics':
            conn = get_db()
            total_orders = conn.execute("SELECT COUNT(*), COALESCE(SUM(points_spent), 0) FROM reward_orders").fetchone()
            status_counts = conn.execute("SELECT status, COUNT(*) FROM reward_orders GROUP BY status").fetchall()
            top_products = conn.execute("""
                SELECT product_id, product_name, COUNT(*) as redemption_count, SUM(points_spent) as points_total
                FROM reward_orders
                GROUP BY product_id, product_name
                ORDER BY redemption_count DESC LIMIT 5
            """).fetchall()
            low_stock = conn.execute("SELECT COUNT(*) FROM reward_products WHERE stock_quantity <= 10 AND fulfilment_type = 'physical'").fetchone()[0]
            out_of_stock = conn.execute("SELECT COUNT(*) FROM reward_products WHERE stock_quantity = 0 AND fulfilment_type = 'physical'").fetchone()[0]
            conn.close()
            return self.send_json(200, {
                'totalOrders': total_orders[0],
                'totalPointsRedeemed': total_orders[1],
                'ordersByStatus': {s[0]: s[1] for s in status_counts},
                'topProducts': [dict(tp) for tp in top_products],
                'lowStockAlerts': low_stock,
                'outOfStockAlerts': out_of_stock
            })

        # Diagnostic Client Log
        if path == '/client-log':
            err = query.get('err', [''])[0]
            rej = query.get('rejection', [''])[0]
            msg = query.get('msg', [''])[0]
            print(f"[CLIENT LOG] Error: {err} | Rejection: {rej} | Msg: {msg}", flush=True)
            return self.send_json(200, {'status': 'logged'})

        # KARN Tracking API
        if path == '/api/karn/track':
            target_id = query.get('id', [query.get('donationId', [None])[0]])[0]
            conn = get_db()
            if target_id:
                pickup = conn.execute("""
                    SELECT * FROM karn_pickups 
                    WHERE id = ? OR donation_id = ? OR reference_id = ?
                    ORDER BY created_at DESC LIMIT 1
                """, (target_id, target_id, target_id)).fetchone()
            else:
                pickup = conn.execute("SELECT * FROM karn_pickups ORDER BY created_at DESC LIMIT 1").fetchone()
            
            if not pickup:
                don = None
                if target_id:
                    don = conn.execute("SELECT * FROM donations WHERE id = ?", (target_id,)).fetchone()
                if don:
                    ref_id = f"SANJ-2026-{abs(hash(don['id'])) % 9000 + 1000}"
                    conn.execute("""
                        INSERT INTO karn_pickups (
                            id, donation_id, reference_id, pathway, status,
                            donor_id, donor_name, pickup_address, pickup_lat, pickup_lng, pickup_window
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, (
                        f"KARN-{don['id']}", don['id'], ref_id, don['pathway'] or 'people',
                        don['karn_status'] or 'Waiting for Receiver',
                        don['donor_id'], don['donor_name'], don['address'], don['lat'], don['lng'],
                        don['karn_pickup_window'] or 'Within 2 hours'
                    ))
                    conn.commit()
                    pickup = conn.execute("SELECT * FROM karn_pickups WHERE id = ?", (f"KARN-{don['id']}",)).fetchone()

            if not pickup:
                conn.close()
                return self.send_json(404, {'error': 'No KARN pickup record found'})

            p_dict = dict(pickup)
            remaining_seconds = 0
            if p_dict.get('eta_timestamp') and p_dict.get('status') in ['Agent Assigned', 'Agent on the Way', 'Agent Arrived']:
                try:
                    eta_dt = datetime.fromisoformat(p_dict['eta_timestamp'])
                    diff = (eta_dt - datetime.now()).total_seconds()
                    remaining_seconds = max(0, int(diff))
                except Exception:
                    remaining_seconds = (p_dict.get('eta_minutes') or 15) * 60
            p_dict['etaSecondsRemaining'] = remaining_seconds

            stages = [
                'Waiting for Receiver',
                'Receiver Accepted',
                'KARN Agent Assignment Pending',
                'Agent Assigned',
                'Agent on the Way',
                'Agent Arrived',
                'Pickup Completed',
                'Delivery Completed'
            ]
            current_status = p_dict.get('status', 'Waiting for Receiver')
            curr_idx = stages.index(current_status) if current_status in stages else 0
            p_dict['lifecycleStages'] = stages
            p_dict['currentStageIndex'] = curr_idx

            conn.close()
            return self.send_json(200, p_dict)

        # KARN Agents List API
        if path == '/api/karn/agents':
            conn = get_db()
            agents = conn.execute("SELECT * FROM karn_agents ORDER BY rating DESC, rescues_completed DESC").fetchall()
            conn.close()
            return self.send_json(200, [dict(a) for a in agents])

        # Pathway Details API
        if path == '/api/pathways/details':
            conn = get_db()
            people_orgs = conn.execute("SELECT * FROM organisations WHERE category = 'Human Food Receiver' AND verification_status = 'Verified'").fetchall()
            animal_orgs = conn.execute("SELECT * FROM organisations WHERE category = 'Animal Welfare' AND verification_status = 'Verified'").fetchall()
            compost_orgs = conn.execute("SELECT * FROM organisations WHERE category = 'Organic Waste Facility' AND verification_status = 'Verified'").fetchall()
            conn.close()

            pathways_data = {
                'people': {
                    'id': 'people',
                    'name': 'Food for People',
                    'tagline': 'Human Redistribution (Highest Impact Priority)',
                    'badge': 'SDG 2: Zero Hunger',
                    'icon': '🍲',
                    'accentColor': '#028090',
                    'description': 'Safe, untouched surplus food redirected to verified orphanages, shelters, old-age homes and community kitchens.',
                    'acceptedCategories': [
                        'Cooked Meals (Rice, Curry, Khichdi, Daal)',
                        'Fresh Bakery Products & Bread',
                        'Intact Packed Groceries & Dairy',
                        'Uncut Fresh Fruits & Vegetables',
                        'Banquet & Catering Surplus'
                    ],
                    'prohibitedItems': [
                        'Food past sensory or probe safety margins',
                        'Items left uncovered at room temp > 4 hours',
                        'Food with foul odor, mold, or discoloration',
                        'Half-eaten plate scraps'
                    ],
                    'safetyGuidelines': [
                        'Temperature probe check (> 60°C hot or < 5°C cold)',
                        'Hygiene packing in sealed stainless steel / dabbas',
                        'Safe-Until countdown clock active upon dispatch',
                        'Food handler hygiene declaration'
                    ],
                    'verifiedPartners': [
                        {
                            'id': o['id'],
                            'name': o['name'],
                            'contactPerson': o['contact_person'],
                            'phone': o['phone'],
                            'address': o['address'],
                            'capacity': '80-150 meals/day',
                            'requirements': 'Must be received within 3 hours of cooking. Low spice preferred.',
                            'facilities': o['facilities'],
                            'verified': True
                        } for o in people_orgs
                    ]
                },
                'animal': {
                    'id': 'animal',
                    'name': 'Suitable Animal Feed',
                    'tagline': 'Ethical Nutrition for Gaushalas & Animal Shelters',
                    'badge': 'Animal Welfare & Care',
                    'icon': '🐾',
                    'accentColor': '#456990',
                    'description': 'Clean, wholesome food unsuitable or unrequested for human consumption redirected to cattle, stray animal shelters and gaushalas.',
                    'acceptedCategories': [
                        'Plain Chapatis, Rotis & Plain Boiled Rice',
                        'Fresh Vegetable Peels, Rinds & Green Leaves',
                        'Surplus Fodder & Grain Byproducts',
                        'Unflavored Bread & Porridge',
                        'Clean Raw Plant Trimmings'
                    ],
                    'prohibitedItems': [
                        'Spoiled, fermented, toxic, or moldy items',
                        'Heavy onion, garlic, or oily spicy gravies',
                        'Chocolate, caffeine, tea leaves, or alcohol',
                        'Cooked chicken/mutton bones (splintering hazard)',
                        'ANY plastic bags, cling wraps, or staples'
                    ],
                    'safetyGuidelines': [
                        'Must pass visual inspection for mold and decay',
                        'Sorted cleanly from packaging materials',
                        'Designate target animal group (Cattle, Canines, Birds)'
                    ],
                    'verifiedPartners': [
                        {
                            'id': o['id'],
                            'name': o['name'],
                            'contactPerson': o['contact_person'],
                            'phone': o['phone'],
                            'address': o['address'],
                            'capacity': '300-800 kg/day',
                            'requirements': 'Clean raw vegetable peels or plain chapatis. Zero plastic guaranteed.',
                            'facilities': o['facilities'],
                            'verified': True
                        } for o in animal_orgs
                    ]
                },
                'compost': {
                    'id': 'compost',
                    'name': 'Compost & Organic Recovery',
                    'tagline': 'Biomethanation & Soil Regeneration',
                    'badge': 'SDG 12 & 13: Zero Landfill',
                    'icon': '🌱',
                    'accentColor': '#23634D',
                    'description': 'Inedible organic materials converted to nutrient-rich compost, bio-CNG or black soldier fly larvae feed.',
                    'acceptedCategories': [
                        'Spoiled, expired, or plate-scraping food waste',
                        'Fruit pulps, vegetable rejects & market trimmings',
                        'Coffee grounds, tea bags & eggshells',
                        'Grease-trap organics & brewery spent grains',
                        'Floral temple waste & dry leaves'
                    ],
                    'prohibitedItems': [
                        'Non-biodegradable plastics & foils',
                        'Chemical sanitizers, glass, or metals',
                        'Medical or hazardous sanitary items'
                    ],
                    'safetyGuidelines': [
                        'Zero-Plastic packaging verification mandatory',
                        'Segregated at source in wet waste bins',
                        'Direct routing to municipal bio-methanation or aerobic composters'
                    ],
                    'verifiedPartners': [
                        {
                            'id': o['id'],
                            'name': o['name'],
                            'contactPerson': o['contact_person'],
                            'phone': o['phone'],
                            'address': o['address'],
                            'capacity': '1.2 - 15 Tonnes/day',
                            'requirements': 'Source-segregated organic wet waste. No single-use plastic.',
                            'facilities': o['facilities'],
                            'verified': True
                        } for o in compost_orgs
                    ]
                }
            }
            return self.send_json(200, pathways_data)

        # Transportation Requests API
        if path == '/api/transport/requests':
            target_id = query.get('id', [None])[0]
            donor_id = query.get('donorId', [None])[0]
            receiver_id = query.get('receiverId', [None])[0]
            provider_id = query.get('providerId', [None])[0]
            status_filter = query.get('status', [None])[0]

            conn = get_db()
            if target_id:
                tr = conn.execute("SELECT * FROM transportation_requests WHERE id = ? OR donation_id = ? OR reference_id = ? LIMIT 1", (target_id, target_id, target_id)).fetchone()
                conn.close()
                if tr:
                    return self.send_json(200, dict(tr))
                return self.send_json(404, {'error': 'Transportation request not found'})

            sql = "SELECT * FROM transportation_requests WHERE 1=1"
            params = []
            if donor_id:
                sql += " AND (donor_id = ? OR donor_id = 'ORG-D1')"
                params.append(donor_id)
            if receiver_id:
                sql += " AND receiver_id = ?"
                params.append(receiver_id)
            if provider_id:
                sql += " AND assigned_provider_id = ?"
                params.append(provider_id)
            if status_filter and status_filter != 'All':
                sql += " AND status = ?"
                params.append(status_filter)
            sql += " ORDER BY created_at DESC"

            rows = conn.execute(sql, params).fetchall()
            conn.close()
            return self.send_json(200, [dict(r) for r in rows])

        # Funding Ledger & Available Allocations API
        if path == '/api/transport/funding':
            conn = get_db()
            sources = [dict(s) for s in conn.execute("SELECT * FROM funding_sources ORDER BY total_budget DESC").fetchall()]
            expenses = [dict(e) for e in conn.execute("SELECT * FROM transportation_expenses ORDER BY created_at DESC").fetchall()]
            pending_requests = [dict(r) for r in conn.execute("""
                SELECT * FROM transportation_requests 
                WHERE transport_mode = 'sponsored' AND funding_status IN ('Unfunded', 'Funding Requested', 'Under Review')
                ORDER BY created_at DESC
            """).fetchall()]
            
            total_budget = sum(float(s.get('total_budget', 0)) for s in sources)
            total_allocated = sum(float(s.get('allocated_amount', 0)) for s in sources)
            total_spent = sum(float(s.get('spent_amount', 0)) for s in sources)
            available_funds = max(0.0, total_budget - total_allocated)

            conn.close()
            return self.send_json(200, {
                'fundingSources': sources,
                'expenses': expenses,
                'pendingRequests': pending_requests,
                'summary': {
                    'totalBudget': total_budget,
                    'totalAllocated': total_allocated,
                    'totalSpent': total_spent,
                    'availableFunds': available_funds,
                    'pendingCount': len(pending_requests)
                }
            })

        # Logistics Providers List API
        if path == '/api/transport/providers':
            conn = get_db()
            provs = conn.execute("SELECT * FROM logistics_providers WHERE is_active = 1 ORDER BY rating DESC, completed_trips DESC").fetchall()
            conn.close()
            return self.send_json(200, [dict(p) for p in provs])

        # Static file fallback
        super().do_GET()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        body = self.read_body()

        # Auth Register
        if path == '/api/auth/register':
            name = body.get('name')
            email = body.get('email')
            password = body.get('password', 'default_pass')
            role = body.get('role', 'Food Donor')
            phone = body.get('phone', '')
            org_id = body.get('organisationId')

            if not name or not email or not role:
                return self.send_json(400, {'error': 'Name, email, and role are required'})

            conn = get_db()
            user_id = f"USR-{int(datetime.now().timestamp() * 1000) % 1000000}"
            try:
                conn.execute("""
                    INSERT INTO users (id, name, email, password_hash, role, phone, organisation_id)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (user_id, name, email, password, role, phone, org_id))
                conn.commit()
                conn.close()
                return self.send_json(201, {
                    'message': 'Registration successful',
                    'user': {
                        'id': user_id,
                        'name': name,
                        'email': email,
                        'role': role,
                        'phone': phone,
                        'organisationId': org_id
                    }
                })
            except sqlite3.IntegrityError:
                conn.close()
                return self.send_json(400, {'error': 'Email is already registered'})

        # Auth Login
        if path == '/api/auth/login':
            email = body.get('email')
            password = body.get('password')
            conn = get_db()
            user = conn.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
            conn.close()
            if user:
                return self.send_json(200, {
                    'message': 'Login successful',
                    'user': dict(user)
                })
            return self.send_json(401, {'error': 'Invalid credentials. User not found.'})

        # Reset Password
        if path == '/api/auth/reset-password':
            email = body.get('email')
            return self.send_json(200, {
                'message': f'If {email} is registered, password reset instructions have been recorded.'
            })

        # Create Organisation Registration
        if path == '/api/organisations':
            name = body.get('name')
            category = body.get('category', 'Food Donor')
            contact = body.get('contactPerson', '')
            phone = body.get('phone', '')
            email = body.get('email', '')
            address = body.get('address', '')
            city = body.get('city', 'Indore')
            district = body.get('district', 'Indore')
            state = body.get('state', 'Madhya Pradesh')
            pincode = body.get('pincode', '452001')
            lat = float(body.get('lat') or 22.7196)
            lng = float(body.get('lng') or 75.8577)
            desc = body.get('description', '')
            hours = body.get('operatingHours', '09:00 - 21:00')
            facilities = body.get('facilities', '')

            org_id = f"ORG-{int(datetime.now().timestamp() * 1000) % 1000000}"
            conn = get_db()
            conn.execute("""
                INSERT INTO organisations (
                    id, name, category, contact_person, phone, email, address,
                    city, district, state, pincode, lat, lng, description,
                    operating_hours, facilities, photos_json, verification_status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '[]', 'Pending')
            """, (org_id, name, category, contact, phone, email, address, city, district, state, pincode, lat, lng, desc, hours, facilities))
            conn.commit()
            conn.close()
            return self.send_json(201, {'message': 'Organisation submitted for verification', 'id': org_id})

        # Report Syntax from Diagnostic Test
        if path == '/report-syntax':
            with open('syntax_results.txt', 'w', encoding='utf-8') as f:
                f.write(json.dumps(body, indent=2))
            print(f"[SYNTAX REPORT] Saved results with {len(body)} files tested", flush=True)
            return self.send_json(200, {'ok': True})

        # KARN Agent Assignment API
        if path == '/api/karn/assign':
            pickup_id = body.get('pickupId')
            donation_id = body.get('donationId')
            agent_id = body.get('agentId')
            eta_mins = int(body.get('etaMinutes') or 18)
            eta_time = (datetime.now() + timedelta(minutes=eta_mins)).isoformat()

            conn = get_db()
            agent = None
            if agent_id:
                agent = conn.execute("SELECT * FROM karn_agents WHERE id = ?", (agent_id,)).fetchone()
            if not agent:
                agent = conn.execute("SELECT * FROM karn_agents WHERE status = 'Available' LIMIT 1").fetchone()

            agent_id = agent['id'] if agent else 'AGENT-001'
            agent_name = agent['name'] if agent else 'Kunal Verma'
            agent_phone = agent['phone'] if agent else '+91 98260 11223'
            agent_vehicle = agent['vehicle'] if agent else 'Hero Electric E-Scooter (MP-09-EV-4421)'

            conn.execute("""
                UPDATE karn_pickups SET
                    agent_id = ?, agent_name = ?, agent_phone = ?, agent_vehicle = ?,
                    status = 'Agent Assigned', eta_timestamp = ?, eta_minutes = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ? OR donation_id = ?
            """, (agent_id, agent_name, agent_phone, agent_vehicle, eta_time, eta_mins, pickup_id, donation_id))
            
            if donation_id:
                conn.execute("""
                    UPDATE donations SET
                        karn_status = 'Agent Assigned', karn_agent_id = ?, karn_agent_name = ?,
                        karn_agent_phone = ?, karn_agent_vehicle = ?, karn_eta_timestamp = ?,
                        karn_eta_minutes = ?, updated_at = CURRENT_TIMESTAMP
                    WHERE id = ?
                """, (agent_id, agent_name, agent_phone, agent_vehicle, eta_time, eta_mins, donation_id))
            
            conn.commit()
            updated = conn.execute("SELECT * FROM karn_pickups WHERE id = ? OR donation_id = ?", (pickup_id, donation_id)).fetchone()
            conn.close()
            return self.send_json(200, {'message': 'KARN Agent assigned successfully', 'pickup': dict(updated) if updated else {}})

        # KARN Status Transition API
        if path == '/api/karn/status':
            pickup_id = body.get('pickupId')
            donation_id = body.get('donationId')
            new_status = body.get('status', 'Agent on the Way')
            delay_reason = body.get('delayReason')
            
            conn = get_db()
            now_str = datetime.now().strftime('%Y-%m-%d %H:%M')
            sql = "UPDATE karn_pickups SET status = ?, updated_at = CURRENT_TIMESTAMP"
            params = [new_status]
            
            if new_status == 'Pickup Completed':
                sql += ", pickup_completed_at = ?"
                params.append(now_str)
            elif new_status == 'Delivery Completed':
                sql += ", delivery_completed_at = ?"
                params.append(now_str)
            
            if delay_reason:
                sql += ", delay_reason = ?"
                params.append(delay_reason)

            sql += " WHERE id = ? OR donation_id = ?"
            params.extend([pickup_id, donation_id])

            conn.execute(sql, params)
            if donation_id:
                conn.execute("UPDATE donations SET karn_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", (new_status, donation_id))
            
            conn.commit()
            updated = conn.execute("SELECT * FROM karn_pickups WHERE id = ? OR donation_id = ?", (pickup_id, donation_id)).fetchone()
            conn.close()
            return self.send_json(200, {'message': f'Status updated to {new_status}', 'pickup': dict(updated) if updated else {}})

        # Create Food / Surplus Donation
        if path == '/api/donations':
            title = body.get('title')
            pathway = body.get('pathway', 'people')
            category = body.get('category', 'Cooked Meals')
            quantity = float(body.get('quantity') or body.get('plates') or 50)
            unit = body.get('unit', 'plates' if pathway == 'people' else 'kg')
            veg_type = body.get('vegType', 'Veg')
            cooked_mins = int(body.get('cookedMinutesAgo') or 30)
            prep_time = body.get('prepTime', datetime.now().strftime('%H:%M'))
            expiry_time = body.get('expiryTime', '')
            storage = body.get('storage', 'Room Temp')
            address = body.get('address', 'Indore')
            lat = float(body.get('lat') or 22.7196)
            lng = float(body.get('lng') or 75.8577)
            dietary = json.dumps(body.get('dietaryTags') or [])
            allergens = json.dumps(body.get('allergens') or [])
            donor_id = body.get('donorId', 'ORG-D1')
            donor_name = body.get('donorName', 'Registered Food Donor')
            
            location_type = body.get('locationType', 'manual')
            accuracy_meters = float(body.get('accuracyMeters') or 0)
            pickup_window = body.get('pickupWindow', 'Within 2 hours')
            intended_animal = body.get('intendedAnimal', '')
            waste_condition = body.get('wasteCondition', '')
            packaging_separated = 1 if body.get('packagingSeparated', True) else 0

            # Donor-controlled transportation preference
            transport_mode = body.get('transportMode', 'sponsored') # 'donor_paid', 'self_arranged', 'sponsored'
            self_arranged_type = body.get('selfArrangedType') # 'donor_delivery', 'receiver_pickup'
            quoted_amount = float(body.get('quotedAmount') or (240.0 if transport_mode == 'donor_paid' else 0.0))
            donor_quote_approved = 1 if body.get('donorQuoteApproved') else 0
            funding_source_id = body.get('fundingSourceId')
            funding_source_name = body.get('fundingSourceName')

            if transport_mode == 'donor_paid':
                transport_status = 'Provider Assigned' if donor_quote_approved else 'Awaiting Donor Approval'
                funding_status = 'Approved' if donor_quote_approved else 'Unfunded'
            elif transport_mode == 'self_arranged':
                transport_status = 'Awaiting Receiver Acceptance'
                funding_status = 'Not Required'
            else: # sponsored
                transport_status = 'Awaiting Sponsorship'
                funding_status = 'Funding Requested'

            unique_num = int(datetime.now().timestamp() * 1000) % 9000 + 1000
            donation_id = f"DON-{unique_num}"
            ref_id = f"SANJ-2026-{unique_num}"
            req_id = f"TR-{unique_num}"

            custody = json.dumps([{
                'time': datetime.now().strftime('%H:%M'),
                'event': f"Listed via {pathway.capitalize()} Pathway by {donor_name}. Transport mode: {transport_mode}",
                'by': donor_name
            }])
            safety = json.dumps(body.get('safetyChecks') or {})

            conn = get_db()
            conn.execute("""
                INSERT INTO donations (
                    id, donor_id, donor_name, title, category, quantity, unit, veg_type,
                    cooked_minutes_ago, prep_time, expiry_time, storage, address, lat, lng,
                    dietary_tags_json, allergens_json, status, custody_log_json, safety_checks_json,
                    pathway, karn_status, karn_pickup_window, location_type, accuracy_meters,
                    intended_animal, waste_condition, packaging_separated,
                    transport_mode, self_arranged_type, quoted_amount, donor_quote_approved, transport_status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Available', ?, ?, ?, 'Waiting for Receiver', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                donation_id, donor_id, donor_name, title, category, quantity, unit, veg_type,
                cooked_mins, prep_time, expiry_time, storage, address, lat, lng,
                dietary, allergens, custody, safety,
                pathway, pickup_window, location_type, accuracy_meters,
                intended_animal, waste_condition, packaging_separated,
                transport_mode, self_arranged_type, quoted_amount, donor_quote_approved, transport_status
            ))

            conn.execute("""
                INSERT INTO transportation_requests (
                    id, donation_id, reference_id, donor_id, donor_name,
                    transport_mode, self_arranged_type, status,
                    quoted_amount, donor_quote_approved,
                    funding_source_id, funding_source_name, funding_status,
                    pickup_address, pickup_lat, pickup_lng, notes
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                req_id, donation_id, ref_id, donor_id, donor_name,
                transport_mode, self_arranged_type, transport_status,
                quoted_amount, donor_quote_approved,
                funding_source_id, funding_source_name, funding_status,
                address, lat, lng,
                f"Donor selected '{transport_mode}' transport mode."
            ))

            if transport_mode == 'donor_paid' and donor_quote_approved and quoted_amount > 0:
                exp_id = f"EXP-{unique_num}"
                conn.execute("""
                    INSERT INTO transportation_expenses (
                        id, request_id, donation_id, payer_type, payer_name,
                        provider_id, provider_name, amount, status, notes
                    ) VALUES (?, ?, ?, 'donor', ?, 'PROV-001', 'Indore Green EV Logistics', ?, 'Payment Pending', 'Donor approved quoted amount during donation posting')
                """, (exp_id, req_id, donation_id, donor_name, quoted_amount))

            conn.execute("""
                INSERT INTO karn_pickups (
                    id, donation_id, reference_id, pathway, status,
                    donor_id, donor_name, pickup_address, pickup_lat, pickup_lng, pickup_window,
                    transport_mode, self_arranged_type, quoted_amount, donor_quote_approved, notes
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                f"KARN-{unique_num}", donation_id, ref_id, pathway,
                'Agent Assigned' if (transport_mode == 'donor_paid' and donor_quote_approved) else 'Waiting for Receiver',
                donor_id, donor_name, address, lat, lng, pickup_window,
                transport_mode, self_arranged_type, quoted_amount, donor_quote_approved,
                f"Auto-generated pickup coordination for {title} ({quantity} {unit}). Transport mode: {transport_mode}."
            ))

            conn.commit()
            conn.close()
            return self.send_json(201, {
                'message': 'Donation posted and KARN pickup initialized',
                'id': donation_id,
                'referenceId': ref_id,
                'pathway': pathway,
                'transportMode': transport_mode,
                'transportStatus': transport_status,
                'karnStatus': 'Waiting for Receiver'
            })

        # Concurrency-Safe Donation Allocation
        if path.endswith('/allocate'):
            parts = path.strip('/').split('/')
            donation_id = parts[2]
            receiver_id = body.get('receiverId')
            claim_qty = float(body.get('quantity') or 0)

            conn = get_db()
            cursor = conn.cursor()
            try:
                # Concurrency lock / transaction
                cursor.execute("BEGIN IMMEDIATE")
                donation = cursor.execute("SELECT * FROM donations WHERE id = ?", (donation_id,)).fetchone()
                if not donation:
                    cursor.execute("ROLLBACK")
                    conn.close()
                    return self.send_json(404, {'error': 'Donation not found'})

                total_qty = float(donation['quantity'])
                existing_allocated = cursor.execute("SELECT COALESCE(SUM(allocated_quantity), 0) FROM donation_allocations WHERE donation_id = ? AND status != 'Cancelled'", (donation_id,)).fetchone()[0]

                if claim_qty <= 0:
                    claim_qty = total_qty - existing_allocated

                if (existing_allocated + claim_qty) > total_qty:
                    cursor.execute("ROLLBACK")
                    conn.close()
                    return self.send_json(409, {
                        'error': f'Concurrency conflict: Only {total_qty - existing_allocated} plates remaining. Cannot allocate {claim_qty}.'
                    })

                alloc_id = f"ALC-{int(datetime.now().timestamp() * 1000) % 1000000}"
                cursor.execute("""
                    INSERT INTO donation_allocations (id, donation_id, receiver_id, allocated_quantity, status)
                    VALUES (?, ?, ?, ?, 'Reserved')
                """, (alloc_id, donation_id, receiver_id, claim_qty))

                # Update donation status
                new_status = 'Accepted'
                cursor.execute("""
                    UPDATE donations
                    SET status = ?, assigned_receiver_id = ?, updated_at = CURRENT_TIMESTAMP
                    WHERE id = ?
                """, (new_status, receiver_id, donation_id))

                # Update receiver details in transportation_requests & karn_pickups
                receiver_org = cursor.execute("SELECT * FROM organisations WHERE id = ?", (receiver_id,)).fetchone()
                rcv_name = receiver_org['name'] if receiver_org else 'Verified Receiving Organisation'
                rcv_addr = receiver_org['address'] if receiver_org else 'Receiver Delivery Dock, Indore'
                rcv_lat = float(receiver_org['lat']) if receiver_org and receiver_org['lat'] else 22.7410
                rcv_lng = float(receiver_org['lng']) if receiver_org and receiver_org['lng'] else 75.8850

                cursor.execute("""
                    UPDATE transportation_requests SET
                        receiver_id = ?, receiver_name = ?, delivery_address = ?,
                        delivery_lat = ?, delivery_lng = ?,
                        status = CASE
                            WHEN transport_mode = 'self_arranged' THEN 'Pickup Scheduled'
                            WHEN transport_mode = 'donor_paid' AND donor_quote_approved = 1 THEN 'Provider Assigned'
                            WHEN transport_mode = 'donor_paid' AND donor_quote_approved = 0 THEN 'Awaiting Donor Approval'
                            ELSE 'Awaiting Sponsorship'
                        END,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE donation_id = ?
                """, (receiver_id, rcv_name, rcv_addr, rcv_lat, rcv_lng, donation_id))

                cursor.execute("""
                    UPDATE karn_pickups SET
                        receiver_id = ?, receiver_name = ?, delivery_address = ?,
                        status = 'Receiver Accepted', updated_at = CURRENT_TIMESTAMP
                    WHERE donation_id = ?
                """, (receiver_id, rcv_name, rcv_addr, donation_id))

                cursor.execute("COMMIT")
                conn.close()
                return self.send_json(200, {
                    'message': 'Allocation successful with concurrency check',
                    'allocationId': alloc_id,
                    'allocatedQuantity': claim_qty
                })
            except Exception as e:
                cursor.execute("ROLLBACK")
                conn.close()
                return self.send_json(500, {'error': str(e)})

        # Create Organic Waste Listing
        if path == '/api/waste':
            source_id = body.get('sourceOrgId', 'ORG-D1')
            source_name = body.get('sourceName', 'Registered Donor')
            category = body.get('category', 'Vegetable peels & trimmings')
            material = body.get('materialDescription', '')
            qty = float(body.get('quantityKg') or 20)
            condition = body.get('wasteCondition', 'Fresh Organic Residue')
            pickup_loc = body.get('pickupLocation', 'Backdoor loading dock')
            lat = float(body.get('lat') or 22.7196)
            lng = float(body.get('lng') or 75.8577)
            pkg_sep = int(body.get('packagingSeparated') or 1)
            pathway = body.get('recoveryPathway', 'Pathway C: Composting & Organic Recovery')
            target_partner = body.get('targetPartnerId')

            waste_id = f"WST-{int(datetime.now().timestamp() * 1000) % 1000000}"
            conn = get_db()
            conn.execute("""
                INSERT INTO waste_listings (
                    id, source_org_id, source_name, category, material_description,
                    quantity_kg, waste_condition, pickup_location, lat, lng,
                    packaging_separated, recovery_pathway, target_partner_id, status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Registered')
            """, (waste_id, source_id, source_name, category, material, qty, condition, pickup_loc, lat, lng, pkg_sep, pathway, target_partner))
            conn.commit()
            conn.close()
            return self.send_json(201, {'message': 'Waste listing registered', 'id': waste_id})

        # Donor Approves / Rejects Quoted Amount for Donor-Paid Logistics
        if path == '/api/transport/quote/approve':
            req_id = body.get('requestId')
            donation_id = body.get('donationId')
            approved = bool(body.get('approved', True))
            payer_name = body.get('payerName', 'Donor')

            conn = get_db()
            tr = conn.execute("SELECT * FROM transportation_requests WHERE id = ? OR donation_id = ?", (req_id, donation_id)).fetchone()
            if not tr:
                conn.close()
                return self.send_json(404, {'error': 'Transportation request not found'})

            now_str = datetime.now().strftime('%Y-%m-%d %H:%M')
            if approved:
                prov = conn.execute("SELECT * FROM logistics_providers WHERE is_active = 1 AND verification_status = 'Verified' ORDER BY completed_trips ASC LIMIT 1").fetchone()
                prov_id = prov['id'] if prov else 'PROV-001'
                prov_name = prov['name'] if prov else 'Indore Green EV Logistics'
                prov_phone = prov['phone'] if prov else '+91 98260 22334'
                prov_vehicle = prov['vehicle_type'] if prov else 'EV Cargo 3-Wheeler'

                conn.execute("""
                    UPDATE transportation_requests SET
                        donor_quote_approved = 1,
                        donor_quote_approved_at = ?,
                        status = 'Provider Assigned',
                        assigned_provider_id = ?,
                        assigned_provider_name = ?,
                        assigned_provider_phone = ?,
                        assigned_provider_vehicle = ?,
                        estimated_arrival = '30-45 mins (Pickup Scheduled)',
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = ?
                """, (now_str, prov_id, prov_name, prov_phone, prov_vehicle, tr['id']))

                conn.execute("""
                    UPDATE karn_pickups SET
                        status = 'Agent Assigned',
                        agent_id = ?, agent_name = ?, agent_phone = ?, agent_vehicle = ?,
                        donor_quote_approved = 1,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = ? OR donation_id = ?
                """, (prov_id, prov_name, prov_phone, prov_vehicle, tr['id'], tr['donation_id']))

                exp_id = f"EXP-{int(datetime.now().timestamp() * 1000) % 1000000}"
                conn.execute("""
                    INSERT INTO transportation_expenses (
                        id, request_id, donation_id, payer_type, payer_name,
                        provider_id, provider_name, amount, status, notes
                    ) VALUES (?, ?, ?, 'donor', ?, ?, ?, ?, 'Payment Pending', 'Donor approved quoted logistics expense')
                """, (exp_id, tr['id'], tr['donation_id'], payer_name, prov_id, prov_name, tr['quoted_amount']))

                conn.commit()
                conn.close()
                return self.send_json(200, {
                    'message': 'Quotation approved. Logistics partner assigned.',
                    'status': 'Provider Assigned',
                    'assignedProvider': {'id': prov_id, 'name': prov_name, 'vehicle': prov_vehicle}
                })
            else:
                conn.execute("""
                    UPDATE transportation_requests SET
                        donor_quote_approved = 0,
                        status = 'Awaiting Donor Approval',
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = ?
                """, (tr['id'],))
                conn.commit()
                conn.close()
                return self.send_json(200, {'message': 'Quotation rejected. You may switch transportation preference.'})

        # Handover Confirmation (Donor Delivery or Receiver Self-Pickup)
        if path == '/api/transport/handover/confirm':
            req_id = body.get('requestId')
            donation_id = body.get('donationId')
            confirmed_by = body.get('confirmedBy', 'donor')
            notes = body.get('notes', '')

            conn = get_db()
            tr = conn.execute("SELECT * FROM transportation_requests WHERE id = ? OR donation_id = ?", (req_id, donation_id)).fetchone()
            if not tr:
                conn.close()
                return self.send_json(404, {'error': 'Transportation request not found'})

            donor_done = tr['donor_handover_confirmed']
            rcv_done = tr['receiver_handover_confirmed']

            if confirmed_by == 'donor':
                donor_done = 1
            elif confirmed_by == 'receiver':
                rcv_done = 1

            new_status = 'In Transit' if (donor_done and not rcv_done) else ('Completed' if (donor_done and rcv_done) else tr['status'])

            conn.execute("""
                UPDATE transportation_requests SET
                    donor_handover_confirmed = ?,
                    receiver_handover_confirmed = ?,
                    status = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            """, (donor_done, rcv_done, new_status, tr['id']))

            if new_status == 'Completed':
                conn.execute("UPDATE donations SET status = 'Completed', updated_at = CURRENT_TIMESTAMP WHERE id = ?", (tr['donation_id'],))
                conn.execute("UPDATE karn_pickups SET status = 'Delivery Completed', updated_at = CURRENT_TIMESTAMP WHERE donation_id = ?", (tr['donation_id'],))

            conn.commit()
            conn.close()
            return self.send_json(200, {
                'message': f'Handover confirmed by {confirmed_by}',
                'donorConfirmed': bool(donor_done),
                'receiverConfirmed': bool(rcv_done),
                'status': new_status
            })

        # Switch Transportation Mode
        if path == '/api/transport/switch-mode':
            req_id = body.get('requestId')
            donation_id = body.get('donationId')
            new_mode = body.get('newMode', 'donor_paid')
            self_type = body.get('selfArrangedType')
            quoted_cost = float(body.get('quotedCost') or 220)
            approved = 1 if body.get('donorQuoteApproved') else 0

            conn = get_db()
            tr = conn.execute("SELECT * FROM transportation_requests WHERE id = ? OR donation_id = ?", (req_id, donation_id)).fetchone()
            if not tr:
                conn.close()
                return self.send_json(404, {'error': 'Transportation request not found'})

            new_status = 'Awaiting Assignment' if (new_mode == 'donor_paid' and approved) else ('Awaiting Receiver Acceptance' if new_mode == 'self_arranged' else 'Awaiting Sponsorship')

            conn.execute("""
                UPDATE transportation_requests SET
                    transport_mode = ?,
                    self_arranged_type = ?,
                    quoted_amount = ?,
                    donor_quote_approved = ?,
                    status = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            """, (new_mode, self_type, quoted_cost, approved, new_status, tr['id']))

            conn.commit()
            conn.close()
            return self.send_json(200, {
                'message': f'Transportation arrangement switched to {new_mode}',
                'status': new_status,
                'transportMode': new_mode
            })

        # Admin Approves Sponsorship Allocation
        if path == '/api/transport/funding/approve':
            req_id = body.get('requestId')
            fund_id = body.get('fundingSourceId', 'FUND-001')
            action = body.get('action', 'approve')
            approved_amount = float(body.get('approvedAmount') or 220)
            admin_name = body.get('adminName', 'Municipal Admin')

            conn = get_db()
            tr = conn.execute("SELECT * FROM transportation_requests WHERE id = ?", (req_id,)).fetchone()
            if not tr:
                conn.close()
                return self.send_json(404, {'error': 'Transportation request not found'})

            fund = conn.execute("SELECT * FROM funding_sources WHERE id = ?", (fund_id,)).fetchone()

            if action == 'approve':
                if not fund:
                    conn.close()
                    return self.send_json(400, {'error': 'Specified funding source not found'})
                
                avail = fund['total_budget'] - fund['allocated_amount']
                if avail < approved_amount:
                    conn.close()
                    return self.send_json(400, {'error': f"Insufficient funds in {fund['name']}. Available: ₹{avail:.2f}"})

                conn.execute("""
                    UPDATE funding_sources SET
                        allocated_amount = allocated_amount + ?,
                        spent_amount = spent_amount + ?
                    WHERE id = ?
                """, (approved_amount, approved_amount, fund_id))

                prov = conn.execute("SELECT * FROM logistics_providers WHERE is_active = 1 AND verification_status = 'Verified' ORDER BY completed_trips ASC LIMIT 1").fetchone()
                prov_id = prov['id'] if prov else 'PROV-001'
                prov_name = prov['name'] if prov else 'Indore Green EV Logistics'
                prov_phone = prov['phone'] if prov else '+91 98260 22334'
                prov_vehicle = prov['vehicle_type'] if prov else 'EV Cargo 3-Wheeler'

                now_str = datetime.now().strftime('%Y-%m-%d %H:%M')
                conn.execute("""
                    UPDATE transportation_requests SET
                        funding_source_id = ?,
                        funding_source_name = ?,
                        funding_status = 'Approved',
                        status = 'Provider Assigned',
                        assigned_provider_id = ?,
                        assigned_provider_name = ?,
                        assigned_provider_phone = ?,
                        assigned_provider_vehicle = ?,
                        quoted_amount = ?,
                        estimated_arrival = '30-45 mins (Sponsored Courier En Route)',
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = ?
                """, (fund['id'], fund['name'], prov_id, prov_name, prov_phone, prov_vehicle, approved_amount, tr['id']))

                exp_id = f"EXP-{int(datetime.now().timestamp() * 1000) % 1000000}"
                conn.execute("""
                    INSERT INTO transportation_expenses (
                        id, request_id, donation_id, funding_source_id, payer_type, payer_name,
                        provider_id, provider_name, amount, status, notes, approved_by, approved_at
                    ) VALUES (?, ?, ?, ?, 'sponsor', ?, ?, ?, ?, 'Approved', ?, ?, ?)
                """, (exp_id, tr['id'], tr['donation_id'], fund['id'], fund['name'], prov_id, prov_name, approved_amount, f"Allocated from {fund['name']}", admin_name, now_str))

                conn.commit()
                conn.close()
                return self.send_json(200, {
                    'message': f"Sponsorship approved via {fund['name']}. Logistics partner assigned.",
                    'status': 'Provider Assigned',
                    'fundingStatus': 'Approved'
                })
            else:
                conn.execute("""
                    UPDATE transportation_requests SET
                        funding_status = 'Rejected',
                        status = 'Awaiting Sponsorship',
                        notes = 'Sponsorship allocation rejected or funds unavailable.',
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = ?
                """, (tr['id'],))
                conn.commit()
                conn.close()
                return self.send_json(200, {
                    'message': 'Sponsorship request rejected. Donor notified to switch arrangement.',
                    'fundingStatus': 'Rejected'
                })

        # Provider Status Update
        if path == '/api/transport/providers/status':
            req_id = body.get('requestId')
            new_status = body.get('status', 'In Transit')
            notes = body.get('notes', '')

            conn = get_db()
            conn.execute("""
                UPDATE transportation_requests SET
                    status = ?,
                    notes = COALESCE(?, notes),
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            """, (new_status, notes, req_id))
            conn.commit()
            conn.close()
            return self.send_json(200, {'message': f'Status updated to {new_status}'})

        # Toggle Crisis Mode
        if path == '/api/crisis/toggle':
            conn = get_db()
            curr = conn.execute("SELECT is_active FROM crisis_state WHERE id = 1").fetchone()
            new_val = 0 if (curr and curr[0] == 1) else 1
            conn.execute("""
                UPDATE crisis_state
                SET is_active = ?, activated_at = CURRENT_TIMESTAMP
                WHERE id = 1
            """, (new_val,))
            conn.commit()
            conn.close()
            return self.send_json(200, {
                'message': f"Crisis Mode {'activated' if new_val == 1 else 'deactivated'}",
                'isActive': bool(new_val)
            })

        # =========================================================================
        # REWARDS STORE CHECKOUT & TRANSACTIONAL POST ENDPOINTS
        # =========================================================================
        if path == '/api/rewards/checkout':
            user_id = body.get('userId') or 'USR-001'
            user_name = body.get('userName') or 'Suresh Patel'
            user_email = body.get('userEmail') or 'donor@kaveri.edu'
            product_id = body.get('productId')
            quantity = int(body.get('quantity') or 1)
            delivery = body.get('deliveryDetails') or {}
            fulfilment_type = body.get('fulfilmentType') or 'physical'

            if not product_id:
                return self.send_json(400, {'error': 'Product ID is required for redemption'})
            if quantity <= 0:
                return self.send_json(400, {'error': 'Quantity must be at least 1'})

            conn = get_db()
            cursor = conn.cursor()

            try:
                # 1. Fetch product and verify availability
                product = cursor.execute("SELECT * FROM reward_products WHERE id = ?", (product_id,)).fetchone()
                if not product:
                    conn.close()
                    return self.send_json(404, {'error': 'Reward product not found'})

                points_cost = product['points_cost']
                total_cost = points_cost * quantity
                stock_qty = product['stock_quantity']
                p_fulfilment = product['fulfilment_type']

                if p_fulfilment == 'physical' and stock_qty < quantity:
                    conn.close()
                    return self.send_json(400, {
                        'error': f"Insufficient stock for {product['name']}. Available: {stock_qty}, Requested: {quantity}."
                    })

                # 2. Check user's current Green Points balance
                tx_sum = cursor.execute("SELECT COALESCE(SUM(points), 0) FROM green_wallet_transactions WHERE user_id = ?", (user_id,)).fetchone()[0]
                if tx_sum < total_cost:
                    conn.close()
                    return self.send_json(400, {
                        'error': f"Insufficient Green Points. You have {tx_sum} GP, but this reward requires {total_cost} GP."
                    })

                new_balance = tx_sum - total_cost
                order_id = f"RMD-{int(datetime.now().timestamp() * 1000) % 90000 + 10000}"

                # 3. Deduct stock if physical product
                if p_fulfilment == 'physical':
                    new_stock = stock_qty - quantity
                    new_status = 'Out of Stock' if new_stock == 0 else ('Low Stock' if new_stock <= 5 else 'Available')
                    cursor.execute("""
                        UPDATE reward_products 
                        SET stock_quantity = ?, reserved_quantity = reserved_quantity + ?, availability_status = ?, updated_at = CURRENT_TIMESTAMP
                        WHERE id = ?
                    """, (new_stock, quantity, new_status, product_id))

                # 4. Insert wallet deduction ledger entry
                cursor.execute("""
                    INSERT INTO green_wallet_transactions (user_id, type, points, balance_after, description, reference_id)
                    VALUES (?, 'redemption_deduction', ?, ?, ?, ?)
                """, (user_id, -total_cost, new_balance, f"Redeemed: {quantity}x {product['name']}", order_id))

                # 5. Create order record
                initial_status = 'Redemption Placed'
                download_url = None
                if p_fulfilment == 'digital':
                    download_url = f"/downloads/certificates/{order_id}.pdf"

                cursor.execute("""
                    INSERT INTO reward_orders (
                        id, user_id, user_name, user_email, product_id, product_name,
                        product_image, fulfilment_type, quantity, points_spent, status,
                        delivery_recipient_name, delivery_phone, delivery_address,
                        delivery_city, delivery_state, delivery_pincode, delivery_notes,
                        tracking_number, courier_partner, digital_download_url, status_notes
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    order_id, user_id, user_name, user_email, product_id, product['name'],
                    product['image_url'], p_fulfilment, quantity, total_cost, initial_status,
                    delivery.get('recipientName', user_name), delivery.get('phone', ''),
                    delivery.get('address', ''), delivery.get('city', 'Indore'),
                    delivery.get('state', 'Madhya Pradesh'), delivery.get('pincode', '452001'),
                    delivery.get('instructions', ''), None, None, download_url,
                    'Redemption processed successfully. Order queued for dispatch.'
                ))

                # 6. Status history timeline entry
                cursor.execute("""
                    INSERT INTO reward_order_status_history (order_id, status, note, updated_by)
                    VALUES (?, ?, ?, 'Sanjeevni Automated Dispatcher')
                """, (order_id, initial_status, f"Redemption confirmed and {total_cost} GP deducted from wallet."))

                # Save address for future fast checkout if requested
                if delivery.get('saveAddress') and delivery.get('address'):
                    cursor.execute("""
                        INSERT INTO reward_addresses (user_id, recipient_name, phone, address, city, state, pincode)
                        VALUES (?, ?, ?, ?, ?, ?, ?)
                    """, (user_id, delivery.get('recipientName', user_name), delivery.get('phone', ''), delivery.get('address'), delivery.get('city'), delivery.get('state'), delivery.get('pincode')))

                conn.commit()
                conn.close()

                return self.send_json(201, {
                    'message': 'Reward redeemed successfully!',
                    'orderId': order_id,
                    'productName': product['name'],
                    'pointsDeducted': total_cost,
                    'newBalance': new_balance,
                    'status': initial_status
                })

            except Exception as e:
                conn.rollback()
                conn.close()
                return self.send_json(500, {'error': f'Checkout transaction failed: {str(e)}'})

        if '/cancel' in path and path.startswith('/api/rewards/orders/'):
            order_id = path.replace('/api/rewards/orders/', '').replace('/cancel', '')
            user_id = body.get('userId') or 'USR-001'
            reason = body.get('reason') or 'Cancelled by user before dispatch'

            conn = get_db()
            cursor = conn.cursor()
            try:
                order = cursor.execute("SELECT * FROM reward_orders WHERE id = ?", (order_id,)).fetchone()
                if not order:
                    conn.close()
                    return self.send_json(404, {'error': 'Order not found'})

                if order['status'] in ('Shipped', 'Out for Delivery', 'Delivered'):
                    conn.close()
                    return self.send_json(400, {'error': f"Cannot cancel order that is already {order['status']}"})

                if order['status'] == 'Cancelled':
                    conn.close()
                    return self.send_json(400, {'error': 'Order is already cancelled'})

                pts_spent = order['points_spent']
                prod_id = order['product_id']
                qty = order['quantity']

                # Update order to Cancelled
                cursor.execute("""
                    UPDATE reward_orders 
                    SET status = 'Cancelled', status_notes = ?, updated_at = CURRENT_TIMESTAMP 
                    WHERE id = ?
                """, (reason, order_id))

                # Restore stock if physical
                if order['fulfilment_type'] == 'physical':
                    cursor.execute("""
                        UPDATE reward_products 
                        SET stock_quantity = stock_quantity + ?, reserved_quantity = MAX(0, reserved_quantity - ?), availability_status = 'Available', updated_at = CURRENT_TIMESTAMP 
                        WHERE id = ?
                    """, (qty, qty, prod_id))

                # Refund points via ledger entry
                curr_balance = cursor.execute("SELECT COALESCE(SUM(points), 0) FROM green_wallet_transactions WHERE user_id = ?", (order['user_id'],)).fetchone()[0]
                new_balance = curr_balance + pts_spent
                cursor.execute("""
                    INSERT INTO green_wallet_transactions (user_id, type, points, balance_after, description, reference_id)
                    VALUES (?, 'cancellation_refund', ?, ?, ?, ?)
                """, (order['user_id'], pts_spent, new_balance, f"Points refunded for cancelled redemption #{order_id}", order_id))

                # Add timeline record
                cursor.execute("""
                    INSERT INTO reward_order_status_history (order_id, status, note, updated_by)
                    VALUES (?, 'Cancelled', ?, 'User / Support Cancellation')
                """, (order_id, f"Order cancelled: {reason}. {pts_spent} GP refunded to wallet."))

                conn.commit()
                conn.close()
                return self.send_json(200, {
                    'message': f'Order {order_id} cancelled successfully. {pts_spent} GP refunded to your Green Wallet.',
                    'orderId': order_id,
                    'refundedPoints': pts_spent,
                    'newBalance': new_balance
                })
            except Exception as e:
                conn.rollback()
                conn.close()
                return self.send_json(500, {'error': f'Cancellation failed: {str(e)}'})

        if path == '/api/rewards/wishlist/toggle':
            user_id = body.get('userId') or 'USR-001'
            product_id = body.get('productId')
            if not product_id:
                return self.send_json(400, {'error': 'Product ID required'})

            conn = get_db()
            cursor = conn.cursor()
            existing = cursor.execute("SELECT id FROM reward_wishlist WHERE user_id = ? AND product_id = ?", (user_id, product_id)).fetchone()
            if existing:
                cursor.execute("DELETE FROM reward_wishlist WHERE id = ?", (existing[0],))
                saved = False
                msg = 'Removed from wishlist'
            else:
                cursor.execute("INSERT INTO reward_wishlist (user_id, product_id) VALUES (?, ?)", (user_id, product_id))
                saved = True
                msg = 'Saved to wishlist'
            conn.commit()
            conn.close()
            return self.send_json(200, {'message': msg, 'isSaved': saved, 'productId': product_id})

        if path == '/api/rewards/addresses':
            user_id = body.get('userId') or 'USR-001'
            recipient_name = body.get('recipientName') or ''
            phone = body.get('phone') or ''
            address = body.get('address') or ''
            city = body.get('city') or 'Indore'
            state = body.get('state') or 'Madhya Pradesh'
            pincode = body.get('pincode') or '452001'
            is_default = 1 if body.get('isDefault') else 0

            conn = get_db()
            conn.execute("""
                INSERT INTO reward_addresses (user_id, recipient_name, phone, address, city, state, pincode, is_default)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (user_id, recipient_name, phone, address, city, state, pincode, is_default))
            conn.commit()
            conn.close()
            return self.send_json(201, {'message': 'Address saved successfully'})

        # Admin: Add new reward product
        if path == '/api/rewards/products':
            cat_id = body.get('categoryId') or 'gardening'
            name = body.get('name')
            tagline = body.get('tagline') or ''
            desc = body.get('description') or ''
            points = int(body.get('pointsCost') or 300)
            stock = int(body.get('stockQuantity') or 50)
            fulfilment = body.get('fulfilmentType') or 'physical'
            image = body.get('imageUrl') or 'https://images.unsplash.com/photo-1592417817098-8f3d6910985b?w=600&auto=format&fit=crop&q=80'
            features = json.dumps(body.get('features') or ['Zero chemical footprint', 'Community certified'])
            specs = json.dumps(body.get('specifications') or {})
            is_feat = 1 if body.get('isFeatured') else 0

            if not name:
                return self.send_json(400, {'error': 'Product name is required'})

            prod_id = f"PRD-CUSTOM-{int(datetime.now().timestamp() * 1000) % 10000}"
            slug = name.lower().replace(' ', '-').replace('/', '-')[:50]

            conn = get_db()
            conn.execute("""
                INSERT INTO reward_products (
                    id, category_id, name, slug, tagline, description, features_json,
                    specifications_json, points_cost, stock_quantity, fulfilment_type,
                    availability_status, image_url, gallery_images_json, is_featured, is_demo_inventory
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Available', ?, '[]', ?, 1)
            """, (prod_id, cat_id, name, slug, tagline, desc, features, specs, points, stock, fulfilment, image, is_feat))
            conn.commit()
            conn.close()
            return self.send_json(201, {'message': f'Reward product {name} added to catalog', 'id': prod_id})

        if '/delete' in path and path.startswith('/api/rewards/products/'):
            prod_id = path.replace('/api/rewards/products/', '').replace('/delete', '')
            conn = get_db()
            conn.execute("DELETE FROM reward_products WHERE id = ?", (prod_id,))
            conn.commit()
            conn.close()
            return self.send_json(200, {'message': f'Reward product {prod_id} deleted'})

        # Reset Demonstration Data
        if path == '/api/reset-data':
            if os.path.exists(DB_PATH):
                os.remove(DB_PATH)
            init_db()
            return self.send_json(200, {'message': 'Demonstration database reset to clean initial seed data'})

        # Update Reward Order Status (Admin)
        if '/status' in path and path.startswith('/api/rewards/orders/'):
            order_id = path.replace('/api/rewards/orders/', '').replace('/status', '')
            new_status = body.get('status')
            tracking_num = body.get('trackingNumber')
            courier = body.get('courierPartner')
            note = body.get('note') or f'Order updated to {new_status}'
            admin_name = body.get('adminName') or 'Logistics Dispatcher'

            conn = get_db()
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE reward_orders
                SET status = COALESCE(?, status),
                    tracking_number = COALESCE(?, tracking_number),
                    courier_partner = COALESCE(?, courier_partner),
                    status_notes = COALESCE(?, status_notes),
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            """, (new_status, tracking_num, courier, note, order_id))

            cursor.execute("""
                INSERT INTO reward_order_status_history (order_id, status, note, updated_by)
                VALUES (?, ?, ?, ?)
            """, (order_id, new_status, note, admin_name))

            conn.commit()
            conn.close()
            return self.send_json(200, {'message': f'Order {order_id} status updated to {new_status}'})

        # Update Reward Product (Admin)
        if path.startswith('/api/rewards/products/'):
            prod_id = path.replace('/api/rewards/products/', '')
            name = body.get('name')
            points = body.get('pointsCost')
            stock = body.get('stockQuantity')
            status = body.get('availabilityStatus')
            featured = body.get('isFeatured')

            conn = get_db()
            conn.execute("""
                UPDATE reward_products
                SET name = COALESCE(?, name),
                    points_cost = COALESCE(?, points_cost),
                    stock_quantity = COALESCE(?, stock_quantity),
                    availability_status = COALESCE(?, availability_status),
                    is_featured = COALESCE(?, is_featured),
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            """, (name, points, stock, status, featured, prod_id))
            conn.commit()
            conn.close()
            return self.send_json(200, {'message': f'Reward product {prod_id} updated'})

        self.send_json(404, {'error': f'Route not found: {path}'})

    def do_PUT(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        body = self.read_body()

        # Update Organisation Verification Status
        if '/verify' in path:
            org_id = path.replace('/api/organisations/', '').replace('/verify', '')
            status = body.get('status', 'Verified')
            conn = get_db()
            conn.execute("""
                UPDATE organisations
                SET verification_status = ?, verified_at = CURRENT_TIMESTAMP
                WHERE id = ?
            """, (status, org_id))
            conn.commit()
            conn.close()
            return self.send_json(200, {'message': f'Organisation status updated to {status}'})

        # Update Donation Status
        if '/status' in path and '/donations/' in path:
            donation_id = path.replace('/api/donations/', '').replace('/status', '')
            status = body.get('status')
            receiver_id = body.get('assignedReceiverId')
            volunteer_id = body.get('assignedVolunteerId')
            conn = get_db()
            conn.execute("""
                UPDATE donations
                SET status = COALESCE(?, status),
                    assigned_receiver_id = COALESCE(?, assigned_receiver_id),
                    assigned_volunteer_id = COALESCE(?, assigned_volunteer_id),
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            """, (status, receiver_id, volunteer_id, donation_id))
            conn.commit()
            conn.close()
            return self.send_json(200, {'message': f'Donation updated to {status}'})

        # Update Waste Status / Outcome
        if '/status' in path and '/waste/' in path:
            waste_id = path.replace('/api/waste/', '').replace('/status', '')
            status = body.get('status')
            outcome = body.get('processingOutcome')
            conn = get_db()
            conn.execute("""
                UPDATE waste_listings
                SET status = COALESCE(?, status),
                    processing_outcome = COALESCE(?, processing_outcome)
                WHERE id = ?
            """, (status, outcome, waste_id))
            conn.commit()
            conn.close()
            return self.send_json(200, {'message': f'Waste status updated to {status}'})

        # Update Volunteer Task Status
        if '/status' in path and '/volunteers/tasks/' in path:
            task_id = path.replace('/api/volunteers/tasks/', '').replace('/status', '')
            status = body.get('status')
            hours = body.get('hoursSpent')
            conn = get_db()
            conn.execute("""
                UPDATE volunteer_tasks
                SET status = COALESCE(?, status),
                    hours_spent = COALESCE(?, hours_spent),
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            """, (status, hours, task_id))
            conn.commit()
            conn.close()
            return self.send_json(200, {'message': f'Task updated to {status}'})

        # Update Reward Order Status (Admin)
        if '/status' in path and path.startswith('/api/rewards/orders/'):
            order_id = path.replace('/api/rewards/orders/', '').replace('/status', '')
            new_status = body.get('status')
            tracking_num = body.get('trackingNumber')
            courier = body.get('courierPartner')
            note = body.get('note') or f'Order updated to {new_status}'
            admin_name = body.get('adminName') or 'Logistics Dispatcher'

            conn = get_db()
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE reward_orders
                SET status = COALESCE(?, status),
                    tracking_number = COALESCE(?, tracking_number),
                    courier_partner = COALESCE(?, courier_partner),
                    status_notes = COALESCE(?, status_notes),
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            """, (new_status, tracking_num, courier, note, order_id))

            cursor.execute("""
                INSERT INTO reward_order_status_history (order_id, status, note, updated_by)
                VALUES (?, ?, ?, ?)
            """, (order_id, new_status, note, admin_name))

            conn.commit()
            conn.close()
            return self.send_json(200, {'message': f'Order {order_id} status updated to {new_status}'})

        # Update Reward Product (Admin)
        if path.startswith('/api/rewards/products/'):
            prod_id = path.replace('/api/rewards/products/', '')
            name = body.get('name')
            points = body.get('pointsCost')
            stock = body.get('stockQuantity')
            status = body.get('availabilityStatus')
            featured = body.get('isFeatured')

            conn = get_db()
            conn.execute("""
                UPDATE reward_products
                SET name = COALESCE(?, name),
                    points_cost = COALESCE(?, points_cost),
                    stock_quantity = COALESCE(?, stock_quantity),
                    availability_status = COALESCE(?, availability_status),
                    is_featured = COALESCE(?, is_featured),
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            """, (name, points, stock, status, featured, prod_id))
            conn.commit()
            conn.close()
            return self.send_json(200, {'message': f'Reward product {prod_id} updated'})

        self.send_json(404, {'error': f'Route not found: {path}'})

class ThreadedTCPServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
    daemon_threads = True
    allow_reuse_address = True

def run_server():
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    init_db()
    with ThreadedTCPServer(("", PORT), SanjeevniHandler) as httpd:
        print("==================================================")
        print("  SANJEEVNI Social Impact Platform Server Running!")
        print(f"  Local URL: http://localhost:{PORT}")
        print("  Backend: Embedded SQLite REST API + Static Server")
        print("==================================================")
        sys.stdout.flush()
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server.")

if __name__ == '__main__':
    run_server()

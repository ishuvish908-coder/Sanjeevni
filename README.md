# SANJEEVNI ⏰🍲
### AI-Powered Real-Time Surplus Food Rescue, Redistribution & Organic Waste Recovery Platform
> **Saving Food. Nourishing Lives.**  
> Built for **MLH HackDay, AITR Indore** — Combining decay kinetics, reachability mathematics, community mobilization, and circular resource recovery.

---

## 🌟 What is SANJEEVNI?

SANJEEVNI is a unified digital platform connecting food donors, verified NGOs, volunteers, animal welfare sanctuaries, and organic waste processing facilities under a zero-landfill mission.

The core philosophy is:
**"EVERY SURPLUS RESOURCE SHOULD HAVE A RESPONSIBLE DESTINATION."**

### Three Strategic Pillars:
1. **FOOD RESCUE:** Prevent and reduce food overproduction at messes, caterers, and restaurants using AI predictive analytics.
2. **SMART REDISTRIBUTION:** Connect safe surplus food with human shelters and night homes before microbiological consumption windows close.
3. **WASTE-TO-VALUE:** Recover unavoidable organic residues through:
   - **Pathway A (Human Food):** Verified NGOs & community kitchens.
   - **Pathway B (Animal Feed):** Pure vegetarian grains, rotis, and produce routed to Gaushalas under veterinary guidelines.
   - **Pathway C (Composting & Biogas):** Anaerobic biomethanation and vermicomposting converting scraps into clean green electricity and biofertilizer.

---

## 🚀 Quick Start (Running Locally)

The application runs with zero build complexity. Python's built-in standard library provides the backend REST API and SQLite database alongside the React 18, Tailwind CSS, and Leaflet OpenStreetMap frontend:

```bash
# 1. Start the server (with embedded SQLite REST API + Static Server)
python server.py

# 2. Open in your browser
http://localhost:5173
```

---

## 👥 6 Community Roles & Authentication

SANJEEVNI implements role-based access control with dedicated dashboards:

| Role # | Role Name | Primary Responsibilities | Default Demo Account |
|---|---|---|---|
| 1 | **Food Donor** | Post surplus batches, monitor safe-until decay timers, review AI overproduction insights, download ESG certificates | `donor@kaveri.edu` |
| 2 | **NGO / Food Receiver** | Post meal requirements, claim nearby matched surplus batches, verify dietary safety | `ngo@akshaya.org` |
| 3 | **Volunteer** | Field dispatch, digital probe temperature checklists (≥63°C), geofenced delivery, earn accredited hours & karma | `volunteer@sanjeevni.org` |
| 4 | **Animal Welfare** | Gaushalas & cattle sanctuaries claiming safe vegetarian produce and grains (Pathway B) | `gaushala@karuna.org` |
| 5 | **Waste Processing Partner** | Municipal anaerobic digesters and vermicomposting facilities logging kWh electricity & compost yields (Pathway C) | `biogas@greenearth.gov.in` |
| 6 | **Admin** | Municipal oversight, review organisation verification queue (Pending/Verified), toggle Crisis Relief Mode, city hotspot analytics | `admin@sanjeevni.org` |

*(Use the **👤 Sign In** button or Portal dropdown in the header to switch between demo roles with one click)*

---

## 🗺️ Explore Locations & Organisation Network

- Dedicated **EXPLORE LOCATIONS** view with interactive Leaflet OpenStreetMap centered on Indore, Madhya Pradesh (`22.7196, 75.8577`).
- Six facility categories:
  - **A. Food Donors:** Hostel messes, banquet halls, restaurants, corporate food courts.
  - **B. Human Food Receivers:** Akshaya Shelter, Robin Hood Army, Anand Senior Citizen Home, Hope Children Home, Seva Kitchen.
  - **C. Animal Welfare:** Karuna Gaushala & Stray Haven.
  - **D. Food Collection & Storage:** Indore Central Community Solar Refrigerator.
  - **E. Waste Recovery & Processing:** GreenEarth City Biomethanation & Compost Plant.
  - **F. Supporting Facilities:** Youth Volunteer Hub & Food Testing Laboratory (AITR).
- Live distance calculation from user's location (using browser GPS or manual address anchor).
- Direct external navigation directions via Google Maps / OpenStreetMap.
- Facility Registration modal with GPS detection and verification audit workflow.

---

## 🍲 Food Donation & 13-Stage Lifecycle

Every donation tracks a complete 13-stage custody lifecycle:
`Draft` $\to$ `Submitted` $\to$ `Pending Review` $\to$ `Available` $\to$ `Requested` $\to$ `Accepted` $\to$ `Pickup Assigned` $\to$ `Collected` $\to$ `Delivered` $\to$ `Completed` $\to$ `Cancelled` $\to$ `Rejected` $\to$ `Expired`

- **FSSAI Food Safety Checklist:** Core probe temperature (≥63°C for hot, ≤4°C for chilled), tamper-evident packaging seal, sensory freshness odor check, inspector name.
- **Prominent Allergen Declarations:** Milk/Dairy, Gluten/Wheat, Peanuts, Tree Nuts, Soy, Eggs.
- **Concurrency-Safe Allocations:** Database transactions prevent two shelters from claiming the same batch.

---

## 🗄️ Backend REST API & Database Schema

Powered by Python 3 and SQLite (`sanjeevni.db`):

| Endpoint | Method | Description |
|---|---|---|
| `/api/health` | GET | System health check and API version status |
| `/api/auth/login` | POST | Authenticate user session with role |
| `/api/auth/register` | POST | Register new user and optional organisation |
| `/api/organisations` | GET, POST | List registered facilities with category filters; register facility |
| `/api/organisations/<id>/verify` | PUT | Admin verification workflow (Pending $\to$ Verified/Rejected) |
| `/api/donations` | GET, POST | List donations; post new surplus batch |
| `/api/donations/<id>/allocate` | POST | Concurrency-safe allocation with database transaction locks |
| `/api/donations/<id>/status` | PUT | Advance donation lifecycle status |
| `/api/waste` | GET, POST | List organic residues; register waste batch across Pathways B & C |
| `/api/waste/<id>/status` | PUT | Log processing outcome (kWh biogas electricity, kg compost) |
| `/api/volunteers/tasks` | GET, POST | Volunteer task list and dispatch |
| `/api/dabba-bank` | GET | Reusable container fleet inventory |
| `/api/crisis` | GET | Current emergency crisis state & relief camps |
| `/api/crisis/toggle` | POST | Admin activation/deactivation of emergency mode |
| `/api/stats` | GET | Aggregated live platform metrics (meals, CO₂, value, diversion) |
| `/api/reset-data` | POST | Reset demonstration database to clean initial seed records |

---

## 🧪 Verification & Testing

To run the automated backend test suite:

```bash
python "C:\Users\ISHU VISHWAKARMA\.gemini\antigravity\brain\acb7f0ac-c5aa-4269-8884-b11004b473cb\scratch\test_endpoints.py"
```

All 8 core test suites pass with 200 OK responses:
- `HEALTH CHECK`: Healthy, Service SANJEEVNI 2.0.0
- `ORGANISATIONS`: 13 seed facilities across 6 categories
- `DONATIONS`: 4 baseline batches in active/accepted/delivered states
- `WASTE LISTINGS`: 3 batches across Animal Feed (Pathway B) and Biogas (Pathway C)
- `STATS`: Live dynamic aggregation
- `REGISTRATION`: User created with role-based permissions
- `CONCURRENCY ALLOCATION`: Transaction locked quantity deduction
- `INDEX.HTML SERVING`: High-speed static file delivery

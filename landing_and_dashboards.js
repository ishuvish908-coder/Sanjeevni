// =========================================================================
// SANJEEVNI - SOCIAL IMPACT MODERN BRANDING & 6 ROLE DASHBOARDS
// Colors:
//   Deep Lagoon: #114B5F (Headings, primary text, dark surfaces, navbar, footer)
//   Teal:        #028090 (Primary brand color, primary non-donation buttons, links)
//   Steel Blue:  #456990 (Secondary accent, icons, chart series, badges)
//   Mint:        #E4FDE1 (Soft tint, section backgrounds, tags, hover fills)
//   Coral:       #F45B69 (ACTION COLOR: Strictly reserved for Food Donation CTAs)
// Derived Tints:
//   Page Background: #F7FEF6, Muted Text: #3D5C6B, Soft Panel: #D8E6EC, Borders: #D3E5DC, Text on Coral: #072A35
// =========================================================================

// --- 1. PUBLIC LANDING PAGE (SECTION 17 SPEC) ---
window.LandingPageView = function LandingPageView({
  onOpenDonateForm,
  onOpenVolunteerPortal,
  onOpenExploreLocations,
  onOpenWasteToValue,
  onOpenRewardsStore,
  onNavigateToConsole,
  onOpenAuth,
  impactStats,
  onOpenDonationWizard
}) {
  const handleLaunchPathway = (pathway) => {
    if (onOpenDonationWizard) {
      onOpenDonationWizard(pathway);
    } else {
      window.dispatchEvent(new CustomEvent('open-donation-wizard', { detail: { pathway } }));
    }
  };

  return (
    <div className="space-y-16 py-4">
      {/* =========================================================================
          HERO SECTION: SANJEEVNI VISUAL IDENTITY UPGRADE (PROMPT SECTION 5)
         ========================================================================= */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#114B5F] via-[#163745] to-[#114B5F] text-[#F7FEF6] p-8 sm:p-14 lg:p-16 shadow-2xl border border-[#028090]/40">
        {/* Subtle Decorative Background Rings */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#028090]/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-[#E4FDE1]/10 blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
          {/* SDG Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#028090]/50 border border-[#E4FDE1]/40 text-xs font-bold tracking-wide text-[#E4FDE1]">
            <span>🌱</span> Primary SDGs: SDG 2 (Zero Hunger) & SDG 12 (Responsible Consumption)
          </div>

          {/* SANJEEVNI Prominent Identity with Circular Regeneration Symbol */}
          <div className="space-y-2 animate-fadeIn">
            <div className="flex items-center justify-center gap-3 sm:gap-4">
              {/* Subtle Circular Regeneration Leaf SVG Symbol */}
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-[#028090] via-[#2cb1c3] to-[#E4FDE1] p-0.5 shadow-xl flex items-center justify-center transform hover:rotate-45 transition duration-500">
                <div className="w-full h-full bg-[#114B5F] rounded-2xl flex items-center justify-center">
                  <svg className="w-7 h-7 sm:w-9 sm:h-9 text-[#E4FDE1]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z" strokeOpacity="0.4" />
                    <path d="M12 6c-3.3 0-6 2.7-6 6 0 2.2 1.2 4.1 3 5.2.5-.9 1.5-2.2 3-2.2s2.5 1.3 3 2.2c1.8-1.1 3-3 3-5.2 0-3.3-2.7-6-6-6z" fill="#028090" />
                    <circle cx="12" cy="12" r="2" fill="#E4FDE1" />
                  </svg>
                </div>
              </div>

              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-[#F7FEF6] tracking-wider drop-shadow-md">
                SANJEEVNI
              </h1>
            </div>

            {/* Tagline */}
            <div className="text-sm sm:text-base font-extrabold uppercase tracking-widest text-[#E4FDE1] pt-1">
              Saving Food. Nourishing Lives.
            </div>
          </div>

          {/* Inspirational Quote */}
          <blockquote className="text-xl sm:text-2xl font-serif italic text-white/95 max-w-2xl mx-auto pt-1 border-y border-[#028090]/40 py-3">
            “Together, we can make every meal matter.”
          </blockquote>

          {/* Supporting Copy */}
          <p className="text-xs sm:text-sm text-[#D8E6EC] max-w-2xl mx-auto leading-relaxed font-normal">
            Connecting food donors, NGOs, volunteers, animal welfare organisations, and organic waste recovery facilities through one unified digital platform.
          </p>

          {/* Three Clear Call-To-Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            {/* 1. STRICT CORAL ACTION CTA: DONATE FOOD */}
            <button
              onClick={onOpenDonateForm}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#F45B69] hover:bg-[#e04856] text-[#072A35] font-black text-sm shadow-xl shadow-black/25 transition duration-150 flex items-center justify-center gap-2 border border-[#F45B69] transform active:scale-95"
            >
              <span>🍲</span> Donate Food
            </button>

            {/* 2. TEAL PRIMARY ACTION: EXPLORE PATHWAYS */}
            <button
              onClick={onOpenWasteToValue}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-[#028090] hover:bg-[#114B5F] text-white font-black text-sm shadow-md transition duration-150 flex items-center justify-center gap-2 transform active:scale-95 border border-[#028090]"
            >
              <span>🔄</span> Explore Pathways
            </button>

            {/* 3. SECONDARY OUTLINE: JOIN AS VOLUNTEER */}
            <button
              onClick={onOpenVolunteerPortal}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-transparent hover:bg-white/10 text-[#E4FDE1] font-bold text-sm transition border border-[#E4FDE1]/50 flex items-center justify-center gap-2"
            >
              <span>🚴</span> Join as Volunteer
            </button>
          </div>

          {/* Quick Metrics Bar in Hero */}
          <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-[#028090]/40 mt-6">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-black text-[#F7FEF6]">
                {(impactStats.totalPlatesDonated || 1640).toLocaleString()}
              </div>
              <div className="text-[11px] text-[#E4FDE1] uppercase tracking-wider font-semibold">Meals Rescued</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-black text-[#028090] bg-[#E4FDE1] px-2.5 py-0.5 rounded-lg inline-block">
                {(impactStats.co2AvoidedKg || 1780).toLocaleString()} kg
              </div>
              <div className="text-[11px] text-[#E4FDE1] uppercase tracking-wider font-semibold mt-1">CO₂e Prevented</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-black text-[#F7FEF6]">100%</div>
              <div className="text-[11px] text-[#E4FDE1] uppercase tracking-wider font-semibold">Zero-Landfill Mission</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-black text-[#E4FDE1]">3 Tiers</div>
              <div className="text-[11px] text-[#E4FDE1] uppercase tracking-wider font-semibold">Intelligent Routing</div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          HOMEPAGE CONNECTED PATHWAY VISUAL: ONE SURPLUS. THREE POSSIBLE PATHWAYS. (PROMPT SECTION 6)
         ========================================================================= */}
      <section className="p-8 sm:p-12 rounded-3xl bg-white border border-[#D3E5DC] shadow-sm space-y-8">
        <div className="max-w-3xl mx-auto text-center space-y-2">
          <span className="text-xs font-black uppercase tracking-widest text-[#028090] bg-[#E4FDE1] px-3 py-1 rounded-full">
            Intelligent Destination Evaluation
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-[#114B5F]">
            One Surplus. Three Possible Pathways.
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl mx-auto">
            When surplus food is available, it doesn’t automatically mean one outcome. SANJEEVNI intelligently evaluates every situation to determine the most responsible destination.
          </p>
        </div>

        {/* CONNECTED BRANCHING DIAGRAM */}
        <div className="max-w-4xl mx-auto space-y-6">
          {/* ROOT NODE: SURPLUS IDENTIFIED */}
          <div className="flex justify-center">
            <div className="p-4 rounded-2xl bg-[#114B5F] text-white shadow-lg border-2 border-[#028090] text-center max-w-sm w-full space-y-1">
              <div className="text-2xl">📦</div>
              <h3 className="font-black text-sm uppercase tracking-wide">Surplus Food / Resource Identified</h3>
              <p className="text-[11px] text-[#E4FDE1]">
                Decay kinetics & safety condition evaluated at touchpoint
              </p>
            </div>
          </div>

          {/* BRANCHING CONNECTORS (RESPONSIVE SVG) */}
          <div className="hidden md:flex justify-center -my-2">
            <svg className="w-full max-w-2xl h-12 text-[#028090]" viewBox="0 0 600 40" fill="none">
              <path d="M300 0 V15 H100 V40 M300 15 H500 V40 M300 15 V40" stroke="currentColor" strokeWidth="2.5" strokeDasharray="4 4" />
            </svg>
          </div>

          {/* 3 INTERACTIVE BRANCH CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
            {/* BRANCH 1: FOOD FOR PEOPLE */}
            <div
              onClick={() => handleLaunchPathway('people')}
              className="group p-6 rounded-3xl bg-gradient-to-b from-[#F7FEF6] to-white border-2 border-[#028090] shadow-sm hover:shadow-xl transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-4 transform hover:-translate-y-1"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#E4FDE1] text-[#028090]">
                    Safe for humans? YES ➔
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-[#E4FDE1] flex items-center justify-center text-xl group-hover:scale-110 transition">
                    🍲
                  </div>
                </div>

                <div>
                  <h4 className="text-base font-black text-[#114B5F] group-hover:text-[#028090] transition">
                    FOOD FOR PEOPLE
                  </h4>
                  <span className="text-[11px] text-[#028090] font-bold">Tier 1 • Human Rescue</span>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    Safe, untouched food redirected to verified NGOs, orphanages, old-age homes and community kitchens.
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-white border border-[#D3E5DC] text-[11px] text-slate-600 space-y-1">
                  <div><strong>Destinations:</strong> Orphanages, Food Banks, Night Shelters</div>
                  <div><strong>Safety:</strong> Temp probe &gt; 60°C, Safe-Until clock</div>
                </div>
              </div>

              <button
                type="button"
                className="w-full py-2.5 rounded-xl bg-[#028090] hover:bg-[#114B5F] text-white font-black text-xs shadow-md transition flex items-center justify-center gap-1.5"
              >
                <span>Select Food for People</span>
                <span>➔</span>
              </button>
            </div>

            {/* BRANCH 2: SUITABLE ANIMAL FEED */}
            <div
              onClick={() => handleLaunchPathway('animal')}
              className="group p-6 rounded-3xl bg-gradient-to-b from-amber-50/40 to-white border-2 border-[#456990] shadow-sm hover:shadow-xl transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-4 transform hover:-translate-y-1"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
                    Animal Safe? YES ➔
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-xl group-hover:scale-110 transition">
                    🐾
                  </div>
                </div>

                <div>
                  <h4 className="text-base font-black text-[#114B5F] group-hover:text-[#456990] transition">
                    SUITABLE ANIMAL FEED
                  </h4>
                  <span className="text-[11px] text-[#456990] font-bold">Tier 2 • Gaushalas & Shelters</span>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    Wholesome vegetarian food residues and clean grain scraps routed to Gaushalas and animal welfare sanctuaries.
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-white border border-[#D3E5DC] text-[11px] text-slate-600 space-y-1">
                  <div><strong>Destinations:</strong> Gaushalas, Stray Shelters, Fodder Hubs</div>
                  <div><strong>Rule:</strong> No onions, garlic, chocolate, or plastic</div>
                </div>
              </div>

              <button
                type="button"
                className="w-full py-2.5 rounded-xl bg-[#456990] hover:bg-[#114B5F] text-white font-black text-xs shadow-md transition flex items-center justify-center gap-1.5"
              >
                <span>Select Animal Feed</span>
                <span>➔</span>
              </button>
            </div>

            {/* BRANCH 3: COMPOST & BIO-RECOVERY */}
            <div
              onClick={() => handleLaunchPathway('compost')}
              className="group p-6 rounded-3xl bg-gradient-to-b from-emerald-50/40 to-white border-2 border-[#23634D] shadow-sm hover:shadow-xl transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-4 transform hover:-translate-y-1"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Inedible Scraps? YES ➔
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-xl group-hover:scale-110 transition">
                    🌱
                  </div>
                </div>

                <div>
                  <h4 className="text-base font-black text-[#114B5F] group-hover:text-[#23634D] transition">
                    COMPOST & BIO-RECOVERY
                  </h4>
                  <span className="text-[11px] text-[#23634D] font-bold">Tier 3 • Zero Landfill</span>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    Inedible peels, plate waste, and organic scrap converted to bio-CNG electricity and nutrient bio-fertilizer.
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-white border border-[#D3E5DC] text-[11px] text-slate-600 space-y-1">
                  <div><strong>Destinations:</strong> Bio-Methanation & Composting Bays</div>
                  <div><strong>Rule:</strong> 100% Zero-plastic source segregation</div>
                </div>
              </div>

              <button
                type="button"
                className="w-full py-2.5 rounded-xl bg-[#23634D] hover:bg-[#114B5F] text-white font-black text-xs shadow-md transition flex items-center justify-center gap-1.5"
              >
                <span>Select Compost Recovery</span>
                <span>➔</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT SANJEEVNI & MISSION */}
      <section className="p-8 sm:p-12 rounded-3xl bg-white border border-soft-mint shadow-sm space-y-6">
        <div className="max-w-3xl space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-deep-emerald">About SANJEEVNI</span>
          <h2 className="text-2xl sm:text-3xl font-black text-midnight-pine">Every Surplus Resource Should Have a Responsible Destination.</h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Traditional food redistribution often fails because food is a rapidly perishable asset. By combining microbiology decay kinetics, reachability mathematics, and community logistics, SANJEEVNI guarantees that fresh surplus reaches human shelters before expiry, while unavoidable organic residuals are recovered as animal feed or clean bio-energy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          <div className="p-5 rounded-2xl bg-cloud-white border border-soft-mint space-y-2">
            <div className="text-2xl">⚡</div>
            <h4 className="text-sm font-bold text-midnight-pine">Dynamic Safe-Until Clock</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Calculates precise consumption safety margins based on food type and thermal storage factors (hot-held, chilled, room temp).
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-cloud-white border border-soft-mint space-y-2">
            <div className="text-2xl">🎯</div>
            <h4 className="text-sm font-bold text-midnight-pine">Reachability Matching Engine</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Transparent rule-based dispatch ranking verified shelters based on travel distance, vehicle transit times, and dining capacity.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-cloud-white border border-soft-mint space-y-2">
            <div className="text-2xl">♻️</div>
            <h4 className="text-sm font-bold text-midnight-pine">Waste-to-Value Ladder</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Unavoidable organic residuals are diverted to Gaushalas as safe animal feed or to municipal biomethanation plants for clean compost and biogas.
            </p>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS: FOUR-STEP COMMUNITY BRIDGE */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="text-xs font-bold uppercase tracking-widest text-deep-emerald">Step-by-Step Transparency</div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-midnight-pine">How SANJEEVNI Works</h2>
          <p className="text-xs sm:text-sm text-slate-600">
            A dignified, compassionate, technology-driven pipeline transforming daily excess into immediate relief.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-soft-mint shadow-sm space-y-3 relative hover:border-impact-green transition">
            <div className="w-12 h-12 rounded-xl bg-soft-mint text-deep-emerald flex items-center justify-center font-black text-xl">
              1
            </div>
            <h3 className="text-base font-bold text-midnight-pine">Donor Lists Surplus</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Messes, banquet halls, and canteens log surplus quantity, cooking time, and storage conditions in seconds.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-soft-mint shadow-sm space-y-3 relative hover:border-impact-green transition">
            <div className="w-12 h-12 rounded-xl bg-soft-mint text-deep-emerald flex items-center justify-center font-black text-xl">
              2
            </div>
            <h3 className="text-base font-bold text-midnight-pine">Reachability Matching</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Algorithm scores nearby verified shelters reachable within ETA + 15 min serving buffer before safe window closes.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-soft-mint shadow-sm space-y-3 relative hover:border-impact-green transition">
            <div className="w-12 h-12 rounded-xl bg-soft-mint text-deep-emerald flex items-center justify-center font-black text-xl">
              3
            </div>
            <h3 className="text-base font-bold text-midnight-pine">Volunteer Inspection</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Trained volunteers verify digital quality checklists, core temperature probes (≥63°C), and package seals.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-soft-mint shadow-sm space-y-3 relative hover:border-impact-green transition">
            <div className="w-12 h-12 rounded-xl bg-soft-mint text-deep-emerald flex items-center justify-center font-black text-xl">
              4
            </div>
            <h3 className="text-base font-bold text-midnight-pine">Dignified Distribution</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Hot meals served at night shelters and orphanages. Unavoidable scraps routed to Gaushalas or vermicomposting.
            </p>
          </div>
        </div>
      </section>

      {/* WASTE LADDER CASCADE (SECTION 10 PHILOSOPHY) */}
      <section className="p-8 sm:p-12 rounded-3xl bg-soft-mint/60 border border-deep-emerald/20 space-y-6">
        <div className="max-w-3xl space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-deep-emerald">Zero-Landfill Philosophy</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-midnight-pine">The Three Recovery Pathways</h2>
          <p className="text-xs sm:text-sm text-midnight-pine/80 leading-relaxed">
            No edible food should ever reach a landfill to rot and emit methane. If logistics prevents human dining, the material steps down through verified safety pathways:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-white border-2 border-deep-emerald space-y-2 shadow-sm">
            <div className="text-2xl">🧑‍🤝‍🧑</div>
            <div className="text-xs font-bold uppercase tracking-wider text-deep-emerald">Pathway A: People First</div>
            <h4 className="text-sm font-bold text-midnight-pine">Verified NGOs & Community Shelters</h4>
            <p className="text-xs text-slate-600">
              Night shelters, orphanages, old-age homes, and langar counters within safe consumption time.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-warm-sand space-y-2 shadow-sm">
            <div className="text-2xl">🐄</div>
            <div className="text-xs font-bold uppercase tracking-wider text-impact-green">Pathway B: Safe Animal Feed</div>
            <h4 className="text-sm font-bold text-midnight-pine">Gaushalas & Stray Sanctuaries</h4>
            <p className="text-xs text-slate-600">
              Safe cooked grains, rotis, and fresh vegetable trimmings redirected under veterinary feed guidance.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-soft-mint space-y-2 shadow-sm">
            <div className="text-2xl">🌿</div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Pathway C: Soil & Energy</div>
            <h4 className="text-sm font-bold text-midnight-pine">Biomethanation & Organic Compost</h4>
            <p className="text-xs text-slate-600">
              Peels and unavoidable organic residues digested into clean biogas electricity and grade-A biofertilizer.
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER (SECTION 17 SPEC) */}
      <footer className="p-8 sm:p-12 rounded-3xl bg-midnight-pine text-cloud-white space-y-8">
        <div className="flex flex-col md:flex-row justify-between gap-6 pb-6 border-b border-deep-emerald">
          <div className="space-y-2 max-w-sm">
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-wider text-cloud-white">SANJEEVNI</span>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-deep-emerald text-soft-mint font-bold">
                Saving Food. Nourishing Lives.
              </span>
            </div>
            <p className="text-xs text-soft-mint leading-relaxed">
              A comprehensive digital network connecting food donors, verified NGOs, volunteers, animal welfare facilities, and organic waste recovery partners.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 text-xs">
            <div className="space-y-2">
              <div className="font-bold text-cloud-white uppercase tracking-wider text-[11px]">Platform Discovery</div>
              <div className="text-soft-mint hover:underline cursor-pointer" onClick={onOpenExploreLocations}>Explore Locations Map</div>
              <div className="text-soft-mint hover:underline cursor-pointer" onClick={onOpenDonateForm}>Post Food Donation</div>
              <div className="text-soft-mint hover:underline cursor-pointer" onClick={onOpenWasteToValue}>Waste-to-Value Module</div>
              <div className="text-soft-mint hover:underline cursor-pointer" onClick={onNavigateToConsole}>Live Console</div>
            </div>

            <div className="space-y-2">
              <div className="font-bold text-cloud-white uppercase tracking-wider text-[11px]">Roles & Accounts</div>
              <div className="text-soft-mint hover:underline cursor-pointer" onClick={onOpenAuth}>Donor Account</div>
              <div className="text-soft-mint hover:underline cursor-pointer" onClick={onOpenAuth}>NGO / Shelter Portal</div>
              <div className="text-soft-mint hover:underline cursor-pointer" onClick={onOpenAuth}>Volunteer Dispatch</div>
              <div className="text-soft-mint hover:underline cursor-pointer" onClick={onOpenAuth}>Admin Console</div>
            </div>

            <div className="space-y-2">
              <div className="font-bold text-cloud-white uppercase tracking-wider text-[11px]">Compliance & Trust</div>
              <div className="text-soft-mint">FSSAI Hygiene Checklist</div>
              <div className="text-soft-mint">Zero-Landfill Protocol</div>
              <div className="text-soft-mint">Dabba Bank Fleet</div>
              <div className="text-soft-mint">ESG Carbon Offset PDF</div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] text-soft-mint/70 gap-2">
          <div>© 2026 SANJEEVNI Social Innovation Initiative. Built for sustainable hunger mitigation & zero waste.</div>
          <div>SDG 2 Zero Hunger • SDG 12 Responsible Consumption • Indore, Madhya Pradesh</div>
        </div>
      </footer>
    </div>
  );
};

// --- 2. DONOR DASHBOARD VIEW (SECTION 18 SPEC) ---
window.DonorDashboardView = function DonorDashboardView({
  donations,
  currentDonor,
  onOpenDonateForm,
  onOpenInsights,
  onOpenPledges,
  onOpenWasteForm,
  onOpenRewardsStore,
  onNavigateTab
}) {
  const activeDonations = donations.filter(d => !['Delivered', 'Completed', 'Cancelled'].includes(d.status));
  const completedDonations = donations.filter(d => ['Delivered', 'Completed'].includes(d.status));
  const totalMeals = donations.reduce((sum, d) => sum + (parseFloat(d.quantity) || 0), 0);

  const [transportRequests, setTransportRequests] = React.useState([]);
  const [loadingTransport, setLoadingTransport] = React.useState(false);
  const [actionMsg, setActionMsg] = React.useState(null);

  const fetchTransport = async () => {
    if (window.SanjeevniAPI?.transport?.getRequests) {
      try {
        const data = await window.SanjeevniAPI.transport.getRequests({ donor_id: currentDonor?.id || 'D1' });
        setTransportRequests(data || []);
      } catch (e) {
        console.warn('Failed to load transport requests:', e);
      }
    }
  };

  React.useEffect(() => {
    fetchTransport();
  }, [currentDonor]);

  const handleApproveQuote = async (pickupId, approved) => {
    setLoadingTransport(true);
    try {
      const res = await window.SanjeevniAPI.transport.approveQuote(pickupId, approved);
      setActionMsg({ type: 'success', text: res.message || 'Logistics quote authorized! Courier dispatched.' });
      await fetchTransport();
    } catch (err) {
      setActionMsg({ type: 'error', text: 'Failed to authorize quote.' });
    } finally {
      setLoadingTransport(false);
    }
  };

  const handleConfirmHandover = async (pickupId) => {
    setLoadingTransport(true);
    try {
      const res = await window.SanjeevniAPI.transport.confirmHandover(pickupId, 'donor', 'Handed over securely from mess dispatch dock');
      setActionMsg({ type: 'success', text: res.message || 'Handover confirmed successfully!' });
      await fetchTransport();
    } catch (err) {
      setActionMsg({ type: 'error', text: 'Failed to confirm handover.' });
    } finally {
      setLoadingTransport(false);
    }
  };

  const handleSwitchMode = async (pickupId, newMode, subType) => {
    setLoadingTransport(true);
    try {
      const res = await window.SanjeevniAPI.transport.switchMode(pickupId, newMode, subType);
      setActionMsg({ type: 'success', text: res.message || `Switched arrangement to ${newMode.replace('_', ' ')}` });
      await fetchTransport();
    } catch (err) {
      setActionMsg({ type: 'error', text: 'Failed to switch arrangement.' });
    } finally {
      setLoadingTransport(false);
    }
  };

  const navigateToKarn = () => {
    if (onNavigateTab) {
      onNavigateTab('karn_logistics');
    } else {
      window.location.hash = 'karn_logistics';
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-3xl bg-white border border-soft-mint shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-deep-emerald">Role 1: Food Donor Dashboard</span>
          <h2 className="text-xl font-black text-midnight-pine">Surplus Food & Waste Prevention Center</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Logged in facility: <strong>{currentDonor?.name || 'Kaveri Hostel Mess (Campus Sector 2)'}</strong>
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {/* PRIMARY NON-DONATION BUTTON (TEAL) */}
          <button
            onClick={onOpenRewardsStore}
            className="px-4 py-2.5 rounded-xl bg-[#028090] hover:bg-[#114B5F] text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5"
            title="Redeem your earned Green Points for physical & digital rewards"
          >
            <span>🎁</span> Green Rewards Store
          </button>
          {/* SECONDARY ACTION BUTTON (OUTLINE) */}
          <button
            onClick={onOpenWasteForm}
            className="px-4 py-2.5 rounded-xl border-2 border-[#028090] text-[#028090] hover:bg-[#E4FDE1] font-bold text-xs transition"
          >
            ♻️ Log Organic Waste
          </button>
          {/* STRICT CORAL DONATION ACTION CTA */}
          <button
            onClick={onOpenDonateForm}
            className="px-5 py-2.5 rounded-xl bg-[#F45B69] hover:bg-[#e04856] text-[#072A35] font-black text-xs shadow-md transition flex items-center gap-1.5 active:scale-95 border border-[#F45B69]"
          >
            <span>+</span> Post Surplus Food
          </button>
        </div>
      </div>

      {/* KPI Stats (Section 6.3) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-soft-mint space-y-1">
          <div className="text-xs text-slate-500">Total Plates Donated</div>
          <div className="text-2xl font-black text-midnight-pine">{totalMeals}</div>
          <div className="text-[10px] text-deep-emerald font-semibold">100% Landfill Diverted</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-soft-mint space-y-1">
          <div className="text-xs text-slate-500">Active Live Batches</div>
          <div className="text-2xl font-black text-deep-emerald">{activeDonations.length}</div>
          <div className="text-[10px] text-slate-400">Within safe consumption clock</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-soft-mint space-y-1">
          <div className="text-xs text-slate-500">Completed Deliveries</div>
          <div className="text-2xl font-black text-midnight-pine">{completedDonations.length}</div>
          <div className="text-[10px] text-impact-green font-semibold">Signed custody logs</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-soft-mint space-y-1">
          <div className="text-xs text-slate-500">CO₂ Avoided</div>
          <div className="text-2xl font-black text-impact-green">{Math.round(totalMeals * 1.1)} kg</div>
          <div className="text-[10px] text-slate-400">ESG Carbon Offset</div>
        </div>
      </div>

      {/* Action Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-soft-mint shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-midnight-pine flex items-center gap-1.5">
              <span>📊</span> Overproduction Reduction Insights
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-soft-mint text-deep-emerald">AI Insights</span>
          </div>
          <p className="text-xs text-slate-600">
            Historical attendance patterns detect Sunday excess. Batch reductions can save ₹14,500/month in raw food staples.
          </p>
          <button onClick={onOpenInsights} className="text-xs font-bold text-deep-emerald hover:underline pt-1">
            Review Overproduction Analytics ➔
          </button>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-soft-mint shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-midnight-pine flex items-center gap-1.5">
              <span>🤝</span> Pre-Event Surplus Pledges
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-soft-mint text-deep-emerald">Event Planner</span>
          </div>
          <p className="text-xs text-slate-600">
            Hosting an upcoming banquet, marriage, or corporate luncheon? Pledge expected surplus hours in advance for priority NGO routing.
          </p>
          <button onClick={onOpenPledges} className="text-xs font-bold text-deep-emerald hover:underline pt-1">
            Manage Event Pledges ➔
          </button>
        </div>
      </div>

      {/* DONOR LOGISTICS & TRANSPORTATION PREFERENCES SECTION */}
      <div className="bg-white rounded-3xl border border-soft-mint overflow-hidden shadow-sm space-y-4">
        <div className="p-5 border-b border-soft-mint flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-soft-mint text-deep-emerald text-sm">🚚</span>
              <h3 className="text-base font-bold text-midnight-pine">My Transportation Preferences & Requests (KARN)</h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Donor-controlled logistics: Monitor quotes, scheduled handovers, and sponsor allocations.
            </p>
          </div>
          <button
            onClick={navigateToKarn}
            className="px-3.5 py-1.5 rounded-xl bg-soft-mint text-deep-emerald hover:bg-impact-green hover:text-white font-bold text-xs transition flex items-center gap-1.5 self-start"
          >
            <span>📡</span> Open Live KARN Tracker
          </button>
        </div>

        {actionMsg && (
          <div className={`mx-5 p-3 rounded-xl text-xs font-semibold flex items-center justify-between ${
            actionMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}>
            <span>{actionMsg.text}</span>
            <button onClick={() => setActionMsg(null)} className="font-bold ml-2">✕</button>
          </div>
        )}

        <div className="p-5 pt-0">
          {transportRequests.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {transportRequests.map(tr => {
                const isDonorPaid = tr.transport_mode === 'donor_paid';
                const isSelfArranged = tr.transport_mode === 'self_arranged';
                const isSponsored = tr.transport_mode === 'sponsored';
                const quotePending = isDonorPaid && !tr.donor_quote_approved;
                const sponsorUnavailable = isSponsored && tr.funding_status === 'Unavailable';

                return (
                  <div key={tr.id || tr.pickup_id} className="p-4 rounded-2xl border border-soft-mint bg-cloud-white space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-deep-emerald">{tr.pickup_id || tr.id}</span>
                        <span className="text-[10px] text-slate-400">({tr.donation_id})</span>
                      </div>
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        tr.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                        tr.status === 'In Transit' ? 'bg-blue-100 text-blue-800 animate-pulse' :
                        quotePending ? 'bg-amber-100 text-amber-800' : 'bg-soft-mint text-deep-emerald'
                      }`}>
                        {tr.status || 'Active'}
                      </span>
                    </div>

                    {/* Mode Badge & Details */}
                    <div className="space-y-1 text-xs">
                      {isDonorPaid && (
                        <div className="p-3 rounded-xl bg-white border border-soft-mint space-y-2">
                          <div className="flex items-center justify-between font-bold text-midnight-pine">
                            <span className="flex items-center gap-1.5"><span>💳</span> Mode: Donor-Funded Courier</span>
                            <span className="text-deep-emerald text-sm">₹{Number(tr.quoted_cost || tr.quoted_amount || 0).toFixed(2)}</span>
                          </div>
                          <p className="text-[11px] text-slate-500">
                            {quotePending 
                              ? '⏳ Logistics quote awaiting your explicit authorization before driver dispatch.' 
                              : '✓ You authorized this ₹' + Number(tr.quoted_cost || tr.quoted_amount || 0).toFixed(2) + ' logistics fee. Transparent digital receipt logged.'}
                          </p>
                          {quotePending && (
                            <div className="pt-1 flex gap-2">
                              <button
                                disabled={loadingTransport}
                                onClick={() => handleApproveQuote(tr.pickup_id, true)}
                                className="flex-1 py-1.5 rounded-lg bg-deep-emerald hover:bg-midnight-pine text-white font-bold text-xs transition"
                              >
                                ✓ Authorize & Dispatch Courier (₹{Number(tr.quoted_cost || tr.quoted_amount || 0).toFixed(2)})
                              </button>
                              <button
                                disabled={loadingTransport}
                                onClick={() => handleSwitchMode(tr.pickup_id, 'self_arranged', 'donor_delivery')}
                                className="px-2.5 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 font-medium text-xs transition"
                              >
                                Decline (Self-Arrange)
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {isSelfArranged && (
                        <div className="p-3 rounded-xl bg-white border border-soft-mint space-y-2">
                          <div className="flex items-center justify-between font-bold text-midnight-pine">
                            <span className="flex items-center gap-1.5">
                              <span>🤝</span> Mode: Self-Arranged Pickup
                            </span>
                            <span className="text-[11px] px-2 py-0.5 rounded bg-soft-mint text-deep-emerald">
                              {tr.self_arranged_type === 'donor_delivery' ? 'Donor will deliver' : 'Receiver will collect'}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-600 space-y-0.5">
                            <div>🕒 Scheduled Handover: <strong>{tr.scheduled_handover_time || 'Agreed Window'}</strong></div>
                            <div>📍 Destination: {tr.receiver_name || 'Verified Shelter'}</div>
                          </div>
                          <div className="pt-1 flex items-center justify-between">
                            <span className="text-[11px] text-slate-500">
                              {tr.donor_handover_confirmed ? '✓ Your handover confirmed' : 'Awaiting your physical handover'}
                            </span>
                            <button
                              disabled={loadingTransport || tr.donor_handover_confirmed}
                              onClick={() => handleConfirmHandover(tr.pickup_id)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                                tr.donor_handover_confirmed
                                  ? 'bg-emerald-100 text-emerald-800 cursor-default'
                                  : 'bg-impact-green hover:bg-deep-emerald text-white shadow-sm'
                              }`}
                            >
                              {tr.donor_handover_confirmed ? '✓ Handover Confirmed' : 'Confirm Food Handed Over'}
                            </button>
                          </div>
                        </div>
                      )}

                      {isSponsored && (
                        <div className="p-3 rounded-xl bg-white border border-soft-mint space-y-2">
                          <div className="flex items-center justify-between font-bold text-midnight-pine">
                            <span className="flex items-center gap-1.5"><span>🏛️</span> Mode: Sponsored Transportation</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                              tr.funding_status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                              tr.funding_status === 'Unavailable' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {tr.funding_status || 'Under Review'}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600">
                            {tr.funding_status === 'Approved' ? (
                              <span>✓ Funded via: <strong>{tr.funding_source_name || 'CSR Mobility Grant'}</strong>. Zero donor cost.</span>
                            ) : sponsorUnavailable ? (
                              <span className="text-rose-700 font-medium">
                                Sponsorship is currently unavailable for this pickup. You can continue waiting for sponsorship or choose another transportation arrangement.
                              </span>
                            ) : (
                              <span>Evaluating municipal & CSR mobility pool allocation (Quote: ₹{Number(tr.quoted_cost || 280).toFixed(2)}).</span>
                            )}
                          </p>

                          {sponsorUnavailable && (
                            <div className="pt-1 flex flex-wrap gap-2">
                              <button
                                disabled={loadingTransport}
                                onClick={() => handleSwitchMode(tr.pickup_id, 'donor_paid')}
                                className="px-3 py-1.5 rounded-lg bg-deep-emerald hover:bg-midnight-pine text-white font-bold text-xs transition"
                              >
                                Switch to Donor-Funded Pickup
                              </button>
                              <button
                                disabled={loadingTransport}
                                onClick={() => handleSwitchMode(tr.pickup_id, 'self_arranged', 'donor_delivery')}
                                className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 font-medium text-xs transition"
                              >
                                Arrange Pickup Myself
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center text-slate-400 text-xs">
              No active transportation requests. When you post surplus food, your logistics arrangement will appear here.
            </div>
          )}
        </div>
      </div>

      {/* Donations Table */}
      <div className="bg-white rounded-3xl border border-soft-mint overflow-hidden shadow-sm">
        <div className="p-4 border-b border-soft-mint flex items-center justify-between">
          <h3 className="text-sm font-bold text-midnight-pine">Your Registered Donations & 13-Stage Lifecycle</h3>
          <span className="text-xs text-slate-500">{donations.length} records</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-soft-mint text-slate-500 font-semibold uppercase bg-cloud-white">
                <th className="py-3 px-4">Batch ID</th>
                <th className="py-3 px-3">Dishes Description</th>
                <th className="py-3 px-3">Quantity</th>
                <th className="py-3 px-3">Thermal State</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Recipient Partner</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-soft-mint text-slate-700">
              {donations.map(d => (
                <tr key={d.id} className="hover:bg-cloud-white transition">
                  <td className="py-3 px-4 font-mono font-bold text-deep-emerald">{d.id}</td>
                  <td className="py-3 px-3 font-semibold text-midnight-pine">{d.title}</td>
                  <td className="py-3 px-3 font-bold">{d.quantity || d.plates} {d.unit || 'plates'}</td>
                  <td className="py-3 px-3">{d.storage}</td>
                  <td className="py-3 px-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      ['Delivered', 'Completed'].includes(d.status)
                        ? 'bg-soft-mint text-deep-emerald'
                        : d.status === 'Accepted'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {d.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-slate-600">
                    {d.assigned_receiver_id ? d.assigned_receiver_id : 'Matching in progress...'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// --- 3. NGO / FOOD RECEIVER DASHBOARD VIEW (SECTION 18 SPEC) ---
window.NgoDashboardView = function NgoDashboardView({
  donations,
  onClaimDonation,
  onOpenNeedsBoard,
  currentNgo,
  onNavigateTab
}) {
  const availableDonations = donations.filter(d => ['Available', 'Listed'].includes(d.status));
  const acceptedDonations = donations.filter(d => ['Accepted', 'Pickup Assigned', 'Collected', 'In Transit'].includes(d.status));

  const [handoverStatus, setHandoverStatus] = React.useState({});
  const [loadingHandover, setLoadingHandover] = React.useState(false);
  const [ngoMsg, setNgoMsg] = React.useState(null);

  const handleConfirmNgoHandover = async (donationId) => {
    setLoadingHandover(true);
    try {
      if (window.SanjeevniAPI?.transport?.confirmHandover) {
        const pickupId = 'PK-' + donationId.replace('DON-', '');
        const res = await window.SanjeevniAPI.transport.confirmHandover(pickupId, 'receiver', 'Inspected temperature & meal quality. Verified safe.');
        setHandoverStatus(prev => ({ ...prev, [donationId]: true }));
        setNgoMsg({ type: 'success', text: res.message || 'Food arrival confirmed and safely logged!' });
      } else {
        setHandoverStatus(prev => ({ ...prev, [donationId]: true }));
        setNgoMsg({ type: 'success', text: 'Food arrival confirmed and safely logged!' });
      }
    } catch (e) {
      setNgoMsg({ type: 'error', text: 'Failed to record handover acknowledgement.' });
    } finally {
      setLoadingHandover(false);
    }
  };

  const navigateToKarn = () => {
    if (onNavigateTab) {
      onNavigateTab('karn_logistics');
    } else {
      window.location.hash = 'karn_logistics';
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-3xl bg-white border border-soft-mint shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-deep-emerald">Role 2: NGO / Food Receiver Portal</span>
          <h2 className="text-xl font-black text-midnight-pine">Surplus Food Redistribution & Allocation</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Partner: <strong>{currentNgo?.name || 'Akshaya Food Shelter (Capacity: 120 pax, Pure Veg)'}</strong>
          </p>
        </div>

        <button
          onClick={onOpenNeedsBoard}
          className="px-5 py-2.5 rounded-xl bg-deep-emerald hover:bg-midnight-pine text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 self-start"
        >
          <span>📢</span> Post Tonight's Meal Requirement
        </button>
      </div>

      {ngoMsg && (
        <div className={`p-3 rounded-xl text-xs font-semibold flex items-center justify-between ${
          ngoMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          <span>{ngoMsg.text}</span>
          <button onClick={() => setNgoMsg(null)} className="font-bold ml-2">✕</button>
        </div>
      )}

      {/* INBOUND LOGISTICS & ACCEPTED RESCUES (SECTION 18 & KARN SPEC) */}
      <div className="bg-white rounded-3xl border border-soft-mint overflow-hidden shadow-sm space-y-4">
        <div className="p-5 border-b border-soft-mint flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-soft-mint text-deep-emerald text-sm">📦</span>
              <h3 className="text-base font-bold text-midnight-pine">Accepted Rescues & Inbound Logistics</h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Monitor incoming surplus batches, delivery arrangements, and confirm physical receipt.
            </p>
          </div>
          <button
            onClick={navigateToKarn}
            className="px-3.5 py-1.5 rounded-xl bg-soft-mint text-deep-emerald hover:bg-impact-green hover:text-white font-bold text-xs transition flex items-center gap-1.5 self-start"
          >
            <span>📡</span> Open Live KARN Tracker
          </button>
        </div>

        <div className="p-5 pt-0">
          {acceptedDonations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {acceptedDonations.map(d => {
                const isConfirmed = handoverStatus[d.id] || d.receiver_handover_confirmed;
                const isDonorDelivering = d.self_arranged_type === 'donor_delivery';
                const isReceiverPickup = d.self_arranged_type === 'receiver_pickup';
                const isCourier = d.transport_mode === 'donor_paid' || d.transport_mode === 'sponsored';

                return (
                  <div key={d.id} className="p-4 rounded-2xl border border-soft-mint bg-cloud-white space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-deep-emerald">{d.id}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-soft-mint text-deep-emerald">
                        {d.veg_type === 'Veg' || d.vegType === 'Veg' ? '🟢 Pure Veg' : '🔴 Non-Veg'}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-midnight-pine">{d.title}</h4>
                    <div className="text-xs text-slate-600">From: <strong>{d.donor_name || d.donorName || 'Registered Donor'}</strong></div>

                    {/* Logistics Arrangement Detail */}
                    <div className="p-3 rounded-xl bg-white border border-soft-mint text-xs space-y-1.5">
                      <div className="font-bold text-midnight-pine flex items-center gap-1.5">
                        <span>🚚</span>
                        <span>Arrangement: {
                          isDonorDelivering ? 'Self-Arranged (Donor Delivering Directly)' :
                          isReceiverPickup ? 'Self-Arranged (Shelter Team Collection)' :
                          isCourier ? 'Professional Courier Dispatched' : 'Standard Delivery'
                        }</span>
                      </div>
                      <div className="text-slate-500 text-[11px]">
                        {isDonorDelivering && 'Donor is transporting the meals directly to your facility.'}
                        {isReceiverPickup && 'Please dispatch your volunteer/staff to donor location before safe window.'}
                        {isCourier && 'Courier vehicle en route with insulated transport containers.'}
                      </div>
                      <div className="text-[11px] text-deep-emerald font-semibold">
                        📍 Donor Address: {d.address || 'Campus Mess, Sector 2'}
                      </div>
                    </div>

                    {/* Handover Acknowledgment Button */}
                    <div className="pt-1 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500">
                        {isConfirmed ? '✓ Custody Verified by Shelter' : 'Awaiting physical delivery receipt'}
                      </span>
                      <button
                        disabled={loadingHandover || isConfirmed}
                        onClick={() => handleConfirmNgoHandover(d.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                          isConfirmed
                            ? 'bg-emerald-100 text-emerald-800 cursor-default'
                            : 'bg-deep-emerald hover:bg-midnight-pine text-white shadow-sm'
                        }`}
                      >
                        {isConfirmed ? '✓ Food Received' : '✓ Confirm Food Received (Acknowledge Handover)'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-6 text-center text-slate-400 text-xs">
              No accepted batches currently in transit. Claim an available surplus opportunity below to coordinate arrival.
            </div>
          )}
        </div>
      </div>

      {/* Available Matches Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-midnight-pine">Available Nearby Surplus Opportunities (Safe-Until Checked)</h3>
          <span className="text-xs text-slate-500">{availableDonations.length} available right now</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {availableDonations.map(d => (
            <div key={d.id} className="p-5 rounded-3xl bg-white border border-soft-mint shadow-sm space-y-3 flex flex-col justify-between hover:border-impact-green transition">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-deep-emerald">{d.id}</span>
                  <span className="px-2 py-0.5 rounded font-bold bg-soft-mint text-deep-emerald text-[10px]">
                    {d.veg_type === 'Veg' || d.vegType === 'Veg' ? '🟢 Pure Veg' : '🔴 Non-Veg'}
                  </span>
                </div>

                <h4 className="text-base font-bold text-midnight-pine">{d.title}</h4>
                <div className="text-xs text-slate-500 font-medium">From: {d.donor_name || d.donorName}</div>

                <div className="p-3 rounded-2xl bg-cloud-white border border-soft-mint text-xs space-y-1">
                  <div>📦 <strong>{d.quantity || d.plates} plates</strong> ready for pickup</div>
                  <div>♨️ Thermal Storage: <strong>{d.storage}</strong></div>
                  <div>📍 Location: {d.address}</div>
                  <div className="text-[10px] text-deep-emerald font-bold">✓ Reachable within safe window</div>
                </div>
              </div>

              <button
                onClick={() => onClaimDonation(d.id)}
                className="w-full py-2.5 rounded-xl bg-deep-emerald hover:bg-midnight-pine text-white font-bold text-xs shadow-sm transition"
              >
                Accept & Claim Allocation ➔
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- 4. VOLUNTEER DASHBOARD VIEW (SECTION 18 SPEC) ---
window.VolunteerDashboardView = function VolunteerDashboardView({
  volunteers,
  onOpenDabbaBank,
  onOpenGamification,
  onConductChecklist
}) {
  const vol = (window.VOLUNTEER_PROFILES || [])[0] || {
    name: 'Rajesh Kumar',
    hoursVerified: 38.5,
    karmaPoints: 1240,
    level: 'Gold Guardian'
  };

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-3xl bg-white border border-soft-mint shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-deep-emerald">Role 3: Volunteer Dispatch Portal</span>
          <h2 className="text-xl font-black text-midnight-pine">Field Rescue, Hygiene Verification & Logistics</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Active Volunteer: <strong>{vol.name} (ID: V1, Motorcycle Insulated)</strong>
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onOpenDabbaBank}
            className="px-3.5 py-2.5 rounded-xl bg-soft-mint text-midnight-pine font-bold text-xs hover:bg-[#c9ded0] transition"
          >
            🥫 Dabba Bank
          </button>
          <button
            onClick={onOpenGamification}
            className="px-3.5 py-2.5 rounded-xl bg-deep-emerald text-white font-bold text-xs hover:bg-midnight-pine transition"
          >
            📜 Certificate & Badges
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-soft-mint space-y-1">
          <div className="text-xs text-slate-500">Verified Rescue Hours</div>
          <div className="text-2xl font-black text-midnight-pine">{vol.hoursVerified} hrs</div>
          <div className="text-[10px] text-deep-emerald font-semibold">College / NSS Credited</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-soft-mint space-y-1">
          <div className="text-xs text-slate-500">Karma Points</div>
          <div className="text-2xl font-black text-impact-green">{vol.karmaPoints} pts</div>
          <div className="text-[10px] text-slate-400">Rank: {vol.level}</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-soft-mint space-y-1">
          <div className="text-xs text-slate-500">Dabbas Returned</div>
          <div className="text-2xl font-black text-midnight-pine">24</div>
          <div className="text-[10px] text-deep-emerald font-semibold">Single-use trays saved</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-soft-mint space-y-1">
          <div className="text-xs text-slate-500">Hygiene Verification</div>
          <div className="text-2xl font-black text-impact-green">100%</div>
          <div className="text-[10px] text-slate-400">Digital probe checklists</div>
        </div>
      </div>

      {/* Active Field Task Card */}
      <div className="p-6 rounded-3xl bg-white border-2 border-deep-emerald shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="font-extrabold text-sm text-midnight-pine">Active Dispatch Task: Kaveri Mess ➔ Akshaya Shelter</span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-soft-mint text-deep-emerald font-bold text-xs">In Progress</span>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Surplus batch: <strong>Fresh Matar Paneer & 120 Phulka Rotis</strong>. Pickup from Sector 2 mess backdock and transfer to Akshaya Night Shelter (Bapat Square).
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <button
            onClick={() => onConductChecklist('DON-101')}
            className="py-2.5 px-4 rounded-xl bg-deep-emerald hover:bg-midnight-pine text-white font-bold text-xs transition"
          >
            📋 Conduct Digital Quality Checklist
          </button>
          <a
            href="https://www.google.com/maps/dir/?api=1&destination=22.7216,75.8617"
            target="_blank"
            rel="noopener noreferrer"
            className="py-2.5 px-4 rounded-xl bg-cloud-white hover:bg-soft-mint text-midnight-pine border border-soft-mint font-bold text-xs transition text-center"
          >
            🧭 Turn-by-Turn GPS Map
          </a>
          <button
            onClick={() => alert('Delivery custody confirmed! Digital signature saved.')}
            className="py-2.5 px-4 rounded-xl bg-midnight-pine hover:bg-black text-white font-bold text-xs transition"
          >
            ✅ Confirm Shelter Delivery
          </button>
        </div>
      </div>
    </div>
  );
};

// --- 5. ANIMAL WELFARE DASHBOARD VIEW (SECTION 18 SPEC) ---
window.AnimalWelfareDashboardView = function AnimalWelfareDashboardView({ wasteListings, onAcceptFeed }) {
  const feedListings = wasteListings.filter(w => (w.recovery_pathway || '').includes('Pathway B'));

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-3xl bg-white border border-soft-mint shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-800">Role 4: Animal Welfare Organisation</span>
          <h2 className="text-xl font-black text-midnight-pine">Gaushala Feed & Fodder Allocation Portal</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Partner Sanctuary: <strong>Karuna Gaushala & Stray Haven (Caring for 320 cattle & 140 community strays)</strong>
          </p>
        </div>

        <span className="px-3 py-1.5 rounded-xl bg-amber-100 text-amber-900 font-bold text-xs">
          🐄 Verified Fodder Safe
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-soft-mint space-y-1">
          <div className="text-xs text-slate-500">Animals Nourished</div>
          <div className="text-2xl font-black text-midnight-pine">460+</div>
          <div className="text-[10px] text-amber-700 font-semibold">Cattle & rescued strays</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-soft-mint space-y-1">
          <div className="text-xs text-slate-500">Fresh Scraps Received</div>
          <div className="text-2xl font-black text-deep-emerald">125 kg</div>
          <div className="text-[10px] text-slate-400">Vegetable trimmings & rotis</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-soft-mint space-y-1">
          <div className="text-xs text-slate-500">Safe Feed Compliance</div>
          <div className="text-2xl font-black text-impact-green">100%</div>
          <div className="text-[10px] text-slate-400">Veterinary checked</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-soft-mint space-y-1">
          <div className="text-xs text-slate-500">Feed Cost Saved</div>
          <div className="text-2xl font-black text-midnight-pine">₹18,400</div>
          <div className="text-[10px] text-deep-emerald font-semibold">This month</div>
        </div>
      </div>

      {/* Available Feed Listings */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-midnight-pine">Available Verified Animal Feed Batches (Pathway B)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {feedListings.map(item => (
            <div key={item.id} className="p-5 rounded-3xl bg-white border border-soft-mint shadow-sm space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono font-bold text-deep-emerald">{item.id}</span>
                <span className="px-2 py-0.5 rounded font-bold bg-amber-100 text-amber-800 text-[10px]">
                  {item.waste_condition || 'Fresh Raw Scraps'}
                </span>
              </div>

              <h4 className="text-base font-bold text-midnight-pine">{item.category}</h4>
              <p className="text-xs text-slate-600">{item.material_description}</p>

              <div className="p-3 rounded-2xl bg-cloud-white border border-soft-mint text-xs space-y-1">
                <div>📦 Quantity: <strong>{item.quantity_kg} kg</strong></div>
                <div>🏢 Origin: {item.source_name}</div>
                <div>📍 Pickup Dock: {item.pickup_location}</div>
                <div className="text-[10px] text-emerald-700 font-bold">✓ Non-biodegradable packaging strictly separated</div>
              </div>

              {item.status === 'Registered' && (
                <button
                  onClick={() => onAcceptFeed(item.id)}
                  className="w-full py-2.5 rounded-xl bg-deep-emerald hover:bg-midnight-pine text-white font-bold text-xs shadow-sm transition"
                >
                  Accept Fodder Batch for Gaushala ➔
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- 6. WASTE PROCESSING PARTNER DASHBOARD (SECTION 18 SPEC) ---
window.WastePartnerDashboardView = function WastePartnerDashboardView({ wasteListings, onRecordOutcome }) {
  const bioListings = wasteListings.filter(w => (w.recovery_pathway || '').includes('Pathway C'));

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-3xl bg-white border border-soft-mint shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">Role 5: Waste Processing Partner</span>
          <h2 className="text-xl font-black text-midnight-pine">Biogas & Organic Compost Conversion Console</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Facility: <strong>GreenEarth City Biomethanation & Compost Plant (50 TPD Municipal Anaerobic Digester)</strong>
          </p>
        </div>

        <span className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-900 font-bold text-xs">
          ⚡ Circular Energy & Soil
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-soft-mint space-y-1">
          <div className="text-xs text-slate-500">Organic Inflow Received</div>
          <div className="text-2xl font-black text-midnight-pine">180 kg</div>
          <div className="text-[10px] text-deep-emerald font-semibold">Clean separated organics</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-soft-mint space-y-1">
          <div className="text-xs text-slate-500">Biogas Energy Generated</div>
          <div className="text-2xl font-black text-deep-emerald">42 kWh</div>
          <div className="text-[10px] text-slate-400">Green grid electricity</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-soft-mint space-y-1">
          <div className="text-xs text-slate-500">Verified Compost Yield</div>
          <div className="text-2xl font-black text-impact-green">63 kg</div>
          <div className="text-[10px] text-emerald-700 font-bold">Grade-A Biofertilizer</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-soft-mint space-y-1">
          <div className="text-xs text-slate-500">Landfill Diversion</div>
          <div className="text-2xl font-black text-midnight-pine">100%</div>
          <div className="text-[10px] text-deep-emerald font-semibold">Methane emissions averted</div>
        </div>
      </div>

      {/* Available Recovery Batches */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-midnight-pine">Organic Residue Inflows Awaiting Digestion / Curing</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bioListings.map(item => (
            <div key={item.id} className="p-5 rounded-3xl bg-white border border-soft-mint shadow-sm space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono font-bold text-deep-emerald">{item.id}</span>
                <span className="px-2 py-0.5 rounded font-bold bg-emerald-100 text-emerald-800 text-[10px]">
                  {item.status}
                </span>
              </div>

              <h4 className="text-base font-bold text-midnight-pine">{item.category}</h4>
              <p className="text-xs text-slate-600">{item.material_description}</p>

              <div className="p-3 rounded-2xl bg-cloud-white border border-soft-mint text-xs space-y-1">
                <div>📦 Weight: <strong>{item.quantity_kg} kg</strong></div>
                <div>🏢 Facility Origin: {item.source_name}</div>
                {item.processing_outcome && (
                  <div className="text-[11px] text-deep-emerald font-bold pt-1 border-t border-soft-mint">
                    Result: {item.processing_outcome}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- 7. ADMIN DASHBOARD & VERIFICATION CONSOLE (SECTIONS 13 & 4 SPEC) ---
window.AdminDashboardView = function AdminDashboardView({
  crisisState,
  onToggleCrisis,
  onOpenHotspots,
  impactStats,
  organisations,
  onVerifyOrg,
  onNavigateTab
}) {
  const pendingOrgs = (organisations || []).filter(o => o.verification_status === 'Pending' || o.verification_status === 'Under Review');

  const [transportFunding, setTransportFunding] = React.useState(null);
  const [providers, setProviders] = React.useState([]);
  const [loadingLedger, setLoadingLedger] = React.useState(false);
  const [activeAdminSubTab, setActiveAdminSubTab] = React.useState('pending_sponsors');
  const [selectedFundingSources, setSelectedFundingSources] = React.useState({});
  const [adminMsg, setAdminMsg] = React.useState(null);

  const loadAdminLogistics = async () => {
    setLoadingLedger(true);
    try {
      if (window.SanjeevniAPI?.transport) {
        const [fundRes, provRes] = await Promise.all([
          window.SanjeevniAPI.transport.getFunding(),
          window.SanjeevniAPI.transport.getProviders()
        ]);
        setTransportFunding(fundRes);
        setProviders(provRes || []);
      }
    } catch (e) {
      console.warn('Error loading transport data in admin:', e);
    } finally {
      setLoadingLedger(false);
    }
  };

  React.useEffect(() => {
    loadAdminLogistics();
  }, []);

  const handleApproveFunding = async (reqId, approved) => {
    setLoadingLedger(true);
    try {
      const fundSourceId = selectedFundingSources[reqId] || 'FUND-001';
      const res = await window.SanjeevniAPI.transport.approveFunding(reqId, approved ? fundSourceId : null, approved);
      setAdminMsg({ type: 'success', text: res.message || 'Sponsorship decision updated successfully.' });
      await loadAdminLogistics();
    } catch (e) {
      setAdminMsg({ type: 'error', text: 'Failed to update sponsorship decision.' });
    } finally {
      setLoadingLedger(false);
    }
  };

  const handleToggleProvider = async (providerId, currentStatus) => {
    setLoadingLedger(true);
    try {
      const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
      const res = await window.SanjeevniAPI.transport.updateProviderStatus(providerId, newStatus);
      setAdminMsg({ type: 'success', text: res.message || `Provider status set to ${newStatus}` });
      await loadAdminLogistics();
    } catch (e) {
      setAdminMsg({ type: 'error', text: 'Failed to update provider status.' });
    } finally {
      setLoadingLedger(false);
    }
  };

  const pendingRequests = transportFunding?.pendingRequests || [];
  const fundingSources = transportFunding?.fundingSources || [];
  const expenses = transportFunding?.expenses || [];

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-3xl bg-white border border-soft-mint shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-deep-emerald">Role 6: Municipal & Platform Administrator</span>
          <h2 className="text-xl font-black text-midnight-pine">Citywide Zero-Waste Supervision & Verification Command</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Authority: Municipal Food Rescue Oversight & Disaster Relief Coordination Cell
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onToggleCrisis}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              crisisState?.is_active || crisisState?.isActive
                ? 'bg-rose-600 text-white animate-pulse'
                : 'bg-midnight-pine text-white hover:bg-[#0f1f1c]'
            }`}
          >
            <span>🚨</span>
            <span>{crisisState?.is_active || crisisState?.isActive ? 'Crisis Mode ACTIVE' : 'Activate Crisis Mode'}</span>
          </button>
          <button
            onClick={onOpenHotspots}
            className="px-4 py-2.5 rounded-xl bg-deep-emerald text-white font-bold text-xs hover:bg-midnight-pine transition flex items-center gap-1.5"
          >
            <span>🏙️</span> City Hotspots
          </button>
        </div>
      </div>

      {/* KPI Cards (Section 13 Spec) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-soft-mint space-y-1">
          <div className="text-[11px] text-slate-500">Registered Donors</div>
          <div className="text-xl font-black text-midnight-pine">4 Facilities</div>
          <div className="text-[10px] text-slate-400">Messes, banquets, cafes</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-soft-mint space-y-1">
          <div className="text-[11px] text-slate-500">Verified NGOs</div>
          <div className="text-xl font-black text-deep-emerald">5 Shelters</div>
          <div className="text-[10px] text-slate-400">Night shelters & orphanages</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-soft-mint space-y-1">
          <div className="text-[11px] text-slate-500">Active Volunteers</div>
          <div className="text-xl font-black text-midnight-pine">6 Field Dispatched</div>
          <div className="text-[10px] text-impact-green font-semibold">Covering urban sectors</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-soft-mint space-y-1">
          <div className="text-[11px] text-slate-500">Animal Shelters</div>
          <div className="text-xl font-black text-amber-700">1 Gaushala</div>
          <div className="text-[10px] text-slate-400">Karuna Sanctuary</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-soft-mint space-y-1">
          <div className="text-[11px] text-slate-500">Waste Partners</div>
          <div className="text-xl font-black text-deep-emerald">1 Plant</div>
          <div className="text-[10px] text-slate-400">Biogas & Vermicompost</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-soft-mint space-y-1">
          <div className="text-[11px] text-slate-500">Landfill Diversion</div>
          <div className="text-xl font-black text-impact-green">100%</div>
          <div className="text-[10px] text-emerald-700 font-bold">Zero Waste Rate</div>
        </div>
      </div>

      {adminMsg && (
        <div className={`p-3 rounded-xl text-xs font-semibold flex items-center justify-between ${
          adminMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          <span>{adminMsg.text}</span>
          <button onClick={() => setAdminMsg(null)} className="font-bold ml-2">✕</button>
        </div>
      )}

      {/* =========================================================================
          KARN TRANSPORTATION FUNDING LEDGER & LOGISTICS COMMAND (NEW MASTER SYSTEM)
         ========================================================================= */}
      <div className="bg-white rounded-3xl border border-soft-mint overflow-hidden shadow-sm space-y-4">
        <div className="p-5 border-b border-soft-mint flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-soft-mint text-deep-emerald text-sm">🏛️</span>
              <h3 className="text-base font-bold text-midnight-pine">Transportation Funding Ledger & Logistics Command</h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Administer CSR sponsorship grants, approve requested funding allocations, review expenses, and manage verified fleet providers.
            </p>
          </div>
          <button
            onClick={loadAdminLogistics}
            disabled={loadingLedger}
            className="px-3.5 py-1.5 rounded-xl bg-cloud-white border border-soft-mint text-slate-700 hover:bg-soft-mint hover:text-deep-emerald font-bold text-xs transition flex items-center gap-1.5 self-start"
          >
            <span>🔄</span> Refresh Ledger
          </button>
        </div>

        {/* 4 Funding Pool Summary KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 px-5">
          <div className="p-3.5 rounded-2xl bg-cloud-white border border-soft-mint space-y-0.5">
            <div className="text-[11px] text-slate-500 font-medium">Total Sponsorship Pool</div>
            <div className="text-lg font-black text-midnight-pine">₹{(transportFunding?.total_budget || 120000).toLocaleString('en-IN')}</div>
            <div className="text-[10px] text-deep-emerald font-semibold">Institutional & CSR Grants</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-cloud-white border border-soft-mint space-y-0.5">
            <div className="text-[11px] text-slate-500 font-medium">Allocated to Deliveries</div>
            <div className="text-lg font-black text-amber-700">₹{(transportFunding?.total_allocated || 3120).toLocaleString('en-IN')}</div>
            <div className="text-[10px] text-slate-400">Committed to active pickups</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-cloud-white border border-soft-mint space-y-0.5">
            <div className="text-[11px] text-slate-500 font-medium">Disbursed / Paid Expenses</div>
            <div className="text-lg font-black text-deep-emerald">₹{(transportFunding?.total_spent || 2480).toLocaleString('en-IN')}</div>
            <div className="text-[10px] text-impact-green font-semibold">Verified digital receipts</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-cloud-white border border-soft-mint space-y-0.5">
            <div className="text-[11px] text-slate-500 font-medium">Available Sponsorship Balance</div>
            <div className="text-lg font-black text-impact-green">₹{(transportFunding?.total_available || 116880).toLocaleString('en-IN')}</div>
            <div className="text-[10px] text-emerald-700 font-bold">Ready for new allocations</div>
          </div>
        </div>

        {/* Sub-Tab Navigation Bar */}
        <div className="px-5 border-b border-soft-mint flex flex-wrap gap-2 text-xs font-bold">
          <button
            onClick={() => setActiveAdminSubTab('pending_sponsors')}
            className={`py-2 px-3 border-b-2 transition flex items-center gap-1.5 ${
              activeAdminSubTab === 'pending_sponsors'
                ? 'border-deep-emerald text-deep-emerald'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>📋</span> Pending Sponsor Allocations ({pendingRequests.length})
          </button>
          <button
            onClick={() => setActiveAdminSubTab('funding_sources')}
            className={`py-2 px-3 border-b-2 transition flex items-center gap-1.5 ${
              activeAdminSubTab === 'funding_sources'
                ? 'border-deep-emerald text-deep-emerald'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>🏛️</span> Funding Sources ({fundingSources.length})
          </button>
          <button
            onClick={() => setActiveAdminSubTab('expenses')}
            className={`py-2 px-3 border-b-2 transition flex items-center gap-1.5 ${
              activeAdminSubTab === 'expenses'
                ? 'border-deep-emerald text-deep-emerald'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>🧾</span> Logistics Expenses & Audit Trail ({expenses.length})
          </button>
          <button
            onClick={() => setActiveAdminSubTab('providers')}
            className={`py-2 px-3 border-b-2 transition flex items-center gap-1.5 ${
              activeAdminSubTab === 'providers'
                ? 'border-deep-emerald text-deep-emerald'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>🛵</span> Verified Fleet Providers ({providers.length})
          </button>
        </div>

        {/* Sub-Tab 1: Pending Sponsor Requests */}
        {activeAdminSubTab === 'pending_sponsors' && (
          <div className="p-5 pt-0 overflow-x-auto">
            {pendingRequests.length > 0 ? (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-soft-mint text-slate-500 font-semibold uppercase bg-cloud-white">
                    <th className="py-2.5 px-3">Request ID</th>
                    <th className="py-2.5 px-3">Batch & Details</th>
                    <th className="py-2.5 px-3">Quoted Logistics Cost</th>
                    <th className="py-2.5 px-3">Assign Funding Source</th>
                    <th className="py-2.5 px-3 text-right">Approval Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-soft-mint text-slate-700">
                  {pendingRequests.map(req => (
                    <tr key={req.id} className="hover:bg-cloud-white transition">
                      <td className="py-3 px-3 font-mono font-bold text-deep-emerald">{req.id}</td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-midnight-pine">{req.donation_id}</div>
                        <div className="text-[11px] text-slate-500">{req.donor_name} ➔ {req.receiver_name}</div>
                      </td>
                      <td className="py-3 px-3 font-black text-midnight-pine">
                        ₹{Number(req.quoted_cost || 280).toFixed(2)}
                      </td>
                      <td className="py-3 px-3">
                        <select
                          value={selectedFundingSources[req.id] || (fundingSources[0]?.id || 'FUND-001')}
                          onChange={(e) => setSelectedFundingSources({ ...selectedFundingSources, [req.id]: e.target.value })}
                          className="px-2 py-1 rounded-lg border border-soft-mint text-xs bg-white text-slate-700 font-medium"
                        >
                          {fundingSources.filter(f => f.available_budget >= (req.quoted_cost || 280)).map(f => (
                            <option key={f.id} value={f.id}>
                              {f.name} (Avail: ₹{Number(f.available_budget).toFixed(0)})
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3 px-3 text-right space-x-2">
                        <button
                          disabled={loadingLedger}
                          onClick={() => handleApproveFunding(req.id, true)}
                          className="px-3 py-1 rounded-lg bg-deep-emerald hover:bg-midnight-pine text-white font-bold text-xs transition"
                        >
                          ✓ Approve & Allocate
                        </button>
                        <button
                          disabled={loadingLedger}
                          onClick={() => handleApproveFunding(req.id, false)}
                          className="px-2.5 py-1 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold text-xs transition"
                        >
                          ✕ Reject (Mark Unavailable)
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="py-8 text-center text-slate-400 text-xs">
                ✓ No pending sponsored transportation requests awaiting allocation.
              </div>
            )}
          </div>
        )}

        {/* Sub-Tab 2: Funding Sources Ledger */}
        {activeAdminSubTab === 'funding_sources' && (
          <div className="p-5 pt-0 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-soft-mint text-slate-500 font-semibold uppercase bg-cloud-white">
                  <th className="py-2.5 px-3">Fund ID</th>
                  <th className="py-2.5 px-3">Sponsor / Grant Name</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Total Budget</th>
                  <th className="py-2.5 px-3">Allocated</th>
                  <th className="py-2.5 px-3">Available Balance</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-soft-mint text-slate-700">
                {fundingSources.map(f => (
                  <tr key={f.id} className="hover:bg-cloud-white transition">
                    <td className="py-3 px-3 font-mono font-bold text-deep-emerald">{f.id}</td>
                    <td className="py-3 px-3 font-semibold text-midnight-pine">{f.name}</td>
                    <td className="py-3 px-3 text-slate-500">{f.category}</td>
                    <td className="py-3 px-3 font-bold">₹{Number(f.total_budget).toLocaleString('en-IN')}</td>
                    <td className="py-3 px-3 text-amber-700 font-bold">₹{Number(f.allocated_budget).toLocaleString('en-IN')}</td>
                    <td className="py-3 px-3 text-impact-green font-black">₹{Number(f.available_budget).toLocaleString('en-IN')}</td>
                    <td className="py-3 px-3 text-right">
                      <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-emerald-100 text-emerald-800">
                        {f.status || 'Active'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Sub-Tab 3: Logistics Expenses */}
        {activeAdminSubTab === 'expenses' && (
          <div className="p-5 pt-0 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-soft-mint text-slate-500 font-semibold uppercase bg-cloud-white">
                  <th className="py-2.5 px-3">Expense ID</th>
                  <th className="py-2.5 px-3">Pickup ID</th>
                  <th className="py-2.5 px-3">Logistics Provider</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Payment Status</th>
                  <th className="py-2.5 px-3">Receipt Reference</th>
                  <th className="py-2.5 px-3 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-soft-mint text-slate-700">
                {expenses.map(exp => (
                  <tr key={exp.id} className="hover:bg-cloud-white transition">
                    <td className="py-3 px-3 font-mono font-bold text-deep-emerald">{exp.id}</td>
                    <td className="py-3 px-3 font-mono">{exp.pickup_id}</td>
                    <td className="py-3 px-3 font-semibold text-midnight-pine">{exp.provider_name}</td>
                    <td className="py-3 px-3 font-black text-midnight-pine">₹{Number(exp.amount).toFixed(2)}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                        exp.payment_status === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {exp.payment_status}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-500">{exp.receipt_url || 'RCP-TXN-VERIFIED'}</td>
                    <td className="py-3 px-3 text-right text-slate-400 text-[11px]">{exp.created_at || 'Today'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Sub-Tab 4: Verified Logistics Providers */}
        {activeAdminSubTab === 'providers' && (
          <div className="p-5 pt-0 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-soft-mint text-slate-500 font-semibold uppercase bg-cloud-white">
                  <th className="py-2.5 px-3">Provider ID</th>
                  <th className="py-2.5 px-3">Company / Fleet</th>
                  <th className="py-2.5 px-3">Service Type</th>
                  <th className="py-2.5 px-3">Vehicle Fleet</th>
                  <th className="py-2.5 px-3">Service Rating</th>
                  <th className="py-2.5 px-3">Active Tasks</th>
                  <th className="py-2.5 px-3 text-right">Status Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-soft-mint text-slate-700">
                {providers.map(prov => (
                  <tr key={prov.id} className="hover:bg-cloud-white transition">
                    <td className="py-3 px-3 font-mono font-bold text-deep-emerald">{prov.id}</td>
                    <td className="py-3 px-3 font-semibold text-midnight-pine">{prov.name}</td>
                    <td className="py-3 px-3 text-slate-500">{prov.service_type}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-soft-mint text-deep-emerald text-[10px] font-bold">
                        {prov.vehicle_types}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-bold text-amber-700">⭐ {prov.rating || '4.8'}</td>
                    <td className="py-3 px-3 font-semibold">{prov.active_pickups || 0} active</td>
                    <td className="py-3 px-3 text-right">
                      <button
                        disabled={loadingLedger}
                        onClick={() => handleToggleProvider(prov.id, prov.status)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                          prov.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        }`}
                      >
                        {prov.status === 'Active' ? '✓ Active (Toggle)' : 'Inactive (Toggle)'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ORGANISATION VERIFICATION QUEUE (SECTION 4.2 SPEC) */}
      <div className="bg-white rounded-3xl border border-soft-mint overflow-hidden shadow-sm space-y-3">
        <div className="p-5 border-b border-soft-mint flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-midnight-pine">Organisation Verification Console (Section 4 Spec)</h3>
            <p className="text-xs text-slate-500">Review pending registrations and grant verified status</p>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-xs">
            {pendingOrgs.length} Awaiting Review
          </span>
        </div>

        <div className="overflow-x-auto p-2">
          {pendingOrgs.length > 0 ? (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-soft-mint text-slate-500 font-semibold uppercase bg-cloud-white">
                  <th className="py-2.5 px-4">Org ID</th>
                  <th className="py-2.5 px-3">Organisation Name</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Contact Person</th>
                  <th className="py-2.5 px-3">Phone & Email</th>
                  <th className="py-2.5 px-4 text-right">Verification Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-soft-mint text-slate-700">
                {pendingOrgs.map(org => (
                  <tr key={org.id} className="hover:bg-cloud-white transition">
                    <td className="py-3 px-4 font-mono font-bold text-deep-emerald">{org.id}</td>
                    <td className="py-3 px-3 font-semibold text-midnight-pine">{org.name}</td>
                    <td className="py-3 px-3">{org.category}</td>
                    <td className="py-3 px-3">{org.contact_person || 'Not provided'}</td>
                    <td className="py-3 px-3">
                      <div>{org.phone}</div>
                      <div className="text-[10px] text-slate-400">{org.email}</div>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => onVerifyOrg(org.id, 'Verified')}
                        className="px-3 py-1 rounded-lg bg-deep-emerald hover:bg-midnight-pine text-white font-bold text-xs transition"
                      >
                        ✓ Approve & Verify
                      </button>
                      <button
                        onClick={() => onVerifyOrg(org.id, 'Rejected')}
                        className="px-2.5 py-1 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold text-xs transition"
                      >
                        ✕ Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-8 text-center text-slate-400 text-xs">
              ✓ All organisation registrations are up-to-date and verified.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

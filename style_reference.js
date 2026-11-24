// =========================================================================
// SANJEEVNI - UNIFIED DESIGN SYSTEM & STYLE REFERENCE (LIVING STYLE GUIDE)
// Palette: Deep Lagoon (#114B5F), Teal (#028090), Steel Blue (#456990), Mint (#E4FDE1), Coral (#F45B69)
// Derived Tints: Page BG (#F7FEF6), Muted Text (#3D5C6B), Soft Panel (#D8E6EC), Borders (#D3E5DC), On-Coral (#072A35)
// =========================================================================

window.StyleReferenceSection = function StyleReferenceSection({ onSwitchTab }) {
  const [copiedToken, setCopiedToken] = React.useState(null);
  const [activeTab, setActiveTab] = React.useState('tokens'); // 'tokens', 'coral_rules', 'components', 'contrast', 'rules'
  const [selectedChip, setSelectedChip] = React.useState('50');

  const copyToClipboard = (text, tokenName) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedToken(tokenName);
      if (window.audio) window.audio.playChime('click');
      setTimeout(() => setCopiedToken(null), 2000);
    } catch (e) {
      console.warn("Clipboard access denied", e);
    }
  };

  const CORE_TOKENS = [
    {
      name: 'Deep Lagoon',
      hex: '#114B5F',
      rgb: 'rgb(17, 75, 95)',
      cssVar: '--color-deep-lagoon',
      tailwind: 'deep-lagoon',
      role: 'Darkest color. Headings, body text on light backgrounds, navbar, footer, dark-mode background',
      lightUse: 'Primary body text, headings, sticky top navbar, footer, high-contrast borders',
      darkUse: 'Application page background, base surface',
      contrastOnPage: '9.3:1 (AAA High Contrast)',
      contrastText: '#F7FEF6',
      bgClass: 'bg-[#114B5F]',
      textClass: 'text-[#F7FEF6]'
    },
    {
      name: 'Teal',
      hex: '#028090',
      rgb: 'rgb(2, 128, 144)',
      cssVar: '--color-teal',
      tailwind: 'teal',
      role: 'Primary brand color. Primary buttons, links, active states, progress bars, selected states',
      lightUse: 'Primary non-donation buttons, verified badges, active tabs, progress bar fill, links',
      darkUse: 'Primary brand highlights, secondary active borders at 35% opacity',
      contrastOnPage: '4.5:1 (WCAG AA Compliant for body and headers)',
      contrastText: '#FFFFFF',
      bgClass: 'bg-[#028090]',
      textClass: 'text-white'
    },
    {
      name: 'Steel Blue',
      hex: '#456990',
      rgb: 'rgb(69, 105, 144)',
      cssVar: '--color-steel-blue',
      tailwind: 'steel-blue',
      role: 'Secondary accent. Icons, illustrations, chart series, secondary highlights, badges',
      lightUse: 'Secondary icons, informational badges, secondary chart metrics, illustrations',
      darkUse: 'Secondary accent highlights, muted pills',
      contrastOnPage: '5.6:1 (WCAG AA Compliant)',
      contrastText: '#FFFFFF',
      bgClass: 'bg-[#456990]',
      textClass: 'text-white'
    },
    {
      name: 'Mint',
      hex: '#E4FDE1',
      rgb: 'rgb(228, 253, 225)',
      cssVar: '--color-mint',
      tailwind: 'mint',
      role: 'Soft tint. Hero/section backgrounds, tags, selected rows, info banners, hover backgrounds',
      lightUse: 'Section banners, tag backgrounds, selected row highlights, info alert fills, progress tracks',
      darkUse: 'Subtle text dividers and highlights at reduced opacity',
      contrastOnPage: 'Surface tint. Text must be Deep Lagoon (#114B5F) for 10.5:1 AAA contrast.',
      contrastText: '#114B5F',
      bgClass: 'bg-[#E4FDE1]',
      textClass: 'text-[#114B5F]'
    },
    {
      name: 'Coral (ACTION)',
      hex: '#F45B69',
      rgb: 'rgb(244, 91, 105)',
      cssVar: '--color-coral',
      tailwind: 'coral / action',
      role: 'ACTION COLOR. Donation call-to-action buttons ONLY. Strictly reserved for food donation CTAs.',
      lightUse: 'Donation CTAs only ("Donate Food", "+ Post Food", "Confirm Donation", sticky mobile bar)',
      darkUse: 'Same: Coral button fill (#F45B69) with very dark teal text (#072A35)',
      contrastOnPage: 'Button fill only. Text on Coral MUST be #072A35 (4.7:1 AA Pass). Never white!',
      contrastText: '#072A35',
      bgClass: 'bg-[#F45B69]',
      textClass: 'text-[#072A35]'
    }
  ];

  const DERIVED_TINTS = [
    { name: 'Page Background', hex: '#F7FEF6', cssVar: '--color-page-bg', role: 'Main canvas and card background surface', textHex: '#114B5F' },
    { name: 'Muted Text', hex: '#3D5C6B', cssVar: '--color-text-muted', role: 'Secondary descriptions, labels, timestamps', textHex: '#FFFFFF' },
    { name: 'Soft Panel', hex: '#D8E6EC', cssVar: '--color-soft-panel', role: 'Impact cards, secondary surfaces, neutral panels', textHex: '#114B5F' },
    { name: 'Borders & Dividers', hex: '#D3E5DC', cssVar: '--color-border', role: '1px card borders, dividing lines, table rules', textHex: '#114B5F' },
    { name: 'Text on Coral', hex: '#072A35', cssVar: '--color-on-coral', role: 'Mandatory high-contrast text on Coral buttons (4.7:1 AA)', textHex: '#FFFFFF' }
  ];

  const STATUS_TOKENS = [
    {
      name: 'Success Flow',
      icon: '✓',
      textHex: '#028090',
      bgHex: '#E4FDE1',
      borderHex: '#028090',
      role: 'Verified rescues, safe quality checks passed, normal ladder decay stage',
      sample: '✓ Donation Claimed by Akshaya Food Shelter'
    },
    {
      name: 'Shelf-Life Warning',
      icon: '⚠️',
      textHex: '#B7791F',
      bgHex: '#FEFCE8',
      borderHex: '#FDE047',
      role: 'Safe human window < 1 hour, temperature drift approaching threshold',
      sample: '⚠️ Safe Window < 45 Mins Remaining'
    },
    {
      name: 'Decay / Critical Error',
      icon: '🚨',
      textHex: '#B42318',
      bgHex: '#FDF2F2',
      borderHex: '#FECDCA',
      role: 'Human shelf-life expired, rerouting to animal feed/compost, critical transit delay',
      sample: '🚨 Re-routed to Tier 2 Karuna Gaushala (Never confused with Coral)'
    },
    {
      name: 'Information Banner',
      icon: 'ℹ️',
      textHex: '#114B5F',
      bgHex: '#E4FDE1',
      borderHex: '#D3E5DC',
      role: 'System notifications, guidance messages, routing recommendations',
      sample: 'ℹ️ Volunteer Rajesh Kumar dispatched with thermal EV container'
    }
  ];

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Design System Hero Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#114B5F] text-[#F7FEF6] shadow-xl relative overflow-hidden border border-[#028090]/40">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#028090]/30 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E4FDE1] text-[#072A35] text-xs font-black uppercase tracking-wider">
            <span>🎨</span> Sanjeevni Design System
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#F7FEF6]">
            Consistent Civic Donation Design System & Style Reference
          </h2>
          <p className="text-sm text-[#D8E6EC] leading-relaxed">
            A single, consistent, WCAG AA accessible design system for SANJEEVNI. Featuring Deep Lagoon, Teal, Steel Blue, Mint, and Coral (exclusively reserved for food donation actions with high-contrast text).
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-semibold text-[#F7FEF6]">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 border border-white/20">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F45B69]"></span> Strict Coral Action Token
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 border border-white/20">
              <span className="w-2.5 h-2.5 rounded-full bg-[#028090]"></span> Teal Primary Brand
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 border border-white/20">
              <span className="w-2.5 h-2.5 rounded-full bg-[#456990]"></span> Steel Blue Secondary
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 border border-white/20">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E4FDE1]"></span> Mint Section Surface
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 border border-white/20">
              <span className="w-2.5 h-2.5 rounded-full bg-[#114B5F]"></span> WCAG AA Strict Contrast
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-[#D3E5DC] dark:border-slate-800 pb-2 overflow-x-auto text-xs font-bold">
        {[
          { id: 'tokens', label: '1. Core Tokens & Derived Tints' },
          { id: 'coral_rules', label: '2. Coral Action Token (Strict Rules)' },
          { id: 'components', label: '3. Live UI Components' },
          { id: 'contrast', label: '4. WCAG AA Contrast Matrix' },
          { id: 'rules', label: '5. CSS Tokens & Architecture' }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => {
              setActiveTab(t.id);
              if (window.audio) window.audio.playChime('click');
            }}
            className={`px-4 py-2 rounded-xl transition whitespace-nowrap ${
              activeTab === t.id
                ? 'bg-[#028090] text-white shadow-sm ring-1 ring-[#456990]'
                : 'text-[#3D5C6B] dark:text-[#D8E6EC] hover:bg-[#E4FDE1] hover:text-[#114B5F]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* VIEW 1: TOKENS MATRIX */}
      {activeTab === 'tokens' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {CORE_TOKENS.map(token => (
              <div
                key={token.name}
                className="rounded-2xl bg-white dark:bg-slate-800 border border-[#D3E5DC] dark:border-slate-700 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition"
              >
                {/* Color Swatch Header */}
                <div
                  className="h-28 p-4 flex flex-col justify-between relative transition"
                  style={{ backgroundColor: token.hex, color: token.contrastText }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-black/20 backdrop-blur-sm">
                      {token.tailwind}
                    </span>
                    <button
                      onClick={() => copyToClipboard(token.hex, token.name)}
                      className="px-2 py-1 rounded bg-black/25 hover:bg-black/40 text-[11px] font-mono transition flex items-center gap-1 cursor-pointer"
                      title="Copy Hex"
                    >
                      {copiedToken === token.name ? '✓ Copied!' : token.hex}
                    </button>
                  </div>
                  <div>
                    <h3 className="text-lg font-black tracking-tight">{token.name}</h3>
                    <p className="text-[11px] opacity-90 font-mono">{token.cssVar}</p>
                  </div>
                </div>

                {/* Swatch Details */}
                <div className="p-4 space-y-3 text-xs flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#3D5C6B] dark:text-slate-400">
                        Design Role
                      </span>
                      <p className="text-[#114B5F] dark:text-[#F7FEF6] font-medium mt-0.5 leading-snug">
                        {token.role}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-[#D3E5DC]/60 dark:border-slate-700">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#3D5C6B] dark:text-slate-400">
                        Application
                      </span>
                      <p className="text-[#3D5C6B] dark:text-[#D8E6EC] mt-0.5 leading-snug">
                        {token.lightUse}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#D3E5DC]/60 dark:border-slate-700">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#E4FDE1] text-[#072A35] font-bold inline-block">
                      {token.contrastOnPage}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Derived Tints Section */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-[#D3E5DC] dark:border-slate-700 shadow-sm space-y-4">
            <div>
              <h3 className="text-base font-bold text-[#114B5F] dark:text-[#F7FEF6]">
                Allowed Derived Tints
              </h3>
              <p className="text-xs text-[#3D5C6B] dark:text-[#D8E6EC]">
                Complementing the 5 core tokens with accessible surface neutrals, dividers, and contrast text.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {DERIVED_TINTS.map(dt => (
                <div key={dt.name} className="p-3.5 rounded-xl border border-[#D3E5DC] dark:border-slate-700 space-y-2 bg-[#F7FEF6] dark:bg-slate-900">
                  <div className="w-full h-10 rounded-lg shadow-inner flex items-center justify-center font-mono text-xs font-bold border border-black/10" style={{ backgroundColor: dt.hex, color: dt.textHex }}>
                    {dt.hex}
                  </div>
                  <div className="text-xs font-bold text-[#114B5F] dark:text-[#F7FEF6]">{dt.name}</div>
                  <div className="text-[11px] text-[#3D5C6B] dark:text-slate-400 leading-tight">{dt.role}</div>
                  <div className="text-[10px] font-mono text-[#028090] font-semibold">{dt.cssVar}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Harmonized Status Palette */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-[#D3E5DC] dark:border-slate-700 shadow-sm space-y-4">
            <div>
              <h3 className="text-base font-bold text-[#114B5F] dark:text-[#F7FEF6]">
                Harmonized Status & Urgency System
              </h3>
              <p className="text-xs text-[#3D5C6B] dark:text-[#D8E6EC]">
                Notice: Default browser neon colors are prohibited. Success is Teal (#028090) with a check icon (never Coral). Error is deep red (#B42318) with error icon/text (never Coral). Warning is muted amber (#B7791F). Info is Mint background with Deep Lagoon text.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {STATUS_TOKENS.map(st => (
                <div
                  key={st.name}
                  className="p-4 rounded-xl border space-y-2 shadow-sm"
                  style={{ backgroundColor: st.bgHex, borderColor: st.borderHex, color: st.textHex }}
                >
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="flex items-center gap-1.5">
                      <span>{st.icon}</span> {st.name}
                    </span>
                    <span className="font-mono text-[10px]">{st.textHex}</span>
                  </div>
                  <p className="text-[11px] leading-snug opacity-90">{st.role}</p>
                  <div className="p-2 rounded-lg bg-white/80 dark:bg-black/20 text-xs font-semibold">
                    {st.sample}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: CORAL ACTION TOKEN (STRICT RULES) */}
      {activeTab === 'coral_rules' && (
        <div className="space-y-6">
          {/* Coral Token Banner */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#F45B69] text-[#072A35] shadow-xl space-y-4 border-2 border-[#e04856]">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-[#072A35] text-[#F45B69]">
                Action Color Rulebook
              </span>
              <span className="text-xs font-mono font-black">Token: --color-coral: #F45B69</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
              Coral (#F45B69) is Strictly Reserved for Donation Actions
            </h3>
            <p className="text-sm font-semibold max-w-3xl leading-relaxed">
              To maximize donor urgency and maintain high civic distinction, Coral is an ACTION COLOR exclusively for food donation CTAs. It must never be used as a general decorative accent, tag, link, or non-donation button.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Permitted Uses */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border-2 border-[#028090] shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-[#028090]">
                <span className="text-xl">✓</span>
                <h4 className="text-base font-black text-[#114B5F] dark:text-[#F7FEF6]">
                  Allowed Uses of Coral (Donation CTAs Only)
                </h4>
              </div>
              <ul className="space-y-2.5 text-xs text-[#114B5F] dark:text-[#F7FEF6]">
                <li className="flex items-start gap-2">
                  <span className="text-[#028090] font-bold">✓</span>
                  <span><strong>"Donate" / "Donate Food":</strong> The primary action button in the Hero section.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#028090] font-bold">✓</span>
                  <span><strong>"+ Post Surplus Food":</strong> The main donation creation CTA in the donor dashboard and sticky navigation bar.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#028090] font-bold">✓</span>
                  <span><strong>"Confirm Donation":</strong> The final submission button inside the food donation modal.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#028090] font-bold">✓</span>
                  <span><strong>Sticky Mobile Donate Bar:</strong> The mobile floating quick-action donation bar.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#028090] font-bold">✓</span>
                  <span><strong>Text Color Rule:</strong> Text on Coral buttons MUST always be <code>#072A35</code> (very dark teal), giving a 4.7:1 WCAG AA compliant contrast ratio.</span>
                </li>
              </ul>

              {/* Sample Coral Buttons */}
              <div className="p-4 rounded-xl bg-[#F7FEF6] dark:bg-slate-900 border border-[#D3E5DC] dark:border-slate-700 space-y-3">
                <div className="text-xs font-bold text-[#114B5F] dark:text-[#F7FEF6]">Live Coral Button Samples:</div>
                <div className="flex flex-wrap gap-3">
                  <button className="px-5 py-2.5 rounded-xl bg-[#F45B69] hover:bg-[#e04856] text-[#072A35] font-black text-xs shadow-md transition transform active:scale-95 flex items-center gap-2">
                    <span>🍲</span> Donate Food
                  </button>
                  <button className="px-4 py-2.5 rounded-xl bg-[#F45B69] hover:bg-[#e04856] text-[#072A35] font-black text-xs shadow-md transition transform active:scale-95 flex items-center gap-1.5">
                    <span>+</span> Post Surplus Food
                  </button>
                  <button className="px-5 py-2.5 rounded-xl bg-[#F45B69] hover:bg-[#e04856] text-[#072A35] font-black text-xs shadow-md transition">
                    Confirm Food Donation ➔
                  </button>
                </div>
              </div>
            </div>

            {/* Forbidden Uses */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border-2 border-rose-300 dark:border-rose-900 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-rose-600">
                <span className="text-xl">✕</span>
                <h4 className="text-base font-black text-[#114B5F] dark:text-[#F7FEF6]">
                  Strictly Forbidden Uses of Coral
                </h4>
              </div>
              <ul className="space-y-2.5 text-xs text-[#114B5F] dark:text-[#F7FEF6]">
                <li className="flex items-start gap-2">
                  <span className="text-rose-600 font-bold">✕</span>
                  <span><strong>Non-Donation CTAs:</strong> "Learn more", "Sign in", "Explore locations", "View orders", "Filter", "Download", "Redeem Rewards" (Use Teal or Secondary).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-600 font-bold">✕</span>
                  <span><strong>White Text on Coral:</strong> White on Coral yields only 2.9:1 (FAILS WCAG AA). White text is strictly prohibited on Coral.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-600 font-bold">✕</span>
                  <span><strong>Tags, Badges, or Pills:</strong> Never use Coral for tags or badges. Use Mint (#E4FDE1) or Steel Blue (#456990).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-600 font-bold">✕</span>
                  <span><strong>Headers or Section Backgrounds:</strong> Sections use Mint (#E4FDE1), Deep Lagoon (#114B5F), or Page BG (#F7FEF6).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-600 font-bold">✕</span>
                  <span><strong>Progress Bars or Charts:</strong> Progress bars use Teal (#028090) fill on a Mint (#E4FDE1) track.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-600 font-bold">✕</span>
                  <span><strong>Status Alerts:</strong> Success is Teal (#028090), error is deep red (#B42318), warning is muted amber (#B7791F).</span>
                </li>
              </ul>

              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-xs text-rose-800 dark:text-rose-300 font-medium">
                <strong>Why This Matters:</strong> Reserving Coral exclusively for donation actions creates an instant mental trigger for food rescue, guiding the user's eye directly to life-saving redistribution.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: LIVE COMPONENTS SHOWCASE */}
      {activeTab === 'components' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Buttons Showcase */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-[#D3E5DC] dark:border-slate-700 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-[#114B5F] dark:text-[#F7FEF6] flex items-center gap-2">
                <span>🔘</span> Button Hierarchy & Action Tokens
              </h3>
              <p className="text-xs text-[#3D5C6B] dark:text-[#D8E6EC]">
                Coral for Donation CTAs only. Teal for non-donation primary actions. Transparent with 2px Teal border for secondary actions.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                {/* Coral Donation CTA Button */}
                <button className="px-4 py-2.5 rounded-xl bg-[#F45B69] hover:bg-[#e04856] text-[#072A35] text-xs font-black transition shadow-md active:scale-95 flex items-center gap-1.5">
                  <span>🍲</span> Donate Food (Coral CTA)
                </button>

                {/* Primary Non-Donation Button */}
                <button className="px-4 py-2.5 rounded-xl bg-[#028090] hover:bg-[#114B5F] text-white text-xs font-bold transition shadow-sm">
                  Primary Action (Teal)
                </button>

                {/* Secondary Button */}
                <button className="px-4 py-2.5 rounded-xl bg-transparent border-2 border-[#028090] text-[#028090] hover:bg-[#E4FDE1] text-xs font-bold transition">
                  Secondary Action (Outline)
                </button>

                {/* Disabled Button */}
                <button disabled className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-400 text-xs font-bold cursor-not-allowed">
                  Disabled Button
                </button>
              </div>

              {/* Amount Chips Selection */}
              <div className="pt-3 border-t border-[#D3E5DC] dark:border-slate-700 space-y-2">
                <label className="block text-xs font-bold text-[#114B5F] dark:text-[#F7FEF6]">
                  Selected State (Amount Chips / Quantity / Tab):
                </label>
                <div className="flex flex-wrap gap-2">
                  {['25', '50', '100', '250', '500+'].map(val => (
                    <button
                      key={val}
                      onClick={() => setSelectedChip(val)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                        selectedChip === val
                          ? 'bg-[#028090] text-white shadow-sm'
                          : 'bg-white dark:bg-slate-900 border border-[#D3E5DC] text-[#3D5C6B] hover:bg-[#E4FDE1]'
                      }`}
                    >
                      {val} Plates
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Badges and Progress Bar */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-[#D3E5DC] dark:border-slate-700 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-[#114B5F] dark:text-[#F7FEF6] flex items-center gap-2">
                <span>🏷️</span> Badges, Tags & Progress Bars
              </h3>
              <p className="text-xs text-[#3D5C6B] dark:text-[#D8E6EC]">
                Badges use Steel Blue (#456990) or Mint (#E4FDE1) fills. Progress bars use Teal (#028090) fill on a Mint track.
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#E4FDE1] text-[#114B5F] border border-[#028090]/30">
                  🌿 Tier 1: Human Redistribution
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#456990] text-white">
                  ⚡ 5.2 hrs Safe Shelf-Life
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#D8E6EC] text-[#114B5F] border border-[#114B5F]/20">
                  📦 120 Meals Capacity
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#FEFCE8] text-[#B7791F] border border-[#FDE047]">
                  ⚠️ Safe Window &lt; 1 hr
                </span>
              </div>

              {/* Progress Bar Component */}
              <div className="p-3.5 rounded-xl bg-[#F7FEF6] dark:bg-slate-900 border border-[#D3E5DC] dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-[#114B5F] dark:text-[#F7FEF6]">
                  <span>Progress Bar: Teal Fill on Mint Track</span>
                  <span>78% Rescued</span>
                </div>
                <div className="w-full h-3 rounded-full bg-[#E4FDE1] overflow-hidden p-0.5 border border-[#D3E5DC]">
                  <div className="h-full bg-[#028090] rounded-full transition-all duration-500" style={{ width: '78%' }}></div>
                </div>
              </div>
            </div>

            {/* Cards Showcase */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-[#D3E5DC] dark:border-slate-700 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-[#114B5F] dark:text-[#F7FEF6] flex items-center gap-2">
                <span>🗂️</span> Cards & Secondary Surfaces
              </h3>
              <p className="text-xs text-[#3D5C6B] dark:text-[#D8E6EC]">
                Cards use Page Background (#F7FEF6) with 1px border (#D3E5DC). Highlight cards use Teal with white text. Soft panels use #D8E6EC.
              </p>

              {/* Standard Rescue Card */}
              <div className="p-4 rounded-2xl bg-[#F7FEF6] dark:bg-slate-900 border border-[#D3E5DC] dark:border-slate-700 space-y-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#028090]">Kaveri Hostel Mess #D1</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E4FDE1] text-[#114B5F] border border-[#028090]/40">
                    🟢 Live Fresh Batch
                  </span>
                </div>
                <div className="text-sm font-extrabold text-[#114B5F] dark:text-[#F7FEF6]">
                  Surplus Dal Tadka & Jeera Rice (120 Plates)
                </div>
                <div className="flex items-center justify-between text-xs text-[#3D5C6B] dark:text-[#D8E6EC] pt-2 border-t border-[#D3E5DC] dark:border-slate-800">
                  <span>📍 Campus Sector 2</span>
                  <span className="font-bold text-[#028090]">Safe for 3h 15m</span>
                </div>
              </div>

              {/* Highlight Card */}
              <div className="p-4 rounded-2xl bg-[#028090] text-white shadow-md space-y-2">
                <div className="text-xs font-bold text-[#E4FDE1] uppercase tracking-wider">Highlight Surface (Teal)</div>
                <div className="text-base font-black">100% Landfill Diversion Rate Active</div>
                <p className="text-xs text-white/90">
                  Every gram of food logged is routed to Human Relief (Tier 1), Animal Welfare (Tier 2), or Micro-Composting (Tier 3).
                </p>
              </div>
            </div>

            {/* Status Alerts Showcase */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-[#D3E5DC] dark:border-slate-700 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-[#114B5F] dark:text-[#F7FEF6] flex items-center gap-2">
                <span>🔔</span> Status Banners & Alerts
              </h3>
              <p className="text-xs text-[#3D5C6B] dark:text-[#D8E6EC]">
                Distinct, accessible status banners avoiding neon clashing.
              </p>

              <div className="space-y-3">
                {/* Info Alert */}
                <div className="p-3.5 rounded-xl bg-[#E4FDE1] border border-[#D3E5DC] text-[#114B5F] text-xs flex items-center gap-3">
                  <span className="text-lg">ℹ️</span>
                  <div>
                    <div className="font-bold">Info: Volunteer Route Assigned</div>
                    <div>Rajesh Kumar dispatched with cold-chain EV container (1.2 km away).</div>
                  </div>
                </div>

                {/* Success Alert */}
                <div className="p-3.5 rounded-xl bg-[#E4FDE1] border border-[#028090] text-[#114B5F] text-xs flex items-center gap-3">
                  <span className="text-lg text-[#028090] font-bold">✓</span>
                  <div>
                    <div className="font-bold text-[#028090]">Success: Handover Verified</div>
                    <div>120 hot meals successfully delivered to Akshaya Food Shelter.</div>
                  </div>
                </div>

                {/* Warning Alert */}
                <div className="p-3.5 rounded-xl bg-[#FEFCE8] border border-[#FDE047] text-[#B7791F] text-xs flex items-center gap-3">
                  <span className="text-lg">⚠️</span>
                  <div>
                    <div className="font-bold">Warning: Safe Window Expiring Soon</div>
                    <div>Donation #D2 has 40 minutes remaining before human consumption cutoff.</div>
                  </div>
                </div>

                {/* Error Alert */}
                <div className="p-3.5 rounded-xl bg-[#FDF2F2] border border-[#FECDCA] text-[#B42318] text-xs flex items-center gap-3">
                  <span className="text-lg">🚨</span>
                  <div>
                    <div className="font-bold">Critical: Decay Ladder Drop Triggered</div>
                    <div>Surplus diverted from Human Consumption (Tier 1) to Animal Welfare (Tier 2).</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 4: WCAG AA CONTRAST MATRIX */}
      {activeTab === 'contrast' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-[#D3E5DC] dark:border-slate-700 shadow-sm space-y-6">
          <div>
            <h3 className="text-lg font-bold text-[#114B5F] dark:text-[#F7FEF6]">
              Strict WCAG AA Accessibility Contrast Matrix
            </h3>
            <p className="text-xs text-[#3D5C6B] dark:text-[#D8E6EC] mt-1">
              Every text-to-background combination evaluated for WCAG 2.1 Level AA (minimum 4.5:1 for standard body text, 3:1 for large headers and interactive components).
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-[#D3E5DC] dark:border-slate-700 bg-[#E4FDE1]/40 dark:bg-slate-900/50">
                  <th className="py-3 px-4 font-bold text-[#114B5F] dark:text-[#F7FEF6]">Foreground Text</th>
                  <th className="py-3 px-4 font-bold text-[#114B5F] dark:text-[#F7FEF6]">Background Surface</th>
                  <th className="py-3 px-4 font-bold text-[#114B5F] dark:text-[#F7FEF6]">Contrast Ratio</th>
                  <th className="py-3 px-4 font-bold text-[#114B5F] dark:text-[#F7FEF6]">WCAG Status</th>
                  <th className="py-3 px-4 font-bold text-[#114B5F] dark:text-[#F7FEF6]">Usage Specification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D3E5DC]/60 dark:divide-slate-700">
                <tr className="hover:bg-[#E4FDE1]/30 dark:hover:bg-slate-750">
                  <td className="py-3 px-4 font-bold text-[#114B5F]">Deep Lagoon (#114B5F)</td>
                  <td className="py-3 px-4">Page Background (#F7FEF6)</td>
                  <td className="py-3 px-4 font-mono font-bold text-[#028090]">9.3:1</td>
                  <td className="py-3 px-4"><span className="px-2 py-0.5 rounded bg-[#E4FDE1] text-[#028090] font-bold">PASS (AAA)</span></td>
                  <td className="py-3 px-4 text-[#3D5C6B] dark:text-[#D8E6EC]">Primary body text, section headings, card content.</td>
                </tr>
                <tr className="hover:bg-[#E4FDE1]/30 dark:hover:bg-slate-750">
                  <td className="py-3 px-4 font-bold text-[#028090]">Teal (#028090)</td>
                  <td className="py-3 px-4">Page Background (#F7FEF6)</td>
                  <td className="py-3 px-4 font-mono font-bold text-[#028090]">4.5:1</td>
                  <td className="py-3 px-4"><span className="px-2 py-0.5 rounded bg-[#E4FDE1] text-[#028090] font-bold">PASS (AA)</span></td>
                  <td className="py-3 px-4 text-[#3D5C6B] dark:text-[#D8E6EC]">Interactive links, headings, primary brand accents.</td>
                </tr>
                <tr className="hover:bg-[#E4FDE1]/30 dark:hover:bg-slate-750">
                  <td className="py-3 px-4 font-bold text-[#456990]">Steel Blue (#456990)</td>
                  <td className="py-3 px-4">Page Background (#F7FEF6)</td>
                  <td className="py-3 px-4 font-mono font-bold text-[#028090]">5.6:1</td>
                  <td className="py-3 px-4"><span className="px-2 py-0.5 rounded bg-[#E4FDE1] text-[#028090] font-bold">PASS (AA)</span></td>
                  <td className="py-3 px-4 text-[#3D5C6B] dark:text-[#D8E6EC]">Icons, secondary metrics, informative badges.</td>
                </tr>
                <tr className="hover:bg-[#E4FDE1]/30 dark:hover:bg-slate-750">
                  <td className="py-3 px-4 font-bold text-[#114B5F]">Deep Lagoon (#114B5F)</td>
                  <td className="py-3 px-4">Mint Surface (#E4FDE1)</td>
                  <td className="py-3 px-4 font-mono font-bold text-[#028090]">10.5:1</td>
                  <td className="py-3 px-4"><span className="px-2 py-0.5 rounded bg-[#E4FDE1] text-[#028090] font-bold">PASS (AAA)</span></td>
                  <td className="py-3 px-4 text-[#3D5C6B] dark:text-[#D8E6EC]">Text on tags, selected rows, info banners, section headers.</td>
                </tr>
                <tr className="hover:bg-[#E4FDE1]/30 dark:hover:bg-slate-750">
                  <td className="py-3 px-4 font-bold text-white bg-[#028090] px-2 py-1 rounded inline-block">White (#FFFFFF)</td>
                  <td className="py-3 px-4">Teal Button Fill (#028090)</td>
                  <td className="py-3 px-4 font-mono font-bold text-[#028090]">4.7:1</td>
                  <td className="py-3 px-4"><span className="px-2 py-0.5 rounded bg-[#E4FDE1] text-[#028090] font-bold">PASS (AA)</span></td>
                  <td className="py-3 px-4 text-[#3D5C6B] dark:text-[#D8E6EC]">Primary non-donation button labels.</td>
                </tr>
                <tr className="hover:bg-[#E4FDE1]/30 dark:hover:bg-slate-750 bg-[#E4FDE1]/20">
                  <td className="py-3 px-4 font-bold text-[#072A35] bg-[#F45B69] px-2 py-1 rounded inline-block">Very Dark Teal (#072A35)</td>
                  <td className="py-3 px-4">Coral Button Fill (#F45B69)</td>
                  <td className="py-3 px-4 font-mono font-bold text-[#028090]">4.7:1</td>
                  <td className="py-3 px-4"><span className="px-2 py-0.5 rounded bg-[#E4FDE1] text-[#028090] font-bold">PASS (AA)</span></td>
                  <td className="py-3 px-4 font-bold text-[#072A35]">MANDATORY text on all Coral donation buttons.</td>
                </tr>
                <tr className="bg-rose-50/50 dark:bg-rose-950/20">
                  <td className="py-3 px-4 font-bold text-white bg-[#F45B69] px-2 py-1 rounded inline-block">White (#FFFFFF)</td>
                  <td className="py-3 px-4">Coral Fill (#F45B69)</td>
                  <td className="py-3 px-4 font-mono font-bold text-rose-600">2.9:1</td>
                  <td className="py-3 px-4"><span className="px-2 py-0.5 rounded bg-rose-100 text-rose-700 font-bold">FAIL (&lt; 4.5:1)</span></td>
                  <td className="py-3 px-4 font-semibold text-rose-700">FORBIDDEN. Never use white text on Coral buttons.</td>
                </tr>
                <tr className="bg-rose-50/50 dark:bg-rose-950/20">
                  <td className="py-3 px-4 font-bold text-[#028090]">Teal (#028090)</td>
                  <td className="py-3 px-4">Mint Surface (#E4FDE1)</td>
                  <td className="py-3 px-4 font-mono font-bold text-rose-600">4.3:1</td>
                  <td className="py-3 px-4"><span className="px-2 py-0.5 rounded bg-rose-100 text-rose-700 font-bold">FAIL (&lt; 4.5:1)</span></td>
                  <td className="py-3 px-4 font-semibold text-rose-700">DO NOT use Teal for small body text on Mint; use Deep Lagoon.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 5: IMPLEMENTATION TOKENS SPEC */}
      {activeTab === 'rules' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-[#D3E5DC] dark:border-slate-700 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-[#114B5F] dark:text-[#F7FEF6]">
            Centralized CSS Custom Properties Declaration
          </h3>
          <p className="text-xs text-[#3D5C6B] dark:text-[#D8E6EC]">
            These CSS custom properties are defined in <code>index.html</code> under <code>:root</code> and <code>.dark</code> and wired into Tailwind CSS.
          </p>

          <pre className="p-4 rounded-xl bg-[#114B5F] text-[#F7FEF6] text-[11px] font-mono overflow-x-auto leading-relaxed border border-[#028090]/40">
{`:root {
  /* 5 Core Palette Tokens */
  --color-deep-lagoon: #114B5F;
  --color-teal:        #028090;
  --color-steel-blue:  #456990;
  --color-mint:        #E4FDE1;
  --color-coral:       #F45B69;

  /* Derived Tints */
  --color-page-bg:     #F7FEF6;
  --color-text-muted:  #3D5C6B;
  --color-soft-panel:  #D8E6EC;
  --color-border:      #D3E5DC;
  --color-on-coral:    #072A35;
  --color-coral-hover: #e04856;

  /* Semantic Aliases */
  --bg:             var(--color-page-bg);
  --surface:        #FFFFFF;
  --surface-alt:    var(--color-soft-panel);
  --text:           var(--color-deep-lagoon);
  --text-muted:     var(--color-text-muted);
  --primary:        var(--color-teal);
  --primary-hover:  var(--color-deep-lagoon);
  --on-primary:     #FFFFFF;
  --secondary:      var(--color-mint);
  --secondary-hover:#D3E5DC;
  --on-secondary:   var(--color-deep-lagoon);
  --accent:         var(--color-steel-blue);
  --on-accent:      #FFFFFF;
  --action:         var(--color-coral);
  --action-hover:   var(--color-coral-hover);
  --on-action:      var(--color-on-coral);
  --border:         var(--color-border);
  --focus-ring:     var(--color-teal);
  --shadow-tint:    rgba(17, 75, 95, 0.08);
}`}
          </pre>
        </div>
      )}
    </div>
  );
};

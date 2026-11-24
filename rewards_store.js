// =========================================================================
// SANJEEVNI — GREEN REWARDS STORE & REDEMPTION PORTAL
// Dedicated eCommerce-style Rewards Platform powered by Green Points (GP)
// =========================================================================

window.RewardsStoreView = function RewardsStoreView({ currentSession, onOpenAuth, onNavigateMain }) {
  const [currentView, setCurrentView] = React.useState('home'); // 'home', 'catalog', 'product', 'checkout', 'success', 'orders', 'tracking', 'wallet', 'wishlist', 'admin'
  const [categories, setCategories] = React.useState([]);
  const [products, setProducts] = React.useState([]);
  const [selectedProduct, setSelectedProduct] = React.useState(null);
  const [selectedCategory, setSelectedCategory] = React.useState('all');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [pointsFilter, setPointsFilter] = React.useState(2000);
  const [availabilityFilter, setAvailabilityFilter] = React.useState('all');
  const [sortBy, setSortBy] = React.useState('popular');
  const [loading, setLoading] = React.useState(true);

  // User state
  const userId = currentSession?.id || 'USR-001';
  const userName = currentSession?.name || 'Suresh Patel';
  const userEmail = currentSession?.email || 'donor@kaveri.edu';
  const isAdmin = currentSession?.role === 'Admin' || currentSession?.name?.includes('Admin');

  // Wallet and Orders state
  const [wallet, setWallet] = React.useState({ balance: 0, totalEarned: 0, totalRedeemed: 0, transactions: [] });
  const [orders, setOrders] = React.useState([]);
  const [selectedOrder, setSelectedOrder] = React.useState(null);
  const [wishlist, setWishlist] = React.useState([]);
  const [addresses, setAddresses] = React.useState([]);
  const [lastRedeemedOrder, setLastRedeemedOrder] = React.useState(null);

  // Checkout form state
  const [checkoutQuantity, setCheckoutQuantity] = React.useState(1);
  const [selectedAddressId, setSelectedAddressId] = React.useState('new');
  const [recipientName, setRecipientName] = React.useState(userName);
  const [recipientPhone, setRecipientPhone] = React.useState('+91 98765 00001');
  const [deliveryAddress, setDeliveryAddress] = React.useState('Campus Sector 2, North Block, Hostel Mess Supervisor Office');
  const [deliveryCity, setDeliveryCity] = React.useState('Indore');
  const [deliveryState, setDeliveryState] = React.useState('Madhya Pradesh');
  const [deliveryPincode, setDeliveryPincode] = React.useState('452010');
  const [deliveryInstructions, setDeliveryInstructions] = React.useState('Leave with receptionist or mess supervisor.');
  const [saveAddressForFuture, setSaveAddressForFuture] = React.useState(true);
  const [isSubmittingCheckout, setIsSubmittingCheckout] = React.useState(false);
  const [checkoutError, setCheckoutError] = React.useState(null);

  // Admin state
  const [adminAnalytics, setAdminAnalytics] = React.useState(null);
  const [adminActiveTab, setAdminActiveTab] = React.useState('orders'); // 'orders', 'products', 'inventory'
  const [newProductModal, setNewProductModal] = React.useState(false);
  const [editingProduct, setEditingProduct] = React.useState(null);

  // Load initial store data
  const loadStoreData = async () => {
    setLoading(true);
    try {
      const [cats, prods, w, myOrders, wish, addrs] = await Promise.all([
        window.SanjeevniAPI.rewards.getCategories(),
        window.SanjeevniAPI.rewards.getProducts(),
        window.SanjeevniAPI.rewards.getWallet(userId),
        window.SanjeevniAPI.rewards.getOrders({ user_id: userId }),
        window.SanjeevniAPI.rewards.getWishlist(userId),
        window.SanjeevniAPI.rewards.getAddresses(userId)
      ]);
      setCategories(cats || []);
      setProducts(prods || []);
      setWallet(w || { balance: 0, totalEarned: 0, totalRedeemed: 0, transactions: [] });
      setOrders(myOrders || []);
      setWishlist(wish || []);
      setAddresses(addrs || []);
      if (addrs && addrs.length > 0) {
        setSelectedAddressId(addrs[0].id);
        setRecipientName(addrs[0].recipient_name);
        setRecipientPhone(addrs[0].phone);
        setDeliveryAddress(addrs[0].address);
        setDeliveryCity(addrs[0].city);
        setDeliveryState(addrs[0].state);
        setDeliveryPincode(addrs[0].pincode);
      }
    } catch (err) {
      console.warn("Failed to load rewards store data:", err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadStoreData();
  }, [userId]);

  // Wishlist toggle helper
  const handleToggleWishlist = async (prod, e) => {
    if (e) e.stopPropagation();
    try {
      const res = await window.SanjeevniAPI.rewards.toggleWishlist(userId, prod.id);
      if (res.isSaved) {
        setWishlist(prev => [prod, ...prev]);
        if (window.audio) window.audio.playChime('click');
      } else {
        setWishlist(prev => prev.filter(p => p.id !== prod.id));
        if (window.audio) window.audio.playChime('click');
      }
    } catch (err) {
      console.warn("Wishlist toggle error", err);
    }
  };

  const isProductSaved = (productId) => {
    return wishlist.some(p => p.id === productId);
  };

  // Start Checkout
  const handleStartCheckout = (prod, e) => {
    if (e) e.stopPropagation();
    if (prod.fulfilment_type === 'physical' && prod.stock_quantity <= 0) {
      alert("This reward is currently out of stock.");
      return;
    }
    if (wallet.balance < prod.points_cost) {
      alert(`You need ${prod.points_cost - wallet.balance} more Green Points to redeem this item.`);
      return;
    }
    setSelectedProduct(prod);
    setCheckoutQuantity(1);
    setCheckoutError(null);
    setCurrentView('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (window.audio) window.audio.playChime('click');
  };

  // Submit Checkout
  const handleConfirmRedemption = async () => {
    if (!selectedProduct) return;
    setIsSubmittingCheckout(true);
    setCheckoutError(null);

    const payload = {
      userId,
      userName,
      userEmail,
      productId: selectedProduct.id,
      quantity: checkoutQuantity,
      fulfilmentType: selectedProduct.fulfilment_type,
      deliveryDetails: {
        recipientName,
        phone: recipientPhone,
        address: deliveryAddress,
        city: deliveryCity,
        state: deliveryState,
        pincode: deliveryPincode,
        instructions: deliveryInstructions,
        saveAddress: saveAddressForFuture
      }
    };

    try {
      const res = await window.SanjeevniAPI.rewards.checkout(payload);
      if (window.confetti) {
        window.confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      }
      if (window.audio) window.audio.playChime('success');
      setLastRedeemedOrder({
        ...res,
        product: selectedProduct,
        quantity: checkoutQuantity,
        delivery: payload.deliveryDetails
      });
      // Refresh wallet and orders
      loadStoreData();
      setCurrentView('success');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setCheckoutError(err.message || 'Redemption failed. Please try again.');
      if (window.audio) window.audio.playChime('warning');
    } finally {
      setIsSubmittingCheckout(false);
    }
  };

  // View Order Tracking
  const handleOpenTracking = async (orderId) => {
    try {
      const ord = await window.SanjeevniAPI.rewards.getOrder(orderId);
      setSelectedOrder(ord);
      setCurrentView('tracking');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (window.audio) window.audio.playChime('click');
    } catch (err) {
      alert("Failed to load tracking details: " + err.message);
    }
  };

  // Cancel Order
  const handleCancelOrder = async (orderId) => {
    const reason = prompt("Please provide a reason for cancelling this redemption:");
    if (!reason) return;
    try {
      const res = await window.SanjeevniAPI.rewards.cancelOrder(orderId, { userId, reason });
      alert(res.message);
      loadStoreData();
      if (selectedOrder && selectedOrder.id === orderId) {
        handleOpenTracking(orderId);
      }
    } catch (err) {
      alert("Cancellation failed: " + err.message);
    }
  };

  // Filtered Products for Catalog & Sections
  const filteredProducts = React.useMemo(() => {
    return products.filter(p => {
      if (selectedCategory !== 'all' && p.category_id !== selectedCategory) return false;
      if (p.points_cost > pointsFilter) return false;
      if (availabilityFilter !== 'all' && p.availability_status !== availabilityFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesTag = (p.tagline || '').toLowerCase().includes(q);
        const matchesDesc = (p.description || '').toLowerCase().includes(q);
        if (!matchesName && !matchesTag && !matchesDesc) return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'points_asc') return a.points_cost - b.points_cost;
      if (sortBy === 'points_desc') return b.points_cost - a.points_cost;
      if (sortBy === 'newest') return b.id.localeCompare(a.id);
      return (b.is_featured * 2 + b.is_popular) - (a.is_featured * 2 + a.is_popular);
    });
  }, [products, selectedCategory, pointsFilter, availabilityFilter, searchQuery, sortBy]);

  // Sub-sections for Homepage
  const popularRewards = React.useMemo(() => products.filter(p => p.is_popular || p.is_featured).slice(0, 4), [products]);
  const affordableRewards = React.useMemo(() => products.filter(p => p.points_cost <= wallet.balance).slice(0, 4), [products, wallet.balance]);
  const gardeningRewards = React.useMemo(() => products.filter(p => p.category_id === 'gardening').slice(0, 4), [products]);
  const ecoDailyRewards = React.useMemo(() => products.filter(p => p.category_id === 'eco_daily').slice(0, 4), [products]);
  const merchandiseRewards = React.useMemo(() => products.filter(p => p.category_id === 'merchandise').slice(0, 4), [products]);
  const digitalRewards = React.useMemo(() => products.filter(p => p.category_id === 'digital').slice(0, 4), [products]);

  return (
    <div className="space-y-6 pb-16 animate-fadeIn">
      {/* =========================================================================
          FLIPKART-STYLE STICKY TOP STORE NAVIGATION HEADER
         ========================================================================= */}
      <div className="bg-midnight-pine text-cloud-white rounded-3xl p-4 sm:p-5 shadow-xl border border-deep-emerald/40 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Brand & Store Name */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setCurrentView('home'); setSelectedCategory('all'); }}
              className="flex items-center gap-2.5 text-left group"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-impact-green to-deep-emerald flex items-center justify-center text-midnight-pine font-black text-xl shadow-md group-hover:scale-105 transition">
                🌱
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black tracking-tight text-cloud-white group-hover:text-impact-green transition">
                    SANJEEVNI
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-impact-green text-midnight-pine tracking-wider uppercase">
                    Rewards Store
                  </span>
                </div>
                <p className="text-[11px] text-soft-mint/80 font-medium">
                  Your Contributions. Your Rewards. A Greener Future.
                </p>
              </div>
            </button>
          </div>

          {/* Search Rewards Input */}
          <div className="flex-1 max-w-md w-full min-w-[240px]">
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-midnight-pine/60">🔍</span>
              <input
                type="text"
                placeholder="Search eco products, saplings, merchandise, certificates..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (currentView !== 'catalog' && e.target.value.trim().length > 0) {
                    setCurrentView('catalog');
                  }
                }}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-cloud-white text-midnight-pine text-xs font-medium placeholder:text-midnight-pine/50 focus:outline-none focus:ring-2 focus:ring-impact-green shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-midnight-pine/60 hover:text-midnight-pine font-bold"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* User Points Wallet Chip & Quick Actions */}
          <div className="flex items-center gap-2.5">
            {/* Green Wallet Pill */}
            <button
              onClick={() => { setCurrentView('wallet'); if (window.audio) window.audio.playChime('click'); }}
              className="px-3.5 py-1.5 rounded-xl bg-deep-emerald hover:bg-impact-green text-cloud-white hover:text-midnight-pine text-xs font-bold transition flex items-center gap-2 border border-impact-green/50 shadow-sm"
              title="Click to view full Green Wallet & Points Ledger"
            >
              <span className="text-sm">🪙</span>
              <div className="text-left leading-tight">
                <span className="text-[10px] opacity-80 block font-normal">Green Points</span>
                <span className="font-extrabold text-sm">{wallet.balance.toLocaleString()} GP</span>
              </div>
            </button>

            {/* My Redemptions / Orders Shortcut */}
            <button
              onClick={() => { setCurrentView('orders'); if (window.audio) window.audio.playChime('click'); }}
              className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-cloud-white text-xs font-bold transition flex items-center gap-1.5 border border-white/10"
              title="My Redemptions & Order History"
            >
              <span>📦</span>
              <span className="hidden sm:inline">My Orders</span>
              {orders.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-impact-green text-midnight-pine text-[10px] font-black">
                  {orders.length}
                </span>
              )}
            </button>

            {/* Wishlist Shortcut */}
            <button
              onClick={() => { setCurrentView('wishlist'); if (window.audio) window.audio.playChime('click'); }}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-cloud-white text-xs font-bold transition flex items-center gap-1 border border-white/10 relative"
              title="Saved Wishlist Rewards"
            >
              <span>❤️</span>
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Admin Store Manager Link */}
            <button
              onClick={() => { setCurrentView('admin'); if (window.audio) window.audio.playChime('click'); }}
              className={`px-2.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1 border ${
                isAdmin 
                  ? 'bg-amber-500/20 text-amber-300 border-amber-400/40 hover:bg-amber-500/30'
                  : 'bg-white/10 text-soft-mint border-white/10 hover:bg-white/20'
              }`}
              title="Admin Rewards & Fulfillment Manager"
            >
              <span>🛡️</span>
              <span className="hidden md:inline">{isAdmin ? 'Admin Console' : 'Store Admin'}</span>
            </button>
          </div>
        </div>

        {/* Category Navigation Bar (Flipkart-style pills) */}
        <div className="flex items-center gap-2 pt-1 border-t border-deep-emerald/50 overflow-x-auto text-xs font-bold text-soft-mint pb-1">
          <button
            onClick={() => { setCurrentView('home'); setSelectedCategory('all'); }}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition flex items-center gap-1 ${
              currentView === 'home' ? 'bg-impact-green text-midnight-pine font-black' : 'hover:bg-white/10'
            }`}
          >
            🏠 Store Home
          </button>

          <button
            onClick={() => { setCurrentView('catalog'); setSelectedCategory('all'); }}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition flex items-center gap-1 ${
              currentView === 'catalog' && selectedCategory === 'all' ? 'bg-impact-green text-midnight-pine font-black' : 'hover:bg-white/10'
            }`}
          >
            🛍️ All Rewards ({products.length})
          </button>

          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                setCurrentView('catalog');
                if (window.audio) window.audio.playChime('click');
              }}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition flex items-center gap-1.5 ${
                currentView === 'catalog' && selectedCategory === cat.id ? 'bg-impact-green text-midnight-pine font-black' : 'hover:bg-white/10'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* =========================================================================
          VIEW 1: STORE HOMEPAGE
         ========================================================================= */}
      {currentView === 'home' && (
        <div className="space-y-8 animate-fadeIn">
          {/* Hero Banner */}
          <div className="p-6 sm:p-10 rounded-3xl bg-gradient-to-br from-midnight-pine via-[#1b3d36] to-deep-emerald text-cloud-white shadow-xl relative overflow-hidden border border-deep-emerald/40">
            <div className="absolute -right-12 -bottom-12 w-96 h-96 bg-impact-green/15 rounded-full blur-3xl pointer-events-none"></div>
            <div className="relative z-10 max-w-2xl space-y-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-soft-mint text-midnight-pine text-xs font-bold uppercase tracking-wider">
                🌟 Green Points Redemption Portal
              </span>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight text-cloud-white">
                Your Good Deeds Deserve Something Good.
              </h1>
              <p className="text-sm sm:text-base text-soft-mint/90 leading-relaxed font-normal">
                Turn your verified food rescue contributions into useful, sustainable rewards. Earn Green Points with every plate diverted from landfill, and redeem products that champion an eco-friendly lifestyle.
              </p>
              
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => { setCurrentView('catalog'); setSelectedCategory('all'); }}
                  className="px-6 py-3 rounded-xl bg-impact-green hover:bg-[#528d6e] text-midnight-pine font-extrabold text-xs sm:text-sm shadow-lg transition flex items-center gap-2 transform active:scale-95"
                >
                  <span>Explore 20+ Rewards</span>
                  <span>➔</span>
                </button>
                <button
                  onClick={() => setCurrentView('wallet')}
                  className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-cloud-white font-bold text-xs sm:text-sm border border-white/20 transition flex items-center gap-2"
                >
                  <span>🪙 My Green Wallet ({wallet.balance} GP)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Wallet & Impact Summary Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-warm-sand dark:border-slate-700 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-soft-mint text-deep-emerald flex items-center justify-center text-xl flex-shrink-0">
                🪙
              </div>
              <div className="min-w-0">
                <div className="text-[11px] text-midnight-pine/60 dark:text-soft-mint/60 font-bold uppercase truncate">Available Balance</div>
                <div className="text-lg font-black text-deep-emerald dark:text-impact-green">{wallet.balance.toLocaleString()} GP</div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-warm-sand dark:border-slate-700 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-soft-mint text-deep-emerald flex items-center justify-center text-xl flex-shrink-0">
                🌱
              </div>
              <div className="min-w-0">
                <div className="text-[11px] text-midnight-pine/60 dark:text-soft-mint/60 font-bold uppercase truncate">Lifetime Earned</div>
                <div className="text-lg font-black text-midnight-pine dark:text-cloud-white">{wallet.totalEarned.toLocaleString()} GP</div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-warm-sand dark:border-slate-700 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-soft-mint text-deep-emerald flex items-center justify-center text-xl flex-shrink-0">
                🎁
              </div>
              <div className="min-w-0">
                <div className="text-[11px] text-midnight-pine/60 dark:text-soft-mint/60 font-bold uppercase truncate">Total Redeemed</div>
                <div className="text-lg font-black text-midnight-pine dark:text-cloud-white">{wallet.totalRedeemed.toLocaleString()} GP</div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-warm-sand dark:border-slate-700 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-soft-mint text-deep-emerald flex items-center justify-center text-xl flex-shrink-0">
                📦
              </div>
              <div className="min-w-0">
                <div className="text-[11px] text-midnight-pine/60 dark:text-soft-mint/60 font-bold uppercase truncate">Completed Orders</div>
                <div className="text-lg font-black text-midnight-pine dark:text-cloud-white">{orders.length}</div>
              </div>
            </div>
          </div>

          {/* Section: Rewards Within Your Points Balance (Smart Filter) */}
          {affordableRewards.length > 0 && (
            <div className="p-6 rounded-3xl bg-soft-mint/30 border border-impact-green/40 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-impact-green text-midnight-pine uppercase">
                    ⚡ Ready to Redeem
                  </div>
                  <h2 className="text-xl font-extrabold text-midnight-pine dark:text-cloud-white mt-1">
                    Rewards Within Your Points ({wallet.balance} GP)
                  </h2>
                </div>
                <button
                  onClick={() => {
                    setPointsFilter(wallet.balance);
                    setCurrentView('catalog');
                  }}
                  className="text-xs font-bold text-deep-emerald hover:underline"
                >
                  View All Affordable ➔
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {affordableRewards.map(prod => (
                  <ProductCard
                    key={prod.id}
                    product={prod}
                    userPoints={wallet.balance}
                    isSaved={isProductSaved(prod.id)}
                    onToggleWishlist={(e) => handleToggleWishlist(prod, e)}
                    onViewDetails={() => { setSelectedProduct(prod); setCurrentView('product'); }}
                    onRedeemNow={(e) => handleStartCheckout(prod, e)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Section: Popular Rewards */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-extrabold text-midnight-pine dark:text-cloud-white">
                  🔥 Most Popular Rewards
                </h2>
                <p className="text-xs text-midnight-pine/70 dark:text-soft-mint/70">
                  Top community favorites redeemed by food donors and volunteers.
                </p>
              </div>
              <button
                onClick={() => { setCurrentView('catalog'); setSortBy('popular'); }}
                className="text-xs font-bold text-deep-emerald hover:underline"
              >
                See All ➔
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {popularRewards.map(prod => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  userPoints={wallet.balance}
                  isSaved={isProductSaved(prod.id)}
                  onToggleWishlist={(e) => handleToggleWishlist(prod, e)}
                  onViewDetails={() => { setSelectedProduct(prod); setCurrentView('product'); }}
                  onRedeemNow={(e) => handleStartCheckout(prod, e)}
                />
              ))}
            </div>
          </div>

          {/* Section: Gardening & Plantation */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-extrabold text-midnight-pine dark:text-cloud-white flex items-center gap-2">
                  <span>🌱</span> Gardening & Plantation
                </h2>
                <p className="text-xs text-midnight-pine/70 dark:text-soft-mint/70">
                  Seed kits, terracotta pots, organic cocopeat, and Bokashi composting bins.
                </p>
              </div>
              <button
                onClick={() => { setSelectedCategory('gardening'); setCurrentView('catalog'); }}
                className="text-xs font-bold text-deep-emerald hover:underline"
              >
                View Category ➔
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {gardeningRewards.map(prod => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  userPoints={wallet.balance}
                  isSaved={isProductSaved(prod.id)}
                  onToggleWishlist={(e) => handleToggleWishlist(prod, e)}
                  onViewDetails={() => { setSelectedProduct(prod); setCurrentView('product'); }}
                  onRedeemNow={(e) => handleStartCheckout(prod, e)}
                />
              ))}
            </div>
          </div>

          {/* Section: Sustainable Daily Use */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-extrabold text-midnight-pine dark:text-cloud-white flex items-center gap-2">
                  <span>🌿</span> Eco-Friendly Daily Use
                </h2>
                <p className="text-xs text-midnight-pine/70 dark:text-soft-mint/70">
                  Stainless steel bottles, reusable tiffin dabbas, bamboo cutlery, and cotton totes.
                </p>
              </div>
              <button
                onClick={() => { setSelectedCategory('eco_daily'); setCurrentView('catalog'); }}
                className="text-xs font-bold text-deep-emerald hover:underline"
              >
                View Category ➔
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {ecoDailyRewards.map(prod => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  userPoints={wallet.balance}
                  isSaved={isProductSaved(prod.id)}
                  onToggleWishlist={(e) => handleToggleWishlist(prod, e)}
                  onViewDetails={() => { setSelectedProduct(prod); setCurrentView('product'); }}
                  onRedeemNow={(e) => handleStartCheckout(prod, e)}
                />
              ))}
            </div>
          </div>

          {/* Section: SANJEEVNI Merchandise & Digital Rewards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Merch */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-warm-sand dark:border-slate-700 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-midnight-pine dark:text-cloud-white flex items-center gap-2">
                    <span>👕</span> SANJEEVNI Merchandise
                  </h3>
                  <p className="text-xs text-midnight-pine/70 dark:text-soft-mint/70">
                    Official organic cotton t-shirts, engraved flasks & enamel pins.
                  </p>
                </div>
                <button
                  onClick={() => { setSelectedCategory('merchandise'); setCurrentView('catalog'); }}
                  className="text-xs font-bold text-deep-emerald hover:underline"
                >
                  View All ➔
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {merchandiseRewards.slice(0, 2).map(prod => (
                  <ProductCard
                    key={prod.id}
                    product={prod}
                    userPoints={wallet.balance}
                    isSaved={isProductSaved(prod.id)}
                    onToggleWishlist={(e) => handleToggleWishlist(prod, e)}
                    onViewDetails={() => { setSelectedProduct(prod); setCurrentView('product'); }}
                    onRedeemNow={(e) => handleStartCheckout(prod, e)}
                  />
                ))}
              </div>
            </div>

            {/* Digital Rewards */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-warm-sand dark:border-slate-700 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-midnight-pine dark:text-cloud-white flex items-center gap-2">
                    <span>🎖️</span> Instant Digital Rewards
                  </h3>
                  <p className="text-xs text-midnight-pine/70 dark:text-soft-mint/70">
                    Cryptographic certificates, impact reports, profile skins & badges.
                  </p>
                </div>
                <button
                  onClick={() => { setSelectedCategory('digital'); setCurrentView('catalog'); }}
                  className="text-xs font-bold text-deep-emerald hover:underline"
                >
                  View All ➔
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {digitalRewards.slice(0, 2).map(prod => (
                  <ProductCard
                    key={prod.id}
                    product={prod}
                    userPoints={wallet.balance}
                    isSaved={isProductSaved(prod.id)}
                    onToggleWishlist={(e) => handleToggleWishlist(prod, e)}
                    onViewDetails={() => { setSelectedProduct(prod); setCurrentView('product'); }}
                    onRedeemNow={(e) => handleStartCheckout(prod, e)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 2: FLIPKART-STYLE PRODUCT CATALOG & SEARCH
         ========================================================================= */}
      {currentView === 'catalog' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Breadcrumb & Results Count */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-midnight-pine/70 dark:text-soft-mint/70 font-medium">
              <button onClick={() => setCurrentView('home')} className="hover:text-deep-emerald">Store Home</button>
              <span>/</span>
              <span className="font-bold text-midnight-pine dark:text-cloud-white">
                {selectedCategory === 'all' ? 'All Rewards' : (categories.find(c => c.id === selectedCategory)?.name || selectedCategory)}
              </span>
              {searchQuery && (
                <span>(Searching for "{searchQuery}")</span>
              )}
            </div>
            <div className="text-midnight-pine/70 dark:text-soft-mint/70 font-semibold">
              Showing <strong>{filteredProducts.length}</strong> rewards
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
            {/* Sidebar Filters (Desktop) */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-warm-sand dark:border-slate-700 shadow-sm space-y-5 lg:sticky lg:top-24">
              <div className="flex items-center justify-between pb-3 border-b border-warm-sand dark:border-slate-700">
                <span className="text-xs font-black uppercase tracking-wider text-midnight-pine dark:text-cloud-white flex items-center gap-1.5">
                  <span>⚙️</span> Filters
                </span>
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setPointsFilter(2000);
                    setAvailabilityFilter('all');
                    setSearchQuery('');
                    setSortBy('popular');
                  }}
                  className="text-[11px] font-bold text-deep-emerald hover:underline"
                >
                  Reset All
                </button>
              </div>

              {/* Category Filter */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-midnight-pine dark:text-cloud-white block">Category</label>
                <div className="space-y-1">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition flex items-center justify-between ${
                      selectedCategory === 'all' ? 'bg-soft-mint text-deep-emerald font-bold' : 'hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span>All Categories</span>
                    <span>{products.length}</span>
                  </button>
                  {categories.map(c => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCategory(c.id)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition flex items-center justify-between ${
                        selectedCategory === c.id ? 'bg-soft-mint text-deep-emerald font-bold' : 'hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      <span>{c.icon} {c.name}</span>
                      <span>{products.filter(p => p.category_id === c.id).length}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Points Range Slider */}
              <div className="space-y-2 pt-2 border-t border-warm-sand/60 dark:border-slate-700">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-midnight-pine dark:text-cloud-white">Max Points Price:</span>
                  <span className="font-mono font-black text-deep-emerald">{pointsFilter} GP</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="2000"
                  step="50"
                  value={pointsFilter}
                  onChange={(e) => setPointsFilter(parseInt(e.target.value, 10))}
                  className="w-full accent-deep-emerald cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-midnight-pine/60 dark:text-soft-mint/60">
                  <span>100 GP</span>
                  <button 
                    onClick={() => setPointsFilter(wallet.balance)}
                    className="font-bold text-deep-emerald hover:underline"
                  >
                    Affordable ({wallet.balance} GP)
                  </button>
                  <span>2,000 GP</span>
                </div>
              </div>

              {/* Availability Filter */}
              <div className="space-y-2 pt-2 border-t border-warm-sand/60 dark:border-slate-700">
                <label className="text-xs font-bold text-midnight-pine dark:text-cloud-white block">Availability</label>
                <select
                  value={availabilityFilter}
                  onChange={(e) => setAvailabilityFilter(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-warm-sand bg-cloud-white dark:bg-slate-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-impact-green"
                >
                  <option value="all">All Items</option>
                  <option value="Available">In Stock Only</option>
                  <option value="Low Stock">Low Stock Items</option>
                  <option value="Out of Stock">Out of Stock</option>
                </select>
              </div>

              {/* Sort By Filter */}
              <div className="space-y-2 pt-2 border-t border-warm-sand/60 dark:border-slate-700">
                <label className="text-xs font-bold text-midnight-pine dark:text-cloud-white block">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-warm-sand bg-cloud-white dark:bg-slate-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-impact-green"
                >
                  <option value="popular">Popularity & Featured</option>
                  <option value="points_asc">Lowest Green Points First</option>
                  <option value="points_desc">Highest Green Points First</option>
                  <option value="newest">Newest Additions</option>
                </select>
              </div>
            </div>

            {/* Products Grid */}
            <div className="lg:col-span-3 space-y-4">
              {filteredProducts.length === 0 ? (
                <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-800 border border-warm-sand dark:border-slate-700 space-y-3">
                  <div className="text-4xl">🔍</div>
                  <h3 className="text-base font-bold text-midnight-pine dark:text-cloud-white">No rewards match your criteria</h3>
                  <p className="text-xs text-midnight-pine/70 dark:text-soft-mint/70 max-w-sm mx-auto">
                    Try relaxing your Green Points price filter or clearing the search keywords.
                  </p>
                  <button
                    onClick={() => {
                      setSelectedCategory('all');
                      setPointsFilter(2000);
                      setAvailabilityFilter('all');
                      setSearchQuery('');
                    }}
                    className="px-4 py-2 rounded-xl bg-deep-emerald text-cloud-white text-xs font-bold transition shadow-sm"
                  >
                    Reset Search & Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredProducts.map(prod => (
                    <ProductCard
                      key={prod.id}
                      product={prod}
                      userPoints={wallet.balance}
                      isSaved={isProductSaved(prod.id)}
                      onToggleWishlist={(e) => handleToggleWishlist(prod, e)}
                      onViewDetails={() => { setSelectedProduct(prod); setCurrentView('product'); }}
                      onRedeemNow={(e) => handleStartCheckout(prod, e)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 3: DEDICATED PRODUCT DETAILS PAGE
         ========================================================================= */}
      {currentView === 'product' && selectedProduct && (
        <div className="space-y-6 animate-fadeIn">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs text-midnight-pine/70 dark:text-soft-mint/70">
            <button onClick={() => setCurrentView('home')} className="hover:text-deep-emerald">Store Home</button>
            <span>/</span>
            <button onClick={() => { setSelectedCategory(selectedProduct.category_id); setCurrentView('catalog'); }} className="hover:text-deep-emerald">
              {categories.find(c => c.id === selectedProduct.category_id)?.name || 'Category'}
            </button>
            <span>/</span>
            <span className="font-bold text-midnight-pine dark:text-cloud-white truncate">{selectedProduct.name}</span>
          </div>

          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-800 border border-warm-sand dark:border-slate-700 shadow-sm grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Left: Product Image Gallery */}
            <div className="space-y-4">
              <div className="aspect-square rounded-2xl overflow-hidden bg-cloud-white dark:bg-slate-900 border border-warm-sand dark:border-slate-700 relative">
                <img
                  src={selectedProduct.image_url}
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover transition duration-300 hover:scale-105"
                />
                {selectedProduct.is_demo_inventory && (
                  <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-midnight-pine/80 text-cloud-white backdrop-blur-sm">
                    📦 Demo Inventory
                  </span>
                )}
                <button
                  onClick={(e) => handleToggleWishlist(selectedProduct, e)}
                  className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 dark:bg-slate-800/90 shadow-md flex items-center justify-center text-base hover:scale-110 transition"
                  title="Toggle Wishlist"
                >
                  {isProductSaved(selectedProduct.id) ? '❤️' : '🤍'}
                </button>
              </div>

              {/* Gallery Thumbnails if available */}
              {selectedProduct.galleryImages && selectedProduct.galleryImages.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {selectedProduct.galleryImages.map((img, idx) => (
                    <button
                      key={idx}
                      className="w-16 h-16 rounded-xl overflow-hidden border-2 border-deep-emerald flex-shrink-0"
                    >
                      <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Product Details, Affordability & Actions */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-soft-mint text-deep-emerald">
                    {categories.find(c => c.id === selectedProduct.category_id)?.name || 'Eco Item'}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                    selectedProduct.availability_status === 'Available' ? 'bg-emerald-100 text-deep-emerald' :
                    selectedProduct.availability_status === 'Low Stock' ? 'bg-amber-100 text-amber-800' :
                    'bg-rose-100 text-rose-800'
                  }`}>
                    {selectedProduct.availability_status}
                  </span>
                  <span className="text-[11px] font-medium text-midnight-pine/60 dark:text-soft-mint/60">
                    ID: {selectedProduct.id}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-midnight-pine dark:text-cloud-white leading-tight">
                  {selectedProduct.name}
                </h1>
                <p className="text-xs text-midnight-pine/80 dark:text-soft-mint/80 mt-1 font-medium">
                  {selectedProduct.tagline}
                </p>
              </div>

              {/* Points Price Box & Affordability Check */}
              <div className="p-4 rounded-2xl bg-cloud-white dark:bg-slate-900 border border-warm-sand dark:border-slate-700 space-y-3">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-xs text-midnight-pine/60 dark:text-soft-mint/60 font-medium">Redemption Price:</span>
                    <div className="text-3xl font-black text-deep-emerald dark:text-impact-green flex items-center gap-1.5">
                      <span>🪙</span>
                      <span>{selectedProduct.points_cost.toLocaleString()} GP</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-midnight-pine/60 dark:text-soft-mint/60 font-medium">Your Green Wallet:</span>
                    <div className="text-sm font-extrabold text-midnight-pine dark:text-cloud-white">
                      {wallet.balance.toLocaleString()} GP
                    </div>
                  </div>
                </div>

                {/* Affordability Progress Bar */}
                {wallet.balance >= selectedProduct.points_cost ? (
                  <div className="p-2.5 rounded-xl bg-soft-mint text-deep-emerald text-xs font-bold flex items-center gap-2">
                    <span>✓</span>
                    <span>You have enough Green Points to redeem this reward!</span>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold text-amber-800 dark:text-amber-300">
                      <span>Points Needed:</span>
                      <span>You need {(selectedProduct.points_cost - wallet.balance).toLocaleString()} more GP</span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div
                        className="h-full bg-impact-green rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, Math.round((wallet.balance / selectedProduct.points_cost) * 100))}%` }}
                      ></div>
                    </div>
                    <p className="text-[10px] text-midnight-pine/60 dark:text-soft-mint/60 pt-0.5">
                      💡 Earn more GP by listing surplus food donations or logging volunteer food-rescue hours!
                    </p>
                  </div>
                )}
              </div>

              {/* Fulfilment & Delivery Specs */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-warm-sand dark:border-slate-700">
                  <div className="text-[10px] text-midnight-pine/60 dark:text-soft-mint/60 font-bold uppercase">Fulfilment Method</div>
                  <div className="font-bold text-midnight-pine dark:text-cloud-white mt-0.5">
                    {selectedProduct.fulfilment_type === 'digital' ? '⚡ Instant Digital Delivery' :
                     selectedProduct.fulfilment_type === 'pickup' ? '📍 Store / Center Pickup' :
                     '🚚 Doorstep Courier Delivery'}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-warm-sand dark:border-slate-700">
                  <div className="text-[10px] text-midnight-pine/60 dark:text-soft-mint/60 font-bold uppercase">Inventory Stock</div>
                  <div className="font-bold text-midnight-pine dark:text-cloud-white mt-0.5">
                    {selectedProduct.stock_quantity > 0 ? `${selectedProduct.stock_quantity} units available` : 'Out of Stock'}
                  </div>
                </div>
              </div>

              {/* Key Features */}
              {selectedProduct.features && selectedProduct.features.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-midnight-pine/60 dark:text-soft-mint/60">
                    Product Highlights & Ecological Value
                  </h4>
                  <ul className="space-y-1.5 text-xs text-midnight-pine/90 dark:text-cloud-white/90">
                    {selectedProduct.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-deep-emerald font-bold">✓</span>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Description */}
              <div className="space-y-1.5 text-xs text-midnight-pine/80 dark:text-cloud-white/80 leading-relaxed border-t border-warm-sand/60 dark:border-slate-700 pt-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-midnight-pine/60 dark:text-soft-mint/60">
                  Full Description
                </h4>
                <p>{selectedProduct.description}</p>
              </div>

              {/* Specifications Table */}
              {selectedProduct.specifications && Object.keys(selectedProduct.specifications).length > 0 && (
                <div className="space-y-2 border-t border-warm-sand/60 dark:border-slate-700 pt-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-midnight-pine/60 dark:text-soft-mint/60">
                    Specifications
                  </h4>
                  <div className="border border-warm-sand dark:border-slate-700 rounded-xl overflow-hidden text-xs">
                    {Object.entries(selectedProduct.specifications).map(([key, val], idx) => (
                      <div key={key} className={`flex items-center justify-between p-2.5 ${idx % 2 === 0 ? 'bg-cloud-white dark:bg-slate-900/50' : 'bg-white dark:bg-slate-800'}`}>
                        <span className="font-medium text-midnight-pine/70 dark:text-soft-mint/70">{key}</span>
                        <span className="font-bold text-midnight-pine dark:text-cloud-white">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={(e) => handleStartCheckout(selectedProduct, e)}
                  disabled={wallet.balance < selectedProduct.points_cost || (selectedProduct.fulfilment_type === 'physical' && selectedProduct.stock_quantity <= 0)}
                  className={`flex-1 py-3 px-6 rounded-xl font-extrabold text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 ${
                    wallet.balance >= selectedProduct.points_cost && (selectedProduct.fulfilment_type !== 'physical' || selectedProduct.stock_quantity > 0)
                      ? 'bg-deep-emerald hover:bg-midnight-pine text-cloud-white cursor-pointer active:scale-95'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <span>🎁</span>
                  <span>Redeem Now ({selectedProduct.points_cost} GP)</span>
                </button>

                <button
                  onClick={(e) => handleToggleWishlist(selectedProduct, e)}
                  className="px-4 py-3 rounded-xl border border-warm-sand dark:border-slate-700 text-midnight-pine dark:text-cloud-white font-bold text-xs hover:bg-soft-mint dark:hover:bg-slate-700 transition flex items-center gap-1.5"
                >
                  <span>{isProductSaved(selectedProduct.id) ? '❤️' : '🤍'}</span>
                  <span>{isProductSaved(selectedProduct.id) ? 'Saved' : 'Wishlist'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 4: FLIPKART-STYLE 4-STEP REDEMPTION CHECKOUT FLOW
         ========================================================================= */}
      {currentView === 'checkout' && selectedProduct && (
        <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
          {/* Checkout Header */}
          <div className="flex items-center justify-between pb-3 border-b border-warm-sand dark:border-slate-700">
            <div>
              <h2 className="text-xl font-extrabold text-midnight-pine dark:text-cloud-white flex items-center gap-2">
                <span>🛍️</span> Green Points Redemption Checkout
              </h2>
              <p className="text-xs text-midnight-pine/70 dark:text-soft-mint/70">
                Complete your delivery details to claim your reward. Zero monetary payment required.
              </p>
            </div>
            <button
              onClick={() => setCurrentView('product')}
              className="text-xs font-bold text-deep-emerald hover:underline"
            >
              Cancel & Return
            </button>
          </div>

          {checkoutError && (
            <div className="p-3.5 rounded-xl bg-[#F5EAE8] border border-[#E8B4AC] text-[#B84A39] text-xs font-bold flex items-center gap-2">
              <span>⚠️</span>
              <span>{checkoutError}</span>
            </div>
          )}

          <div className="space-y-5">
            {/* STEP 1: SELECTED REWARD SUMMARY */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-warm-sand dark:border-slate-700 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-deep-emerald flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-soft-mint flex items-center justify-center text-[10px]">1</span>
                  Selected Reward Item
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-soft-mint text-deep-emerald">
                  {selectedProduct.fulfilment_type === 'digital' ? 'Digital Download' : 'Physical Product'}
                </span>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-cloud-white border border-warm-sand flex-shrink-0">
                  <img src={selectedProduct.image_url} alt={selectedProduct.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-extrabold text-midnight-pine dark:text-cloud-white truncate">
                    {selectedProduct.name}
                  </h3>
                  <p className="text-xs text-midnight-pine/70 dark:text-soft-mint/70">{selectedProduct.tagline}</p>
                  <div className="text-xs font-bold text-deep-emerald mt-1">
                    {selectedProduct.points_cost} GP per unit
                  </div>
                </div>
                {selectedProduct.fulfilment_type === 'physical' && (
                  <div className="flex items-center gap-2 bg-cloud-white dark:bg-slate-900 border border-warm-sand dark:border-slate-700 p-1 rounded-xl">
                    <button
                      onClick={() => setCheckoutQuantity(Math.max(1, checkoutQuantity - 1))}
                      className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 text-xs font-bold shadow-sm"
                    >
                      -
                    </button>
                    <span className="px-2 font-mono font-bold text-xs">{checkoutQuantity}</span>
                    <button
                      onClick={() => setCheckoutQuantity(Math.min(selectedProduct.stock_quantity, checkoutQuantity + 1))}
                      className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 text-xs font-bold shadow-sm"
                    >
                      +
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* STEP 2: DELIVERY DETAILS (Only for physical products) */}
            {selectedProduct.fulfilment_type !== 'digital' ? (
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-warm-sand dark:border-slate-700 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-deep-emerald flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-soft-mint flex items-center justify-center text-[10px]">2</span>
                    Delivery & Fulfillment Details
                  </span>
                  <span className="text-[11px] text-midnight-pine/60 dark:text-soft-mint/60">
                    Free Eco-Courier Delivery
                  </span>
                </div>

                {/* Saved addresses selector */}
                {addresses.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-midnight-pine dark:text-cloud-white block">Saved Address</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {addresses.map(a => (
                        <div
                          key={a.id}
                          onClick={() => {
                            setSelectedAddressId(a.id);
                            setRecipientName(a.recipient_name);
                            setRecipientPhone(a.phone);
                            setDeliveryAddress(a.address);
                            setDeliveryCity(a.city);
                            setDeliveryState(a.state);
                            setDeliveryPincode(a.pincode);
                          }}
                          className={`p-3 rounded-xl border text-xs cursor-pointer transition ${
                            selectedAddressId === a.id
                              ? 'border-deep-emerald bg-soft-mint/40 font-bold'
                              : 'border-warm-sand hover:bg-slate-50 dark:hover:bg-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-midnight-pine dark:text-cloud-white">{a.recipient_name}</span>
                            {a.is_default === 1 && <span className="text-[9px] px-1.5 py-0.2 rounded bg-soft-mint text-deep-emerald">Default</span>}
                          </div>
                          <div className="text-[11px] text-midnight-pine/70 dark:text-soft-mint/70 truncate mt-0.5">{a.address}</div>
                          <div className="text-[10px] text-midnight-pine/60 dark:text-soft-mint/60">{a.city}, {a.pincode} • {a.phone}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Address Form Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-midnight-pine dark:text-cloud-white mb-1">
                      Recipient Full Name *
                    </label>
                    <input
                      type="text"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-warm-sand bg-cloud-white dark:bg-slate-900 text-xs font-medium focus:ring-2 focus:ring-impact-green"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-midnight-pine dark:text-cloud-white mb-1">
                      Contact Phone *
                    </label>
                    <input
                      type="text"
                      value={recipientPhone}
                      onChange={(e) => setRecipientPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-warm-sand bg-cloud-white dark:bg-slate-900 text-xs font-medium focus:ring-2 focus:ring-impact-green"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-midnight-pine dark:text-cloud-white mb-1">
                      Street Address / Organisation Location *
                    </label>
                    <input
                      type="text"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-warm-sand bg-cloud-white dark:bg-slate-900 text-xs font-medium focus:ring-2 focus:ring-impact-green"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-midnight-pine dark:text-cloud-white mb-1">
                      City & State *
                    </label>
                    <input
                      type="text"
                      value={`${deliveryCity}, ${deliveryState}`}
                      onChange={(e) => setDeliveryCity(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-warm-sand bg-cloud-white dark:bg-slate-900 text-xs font-medium focus:ring-2 focus:ring-impact-green"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-midnight-pine dark:text-cloud-white mb-1">
                      PIN Code *
                    </label>
                    <input
                      type="text"
                      value={deliveryPincode}
                      onChange={(e) => setDeliveryPincode(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-warm-sand bg-cloud-white dark:bg-slate-900 text-xs font-medium focus:ring-2 focus:ring-impact-green"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-midnight-pine dark:text-cloud-white mb-1">
                      Optional Delivery Instructions
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Leave with security desk, gate code, call before delivery"
                      value={deliveryInstructions}
                      onChange={(e) => setDeliveryInstructions(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-warm-sand bg-cloud-white dark:bg-slate-900 text-xs font-medium focus:ring-2 focus:ring-impact-green"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="chk-save-addr"
                    checked={saveAddressForFuture}
                    onChange={(e) => setSaveAddressForFuture(e.target.checked)}
                    className="w-4 h-4 rounded text-deep-emerald accent-deep-emerald"
                  />
                  <label htmlFor="chk-save-addr" className="text-xs font-medium text-midnight-pine dark:text-cloud-white cursor-pointer">
                    Save this address to my profile for faster future redemptions
                  </label>
                </div>
              </div>
            ) : (
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-warm-sand dark:border-slate-700 shadow-sm space-y-2">
                <span className="text-xs font-black uppercase tracking-wider text-deep-emerald flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-soft-mint flex items-center justify-center text-[10px]">2</span>
                  Instant Digital Delivery
                </span>
                <p className="text-xs text-midnight-pine/80 dark:text-cloud-white/80">
                  This reward is 100% digital. It will be generated immediately with cryptographic verification credentials and sent to your verified email: <strong>{userEmail}</strong>.
                </p>
              </div>
            )}

            {/* STEP 3 & 4: REDEMPTION LEDGER SUMMARY & CONFIRMATION */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-warm-sand dark:border-slate-700 shadow-sm space-y-4">
              <span className="text-xs font-black uppercase tracking-wider text-deep-emerald flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-soft-mint flex items-center justify-center text-[10px]">3</span>
                Green Points Transaction Breakdown
              </span>

              <div className="divide-y divide-warm-sand/60 dark:divide-slate-700 text-xs space-y-2">
                <div className="flex items-center justify-between pt-1">
                  <span className="text-midnight-pine/70 dark:text-soft-mint/70">Current Green Wallet Balance:</span>
                  <span className="font-mono font-bold text-midnight-pine dark:text-cloud-white">{wallet.balance.toLocaleString()} GP</span>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-midnight-pine/70 dark:text-soft-mint/70">Points Required ({checkoutQuantity}x @ {selectedProduct.points_cost} GP):</span>
                  <span className="font-mono font-bold text-rose-600">-{(selectedProduct.points_cost * checkoutQuantity).toLocaleString()} GP</span>
                </div>
                <div className="flex items-center justify-between pt-2 font-bold text-sm">
                  <span className="text-deep-emerald dark:text-impact-green">Remaining Wallet Balance after Redemption:</span>
                  <span className="font-mono text-deep-emerald dark:text-impact-green font-black">
                    {(wallet.balance - (selectedProduct.points_cost * checkoutQuantity)).toLocaleString()} GP
                  </span>
                </div>
              </div>

              <div className="pt-3">
                <button
                  onClick={handleConfirmRedemption}
                  disabled={isSubmittingCheckout || wallet.balance < (selectedProduct.points_cost * checkoutQuantity)}
                  className="w-full py-3.5 px-6 rounded-xl bg-deep-emerald hover:bg-midnight-pine text-cloud-white text-sm font-extrabold shadow-lg transition flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:bg-slate-300 disabled:cursor-not-allowed"
                >
                  {isSubmittingCheckout ? (
                    <>
                      <span className="animate-spin text-base">⏳</span>
                      <span>Processing Transactional Redemption...</span>
                    </>
                  ) : (
                    <>
                      <span>✓</span>
                      <span>Confirm Redemption ({(selectedProduct.points_cost * checkoutQuantity).toLocaleString()} GP)</span>
                    </>
                  )}
                </button>
                <p className="text-[11px] text-center text-midnight-pine/60 dark:text-soft-mint/60 mt-2">
                  🔒 Transaction is recorded securely into the immutable Sanjeevni Green Points Ledger.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 5: ORDER SUCCESS & CONFIRMATION
         ========================================================================= */}
      {currentView === 'success' && lastRedeemedOrder && (
        <div className="max-w-xl mx-auto p-8 rounded-3xl bg-white dark:bg-slate-800 border border-warm-sand dark:border-slate-700 shadow-xl text-center space-y-6 animate-fadeIn">
          <div className="w-20 h-20 rounded-full bg-soft-mint text-deep-emerald flex items-center justify-center text-4xl mx-auto shadow-inner animate-bounce">
            🎉
          </div>

          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-deep-emerald">
              Redemption Successful
            </span>
            <h2 className="text-2xl font-black text-midnight-pine dark:text-cloud-white">
              Reward Redeemed Successfully!
            </h2>
            <p className="text-xs text-midnight-pine/70 dark:text-soft-mint/70">
              Order Reference ID: <strong className="font-mono text-deep-emerald text-sm">{lastRedeemedOrder.orderId}</strong>
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-cloud-white dark:bg-slate-900 border border-warm-sand dark:border-slate-700 text-left space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-white border border-warm-sand flex-shrink-0">
                <img src={lastRedeemedOrder.product.image_url} alt="Product" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-midnight-pine dark:text-cloud-white truncate">
                  {lastRedeemedOrder.product.name}
                </h4>
                <div className="text-xs text-midnight-pine/70 dark:text-soft-mint/70">Quantity: {lastRedeemedOrder.quantity} unit(s)</div>
                <div className="text-xs font-bold text-deep-emerald mt-0.5">
                  -{lastRedeemedOrder.pointsDeducted} GP Deducted
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-warm-sand/60 dark:border-slate-800 text-xs flex items-center justify-between">
              <span className="text-midnight-pine/70 dark:text-soft-mint/70">Remaining Green Wallet:</span>
              <span className="font-mono font-bold text-deep-emerald">{lastRedeemedOrder.newBalance.toLocaleString()} GP</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              onClick={() => handleOpenTracking(lastRedeemedOrder.orderId)}
              className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-deep-emerald hover:bg-midnight-pine text-cloud-white font-bold text-xs shadow-md transition"
            >
              📍 Track Order Status
            </button>
            <button
              onClick={() => setCurrentView('catalog')}
              className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-soft-mint text-deep-emerald font-bold text-xs hover:bg-[#c4dcce] transition"
            >
              Continue Exploring Rewards
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 6: MY REDEMPTIONS / ORDER HISTORY (FLIPKART STYLE)
         ========================================================================= */}
      {currentView === 'orders' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-warm-sand dark:border-slate-700">
            <div>
              <h2 className="text-xl font-extrabold text-midnight-pine dark:text-cloud-white flex items-center gap-2">
                <span>📦</span> My Redemptions & Order History
              </h2>
              <p className="text-xs text-midnight-pine/70 dark:text-soft-mint/70">
                Review and track all products and digital certificates claimed with your Green Points.
              </p>
            </div>
            <button
              onClick={() => setCurrentView('catalog')}
              className="px-3 py-1.5 rounded-xl bg-deep-emerald text-cloud-white text-xs font-bold transition"
            >
              + Redeem New Reward
            </button>
          </div>

          {orders.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-800 border border-warm-sand dark:border-slate-700 space-y-3">
              <div className="text-4xl">🎁</div>
              <h3 className="text-base font-bold text-midnight-pine dark:text-cloud-white">No redemptions yet</h3>
              <p className="text-xs text-midnight-pine/70 dark:text-soft-mint/70 max-w-sm mx-auto">
                You have {wallet.balance} Green Points available! Explore our eco-friendly rewards catalog to claim your first reward.
              </p>
              <button
                onClick={() => setCurrentView('catalog')}
                className="px-4 py-2 rounded-xl bg-deep-emerald text-cloud-white text-xs font-bold"
              >
                Explore Catalogue
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map(order => (
                <div
                  key={order.id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-warm-sand dark:border-slate-700 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-md transition"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-cloud-white border border-warm-sand flex-shrink-0">
                      <img src={order.product_image} alt={order.product_name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-deep-emerald">{order.id}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          order.status === 'Delivered' ? 'bg-emerald-100 text-deep-emerald' :
                          order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'Cancelled' ? 'bg-rose-100 text-rose-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      <h4 className="text-sm font-extrabold text-midnight-pine dark:text-cloud-white mt-0.5">
                        {order.product_name}
                      </h4>
                      <p className="text-xs text-midnight-pine/60 dark:text-soft-mint/60">
                        Redeemed on {order.created_at ? order.created_at.slice(0, 10) : 'Recent'} • {order.quantity} item(s)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-warm-sand/60">
                    <div className="text-left md:text-right">
                      <div className="text-xs text-midnight-pine/60 dark:text-soft-mint/60">Points Spent</div>
                      <div className="text-sm font-mono font-black text-deep-emerald dark:text-impact-green">
                        {order.points_spent} GP
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenTracking(order.id)}
                        className="px-3.5 py-2 rounded-xl bg-deep-emerald hover:bg-midnight-pine text-cloud-white text-xs font-bold transition shadow-sm"
                      >
                        📍 Track Order
                      </button>

                      {['Redemption Placed', 'Confirmed', 'Preparing Your Reward'].includes(order.status) && (
                        <button
                          onClick={() => handleCancelOrder(order.id)}
                          className="px-3 py-2 rounded-xl border border-rose-300 text-rose-700 text-xs font-bold hover:bg-rose-50 transition"
                          title="Cancel redemption and refund Green Points"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          VIEW 7: FLIPKART-STYLE VISUAL ORDER TRACKING TIMELINE
         ========================================================================= */}
      {currentView === 'tracking' && selectedOrder && (
        <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-warm-sand dark:border-slate-700">
            <div>
              <div className="flex items-center gap-2">
                <button onClick={() => setCurrentView('orders')} className="text-xs font-bold text-deep-emerald hover:underline">
                  ← Back to Orders
                </button>
                <span className="text-xs text-midnight-pine/40">|</span>
                <span className="text-xs text-midnight-pine/70 dark:text-soft-mint/70 font-mono">Order #{selectedOrder.id}</span>
              </div>
              <h2 className="text-xl font-extrabold text-midnight-pine dark:text-cloud-white mt-1">
                Fulfillment Progress & Timeline
              </h2>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-black ${
              selectedOrder.status === 'Delivered' ? 'bg-emerald-100 text-deep-emerald' :
              selectedOrder.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
              selectedOrder.status === 'Cancelled' ? 'bg-rose-100 text-rose-800' :
              'bg-amber-100 text-amber-800'
            }`}>
              {selectedOrder.status}
            </span>
          </div>

          {/* Product & Courier Strip */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-warm-sand dark:border-slate-700 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-cloud-white border border-warm-sand flex-shrink-0">
                <img src={selectedOrder.product_image} alt="Reward" className="w-full h-full object-cover" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-midnight-pine dark:text-cloud-white">
                  {selectedOrder.product_name}
                </h4>
                <p className="text-xs text-midnight-pine/60 dark:text-soft-mint/60">
                  Quantity: {selectedOrder.quantity} • Cost: {selectedOrder.points_spent} GP
                </p>
              </div>
            </div>

            {selectedOrder.tracking_number && (
              <div className="text-left sm:text-right text-xs">
                <div className="text-midnight-pine/60 dark:text-soft-mint/60">Courier Partner & Tracking</div>
                <div className="font-bold text-midnight-pine dark:text-cloud-white">
                  {selectedOrder.courier_partner || 'EcoExpress Logistics'}
                </div>
                <div className="font-mono text-deep-emerald font-bold">
                  {selectedOrder.tracking_number}
                </div>
              </div>
            )}
          </div>

          {/* Visual Order Tracking Progress Timeline */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-800 border border-warm-sand dark:border-slate-700 shadow-sm space-y-6">
            <h3 className="text-sm font-extrabold text-midnight-pine dark:text-cloud-white uppercase tracking-wider">
              Live Order Progress
            </h3>

            {/* Standard Tracking Steps for Physical vs Digital */}
            {(() => {
              const physicalSteps = [
                'Redemption Placed',
                'Confirmed',
                'Preparing Your Reward',
                'Ready for Dispatch',
                'Shipped',
                'Out for Delivery',
                'Delivered'
              ];
              const digitalSteps = [
                'Redemption Placed',
                'Processing',
                'Ready to Download',
                'Delivered'
              ];
              const steps = selectedOrder.fulfilment_type === 'digital' ? digitalSteps : physicalSteps;
              const currentStepIdx = steps.indexOf(selectedOrder.status);
              const isCancelled = selectedOrder.status === 'Cancelled';

              return (
                <div className="space-y-6">
                  {/* Timeline Bar */}
                  <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-2.5 sm:before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-warm-sand dark:before:bg-slate-700">
                    {steps.map((st, idx) => {
                      const isCompleted = !isCancelled && (currentStepIdx >= idx || selectedOrder.status === 'Delivered');
                      const isCurrent = !isCancelled && currentStepIdx === idx;
                      const historyItem = (selectedOrder.statusTimeline || []).find(h => h.status === st);

                      return (
                        <div key={st} className="relative flex items-start gap-4">
                          {/* Dot / Icon */}
                          <div className={`absolute -left-6 sm:-left-8 w-5 sm:w-7 h-5 sm:h-7 rounded-full flex items-center justify-center text-xs font-bold transition ${
                            isCurrent
                              ? 'bg-impact-green text-midnight-pine ring-4 ring-impact-green/20 scale-110'
                              : isCompleted
                              ? 'bg-deep-emerald text-white'
                              : 'bg-warm-sand text-midnight-pine/40'
                          }`}>
                            {isCompleted ? '✓' : (idx + 1)}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className={`text-xs sm:text-sm font-bold ${
                                isCurrent ? 'text-deep-emerald dark:text-impact-green font-extrabold' :
                                isCompleted ? 'text-midnight-pine dark:text-cloud-white' :
                                'text-midnight-pine/40 dark:text-soft-mint/40'
                              }`}>
                                {st}
                              </h4>
                              {historyItem && (
                                <span className="text-[11px] font-mono text-midnight-pine/60 dark:text-soft-mint/60">
                                  {historyItem.timestamp ? historyItem.timestamp.slice(0, 16).replace('T', ' ') : ''}
                                </span>
                              )}
                            </div>
                            {historyItem && historyItem.note && (
                              <p className="text-xs text-midnight-pine/70 dark:text-soft-mint/70 mt-0.5">
                                {historyItem.note}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {isCancelled && (
                      <div className="relative flex items-start gap-4">
                        <div className="absolute -left-6 sm:-left-8 w-5 sm:w-7 h-5 sm:h-7 rounded-full bg-rose-600 text-white flex items-center justify-center text-xs font-bold">
                          ✕
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-rose-600">Redemption Cancelled</h4>
                          <p className="text-xs text-rose-700 mt-0.5">
                            {selectedOrder.status_notes || 'Cancelled by user. Points refunded back to Green Wallet.'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Demo Simulation Tool for testing order status progression */}
                  <div className="p-4 rounded-2xl bg-cloud-white dark:bg-slate-900 border border-warm-sand dark:border-slate-700 space-y-2">
                    <div className="text-xs font-bold text-deep-emerald flex items-center gap-1.5">
                      <span>🧪</span> Live Demonstration Simulator: Advance Fulfillment Stage
                    </div>
                    <p className="text-[11px] text-midnight-pine/70 dark:text-soft-mint/70">
                      You can simulate the warehouse packing, courier dispatch, and final delivery lifecycle in real-time.
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {steps.map(s => (
                        <button
                          key={s}
                          onClick={async () => {
                            await window.SanjeevniAPI.rewards.updateOrderStatus(selectedOrder.id, {
                              status: s,
                              trackingNumber: selectedOrder.tracking_number || 'EE-IND-99401',
                              courierPartner: 'EcoExpress Green Logistics',
                              note: `Stage simulated: ${s}`
                            });
                            handleOpenTracking(selectedOrder.id);
                          }}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                            selectedOrder.status === s ? 'bg-deep-emerald text-white' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200'
                          }`}
                        >
                          ➔ Mark {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Delivery Address Details */}
          {selectedOrder.fulfilment_type === 'physical' && (
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-warm-sand dark:border-slate-700 shadow-sm space-y-2 text-xs">
              <span className="font-bold text-midnight-pine dark:text-cloud-white uppercase text-[10px] tracking-wider">
                Shipping Destination
              </span>
              <div className="font-bold text-midnight-pine dark:text-cloud-white">{selectedOrder.delivery_recipient_name}</div>
              <div className="text-midnight-pine/70 dark:text-soft-mint/70">{selectedOrder.delivery_address}</div>
              <div className="text-midnight-pine/70 dark:text-soft-mint/70">
                {selectedOrder.delivery_city}, {selectedOrder.delivery_state} — {selectedOrder.delivery_pincode}
              </div>
              <div className="text-midnight-pine/60 dark:text-soft-mint/60">Phone: {selectedOrder.delivery_phone}</div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          VIEW 8: MY GREEN WALLET & AUDITABLE TRANSACTION LEDGER
         ========================================================================= */}
      {currentView === 'wallet' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Wallet Balance Hero Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-tr from-midnight-pine to-deep-emerald text-cloud-white shadow-xl relative overflow-hidden border border-deep-emerald/40">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-soft-mint text-midnight-pine uppercase tracking-wider inline-flex items-center gap-1.5">
                  <span>🪙</span> Official Sanjeevni Green Wallet
                </span>
                <div className="text-4xl sm:text-5xl font-black tracking-tight text-cloud-white">
                  {wallet.balance.toLocaleString()} <span className="text-impact-green text-2xl font-bold">GP</span>
                </div>
                <p className="text-xs text-soft-mint/80 max-w-md">
                  Earned through verified edible food rescue donations, organic waste recovery, and community zero-waste streaks.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  onClick={() => setCurrentView('catalog')}
                  className="px-6 py-3 rounded-xl bg-impact-green hover:bg-[#528d6e] text-midnight-pine font-black text-xs sm:text-sm shadow-md transition"
                >
                  Spend Points in Store ➔
                </button>
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-warm-sand dark:border-slate-700 shadow-sm">
              <div className="text-xs text-midnight-pine/60 dark:text-soft-mint/60 font-bold uppercase">Total GP Earned</div>
              <div className="text-xl font-black text-deep-emerald dark:text-impact-green mt-1">+{wallet.totalEarned.toLocaleString()} GP</div>
              <div className="text-[11px] text-midnight-pine/60 dark:text-soft-mint/60 mt-0.5">From food rescues & missions</div>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-warm-sand dark:border-slate-700 shadow-sm">
              <div className="text-xs text-midnight-pine/60 dark:text-soft-mint/60 font-bold uppercase">Total GP Redeemed</div>
              <div className="text-xl font-black text-rose-600 mt-1">-{wallet.totalRedeemed.toLocaleString()} GP</div>
              <div className="text-[11px] text-midnight-pine/60 dark:text-soft-mint/60 mt-0.5">Across {orders.length} reward orders</div>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-warm-sand dark:border-slate-700 shadow-sm">
              <div className="text-xs text-midnight-pine/60 dark:text-soft-mint/60 font-bold uppercase">Point Expiry Status</div>
              <div className="text-xl font-black text-midnight-pine dark:text-cloud-white mt-1">Never Expire</div>
              <div className="text-[11px] text-midnight-pine/60 dark:text-soft-mint/60 mt-0.5">Permanent civic credit</div>
            </div>
          </div>

          {/* Transaction Ledger Table */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-warm-sand dark:border-slate-700 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-midnight-pine dark:text-cloud-white">
                  Auditable Points Ledger & Activity History
                </h3>
                <p className="text-xs text-midnight-pine/70 dark:text-soft-mint/70">
                  Every credit and debit is mathematically verified and tied to an authenticated event.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-warm-sand dark:border-slate-700 text-midnight-pine/60 dark:text-soft-mint/60 font-bold uppercase">
                    <th className="py-2.5 px-3">Date & Time</th>
                    <th className="py-2.5 px-3">Event Description</th>
                    <th className="py-2.5 px-3">Reference</th>
                    <th className="py-2.5 px-3 text-right">Points</th>
                    <th className="py-2.5 px-3 text-right">Balance After</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-warm-sand/60 dark:divide-slate-700">
                  {wallet.transactions && wallet.transactions.map((tx, idx) => (
                    <tr key={idx} className="hover:bg-soft-mint/20 dark:hover:bg-slate-750">
                      <td className="py-3 px-3 font-mono text-midnight-pine/70 dark:text-soft-mint/70">
                        {tx.created_at ? tx.created_at.slice(0, 16).replace('T', ' ') : 'Recent'}
                      </td>
                      <td className="py-3 px-3 font-medium text-midnight-pine dark:text-cloud-white">
                        {tx.description}
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-midnight-pine/60 dark:text-soft-mint/60">
                        {tx.reference_id || '—'}
                      </td>
                      <td className={`py-3 px-3 text-right font-mono font-bold ${
                        tx.points > 0 ? 'text-deep-emerald dark:text-impact-green' : 'text-rose-600'
                      }`}>
                        {tx.points > 0 ? `+${tx.points}` : tx.points} GP
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-semibold text-midnight-pine dark:text-cloud-white">
                        {tx.balance_after ? tx.balance_after.toLocaleString() : '—'} GP
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 9: SAVED WISHLIST
         ========================================================================= */}
      {currentView === 'wishlist' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between pb-3 border-b border-warm-sand dark:border-slate-700">
            <div>
              <h2 className="text-xl font-extrabold text-midnight-pine dark:text-cloud-white flex items-center gap-2">
                <span>❤️</span> My Saved Rewards ({wishlist.length})
              </h2>
              <p className="text-xs text-midnight-pine/70 dark:text-soft-mint/70">
                Products you've saved to redeem once you earn enough Green Points.
              </p>
            </div>
            <button onClick={() => setCurrentView('catalog')} className="text-xs font-bold text-deep-emerald hover:underline">
              Explore More Rewards ➔
            </button>
          </div>

          {wishlist.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-800 border border-warm-sand dark:border-slate-700 space-y-3">
              <div className="text-4xl">🤍</div>
              <h3 className="text-base font-bold text-midnight-pine dark:text-cloud-white">Your wishlist is empty</h3>
              <p className="text-xs text-midnight-pine/70 dark:text-soft-mint/70 max-w-sm mx-auto">
                Browse our catalog and click the heart icon on any reward to save it for later.
              </p>
              <button
                onClick={() => setCurrentView('catalog')}
                className="px-4 py-2 rounded-xl bg-deep-emerald text-cloud-white text-xs font-bold"
              >
                Browse Rewards
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {wishlist.map(prod => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  userPoints={wallet.balance}
                  isSaved={true}
                  onToggleWishlist={(e) => handleToggleWishlist(prod, e)}
                  onViewDetails={() => { setSelectedProduct(prod); setCurrentView('product'); }}
                  onRedeemNow={(e) => handleStartCheckout(prod, e)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          VIEW 10: ADMIN REWARDS MANAGEMENT PORTAL (/admin/rewards)
         ========================================================================= */}
      {currentView === 'admin' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-warm-sand dark:border-slate-700">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-800 dark:text-amber-300 text-[10px] font-bold">
                  🛡️ Administrator Console
                </span>
                <span className="font-mono text-xs text-midnight-pine/60">/admin/rewards</span>
              </div>
              <h2 className="text-xl font-extrabold text-midnight-pine dark:text-cloud-white mt-1">
                Rewards Catalogue & Fulfilment Management
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setNewProductModal(true)}
                className="px-3.5 py-2 rounded-xl bg-deep-emerald hover:bg-midnight-pine text-cloud-white text-xs font-bold transition shadow-sm"
              >
                + Add New Reward Product
              </button>
            </div>
          </div>

          {/* Admin Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-warm-sand dark:border-slate-800 pb-2 text-xs font-bold">
            <button
              onClick={() => setAdminActiveTab('orders')}
              className={`px-3 py-1.5 rounded-lg transition ${
                adminActiveTab === 'orders' ? 'bg-deep-emerald text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              📦 Redemptions & Dispatch Queue ({orders.length})
            </button>
            <button
              onClick={() => setAdminActiveTab('products')}
              className={`px-3 py-1.5 rounded-lg transition ${
                adminActiveTab === 'products' ? 'bg-deep-emerald text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              🛍️ Catalog & Stock Levels ({products.length})
            </button>
          </div>

          {/* Tab 1: Orders Dispatch Manager */}
          {adminActiveTab === 'orders' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                {orders.map(order => (
                  <div key={order.id} className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-warm-sand dark:border-slate-700 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-deep-emerald">{order.id}</span>
                        <span className="text-xs text-midnight-pine dark:text-cloud-white font-bold">{order.product_name}</span>
                        <span className="text-[11px] text-midnight-pine/60 font-mono">({order.points_spent} GP)</span>
                      </div>
                      <div className="text-xs text-midnight-pine/70 dark:text-soft-mint/70">
                        Recipient: <strong>{order.delivery_recipient_name}</strong> • Phone: {order.delivery_phone}
                      </div>
                      <div className="text-[11px] text-midnight-pine/60 dark:text-soft-mint/60">
                        Address: {order.delivery_address}, {order.delivery_city}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        value={order.status}
                        onChange={async (e) => {
                          const newSt = e.target.value;
                          await window.SanjeevniAPI.rewards.updateOrderStatus(order.id, {
                            status: newSt,
                            trackingNumber: order.tracking_number || 'EE-IND-' + Math.floor(Math.random()*90000+10000),
                            courierPartner: 'EcoExpress Green Logistics',
                            note: `Status updated by Admin: ${newSt}`
                          });
                          loadStoreData();
                        }}
                        className="px-2.5 py-1.5 rounded-lg border border-warm-sand bg-cloud-white text-xs font-bold"
                      >
                        <option value="Redemption Placed">Redemption Placed</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Preparing Your Reward">Preparing Your Reward</option>
                        <option value="Ready for Dispatch">Ready for Dispatch</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Out for Delivery">Out for Delivery</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled (Refund)</option>
                      </select>

                      <button
                        onClick={() => handleOpenTracking(order.id)}
                        className="px-3 py-1.5 rounded-lg bg-soft-mint text-deep-emerald text-xs font-bold"
                      >
                        View Timeline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 2: Products & Inventory */}
          {adminActiveTab === 'products' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map(prod => (
                  <div key={prod.id} className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-warm-sand dark:border-slate-700 shadow-sm space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-cloud-white border border-warm-sand flex-shrink-0">
                        <img src={prod.image_url} alt="Prod" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-midnight-pine dark:text-cloud-white truncate">{prod.name}</h4>
                        <div className="text-[11px] font-mono text-deep-emerald font-bold">{prod.points_cost} GP</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-warm-sand/60">
                      <div>
                        <span className="text-midnight-pine/60">Stock:</span> <strong>{prod.stock_quantity}</strong>
                      </div>
                      <div>
                        <span className="text-midnight-pine/60">Status:</span> <strong>{prod.availability_status}</strong>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={async () => {
                          const newPts = prompt(`Update Green Points cost for ${prod.name}:`, prod.points_cost);
                          if (newPts && !isNaN(parseInt(newPts, 10))) {
                            await window.SanjeevniAPI.rewards.updateProduct(prod.id, { pointsCost: parseInt(newPts, 10) });
                            loadStoreData();
                          }
                        }}
                        className="flex-1 py-1 rounded bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700"
                      >
                        Edit Price
                      </button>
                      <button
                        onClick={async () => {
                          const newStk = prompt(`Update stock count for ${prod.name}:`, prod.stock_quantity);
                          if (newStk && !isNaN(parseInt(newStk, 10))) {
                            await window.SanjeevniAPI.rewards.updateProduct(prod.id, { stockQuantity: parseInt(newStk, 10) });
                            loadStoreData();
                          }
                        }}
                        className="flex-1 py-1 rounded bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700"
                      >
                        Edit Stock
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add Product Modal */}
          {newProductModal && (
            <div className="fixed inset-0 bg-midnight-pine/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-warm-sand">
                <div className="flex items-center justify-between pb-2 border-b border-warm-sand">
                  <h3 className="text-base font-bold text-midnight-pine dark:text-cloud-white">Add New Reward Product</h3>
                  <button onClick={() => setNewProductModal(false)} className="text-xs font-bold">✕</button>
                </div>

                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const form = e.target;
                    const data = {
                      categoryId: form.category.value,
                      name: form.pname.value,
                      tagline: form.tagline.value,
                      description: form.desc.value,
                      pointsCost: parseInt(form.points.value, 10),
                      stockQuantity: parseInt(form.stock.value, 10),
                      fulfilmentType: form.fulfilment.value,
                      imageUrl: form.image.value || 'https://images.unsplash.com/photo-1592417817098-8f3d6910985b?w=600&auto=format&fit=crop&q=80'
                    };
                    await window.SanjeevniAPI.rewards.createProduct(data);
                    setNewProductModal(false);
                    loadStoreData();
                  }}
                  className="space-y-3 text-xs"
                >
                  <div>
                    <label className="block font-bold mb-1">Product Title *</label>
                    <input name="pname" required placeholder="e.g. Copper Plant Watering Can" className="w-full px-3 py-1.5 rounded-lg border border-warm-sand bg-cloud-white" />
                  </div>
                  <div>
                    <label className="block font-bold mb-1">Category *</label>
                    <select name="category" className="w-full px-3 py-1.5 rounded-lg border border-warm-sand bg-cloud-white">
                      <option value="gardening">Gardening & Plantation</option>
                      <option value="eco_daily">Eco-Friendly Daily Use</option>
                      <option value="merchandise">SANJEEVNI Merchandise</option>
                      <option value="digital">Digital Rewards</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-bold mb-1">Points Price (GP) *</label>
                      <input name="points" type="number" defaultValue="450" required className="w-full px-3 py-1.5 rounded-lg border border-warm-sand bg-cloud-white" />
                    </div>
                    <div>
                      <label className="block font-bold mb-1">Stock Count *</label>
                      <input name="stock" type="number" defaultValue="50" required className="w-full px-3 py-1.5 rounded-lg border border-warm-sand bg-cloud-white" />
                    </div>
                  </div>
                  <div>
                    <label className="block font-bold mb-1">Fulfilment Type</label>
                    <select name="fulfilment" className="w-full px-3 py-1.5 rounded-lg border border-warm-sand bg-cloud-white">
                      <option value="physical">Physical Product (Doorstep Courier)</option>
                      <option value="digital">Digital Download (Instant PDF)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold mb-1">Tagline</label>
                    <input name="tagline" placeholder="Short benefit summary" className="w-full px-3 py-1.5 rounded-lg border border-warm-sand bg-cloud-white" />
                  </div>
                  <div>
                    <label className="block font-bold mb-1">Description</label>
                    <textarea name="desc" rows="2" placeholder="Full product details..." className="w-full px-3 py-1.5 rounded-lg border border-warm-sand bg-cloud-white"></textarea>
                  </div>
                  <div>
                    <label className="block font-bold mb-1">Image URL</label>
                    <input name="image" placeholder="https://images.unsplash.com/..." className="w-full px-3 py-1.5 rounded-lg border border-warm-sand bg-cloud-white" />
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <button type="button" onClick={() => setNewProductModal(false)} className="px-4 py-2 rounded-xl bg-slate-100 text-xs font-bold">Cancel</button>
                    <button type="submit" className="px-4 py-2 rounded-xl bg-deep-emerald text-white text-xs font-bold">Save to Catalog</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// =========================================================================
// REUSABLE FLIPKART-STYLE PRODUCT CARD COMPONENT
// =========================================================================
function ProductCard({ product, userPoints, isSaved, onToggleWishlist, onViewDetails, onRedeemNow }) {
  const isAffordable = userPoints >= product.points_cost;
  const isOutOfStock = product.fulfilment_type === 'physical' && product.stock_quantity <= 0;

  return (
    <div
      onClick={onViewDetails}
      className="rounded-2xl bg-white dark:bg-slate-800 border border-warm-sand dark:border-slate-700/80 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between group cursor-pointer"
    >
      {/* Product Image & Wishlist Button */}
      <div className="aspect-square bg-cloud-white dark:bg-slate-900 relative overflow-hidden">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Demo inventory indicator */}
        {product.is_demo_inventory && (
          <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full text-[9px] font-bold bg-midnight-pine/80 text-cloud-white backdrop-blur-sm">
            Demo Stock
          </span>
        )}

        {/* Wishlist toggle button */}
        <button
          onClick={onToggleWishlist}
          className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 dark:bg-slate-800/90 shadow-md flex items-center justify-center text-xs hover:scale-110 transition"
          title="Save to Wishlist"
        >
          {isSaved ? '❤️' : '🤍'}
        </button>

        {/* Status Pill */}
        {product.availability_status !== 'Available' && (
          <span className={`absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-full text-[9px] font-extrabold ${
            product.availability_status === 'Low Stock' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
          }`}>
            {product.availability_status}
          </span>
        )}
      </div>

      {/* Card Content */}
      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
        <div className="space-y-1">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-deep-emerald dark:text-impact-green">
            {product.category_name || (product.category_id === 'gardening' ? 'Gardening' : product.category_id === 'eco_daily' ? 'Eco Daily' : product.category_id === 'merchandise' ? 'Merch' : 'Digital')}
          </span>
          <h3 className="text-xs sm:text-sm font-extrabold text-midnight-pine dark:text-cloud-white line-clamp-2 leading-snug group-hover:text-deep-emerald transition">
            {product.name}
          </h3>
          <p className="text-[11px] text-midnight-pine/60 dark:text-soft-mint/60 line-clamp-1">
            {product.tagline}
          </p>
        </div>

        {/* Points Price & CTA */}
        <div className="pt-2 border-t border-warm-sand/60 dark:border-slate-700/60 flex items-center justify-between gap-2">
          <div>
            <span className="text-[9px] text-midnight-pine/50 dark:text-soft-mint/50 uppercase font-bold block">Redeem for</span>
            <div className="text-sm font-black text-deep-emerald dark:text-impact-green flex items-center gap-1">
              <span>🪙</span>
              <span>{product.points_cost.toLocaleString()} GP</span>
            </div>
          </div>

          <button
            onClick={onRedeemNow}
            disabled={!isAffordable || isOutOfStock}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-sm ${
              isAffordable && !isOutOfStock
                ? 'bg-deep-emerald hover:bg-midnight-pine text-cloud-white cursor-pointer active:scale-95'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
            }`}
          >
            {isOutOfStock ? 'Out of Stock' : isAffordable ? 'Redeem ➔' : `${product.points_cost - userPoints} more GP`}
          </button>
        </div>
      </div>
    </div>
  );
}

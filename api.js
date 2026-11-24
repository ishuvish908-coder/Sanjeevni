// =========================================================================
// SANJEEVNI - CLIENT API CLIENT & PERSISTENCE LAYER
// Communicates with Python backend (/api/*) with offline localStorage fallback
// =========================================================================

(function() {
  const API_BASE = '';

  async function request(endpoint, options = {}) {
    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {})
        },
        ...options
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error ${res.status}`);
      }
      return await res.json();
    } catch (err) {
      console.warn(`[SanjeevniAPI] ${endpoint} request failed or offline. Using local cache.`, err.message);
      throw err;
    }
  }

  window.SanjeevniAPI = {
    // Auth & Session
    login: async (email, password) => {
      try {
        return await request('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password })
        });
      } catch (err) {
        // Fallback demo users
        const users = [
          { id: 'USR-001', name: 'Suresh Patel', email: 'donor@kaveri.edu', role: 'Food Donor', organisationId: 'ORG-D1' },
          { id: 'USR-002', name: 'Meena Sen', email: 'ngo@akshaya.org', role: 'NGO / Food Receiver', organisationId: 'ORG-R1' },
          { id: 'USR-003', name: 'Rajesh Kumar', email: 'volunteer@sanjeevni.org', role: 'Volunteer' },
          { id: 'USR-004', name: 'Pandit R. K. Shastri', email: 'gaushala@karuna.org', role: 'Animal Welfare Organisation', organisationId: 'ORG-A1' },
          { id: 'USR-005', name: 'Er. Naveen Kothari', email: 'biogas@greenearth.gov.in', role: 'Waste Processing Partner', organisationId: 'ORG-W1' },
          { id: 'USR-006', name: 'Admin Sanjeevni', email: 'admin@sanjeevni.org', role: 'Admin' }
        ];
        const match = users.find(u => u.email.toLowerCase() === (email || '').toLowerCase()) || {
          id: 'USR-' + Date.now().toString().slice(-4),
          name: email.split('@')[0],
          email: email,
          role: 'Food Donor'
        };
        return { message: 'Logged in (local session)', user: match };
      }
    },

    register: async (data) => {
      try {
        return await request('/api/auth/register', {
          method: 'POST',
          body: JSON.stringify(data)
        });
      } catch (err) {
        const user = {
          id: 'USR-' + Date.now().toString().slice(-4),
          name: data.name,
          email: data.email,
          role: data.role || 'Food Donor',
          phone: data.phone || '',
          organisationId: data.organisationId || null
        };
        return { message: 'Registered successfully (local session)', user };
      }
    },

    resetPassword: async (email) => {
      try {
        return await request('/api/auth/reset-password', {
          method: 'POST',
          body: JSON.stringify({ email })
        });
      } catch (err) {
        return { message: `Password reset instructions sent for ${email}` };
      }
    },

    // Organisations
    getOrganisations: async (params = {}) => {
      try {
        const q = new URLSearchParams(params).toString();
        return await request(`/api/organisations${q ? '?' + q : ''}`);
      } catch (err) {
        return window.SAMPLE_ORGANISATIONS || [];
      }
    },

    registerOrganisation: async (data) => {
      try {
        return await request('/api/organisations', {
          method: 'POST',
          body: JSON.stringify(data)
        });
      } catch (err) {
        const id = 'ORG-' + Date.now().toString().slice(-5);
        return { message: 'Organisation registered locally', id };
      }
    },

    verifyOrganisation: async (orgId, status) => {
      try {
        return await request(`/api/organisations/${orgId}/verify`, {
          method: 'PUT',
          body: JSON.stringify({ status })
        });
      } catch (err) {
        return { message: `Organisation updated to ${status} (local)` };
      }
    },

    // Donations
    getDonations: async (status) => {
      try {
        return await request(`/api/donations${status ? '?status=' + status : ''}`);
      } catch (err) {
        return window.SanjeevniStorage ? window.SanjeevniStorage.load('donations', []) : [];
      }
    },

    createDonation: async (data) => {
      try {
        return await request('/api/donations', {
          method: 'POST',
          body: JSON.stringify(data)
        });
      } catch (err) {
        const id = 'DON-' + Date.now().toString().slice(-4);
        return { message: 'Donation created locally', id };
      }
    },

    updateDonationStatus: async (donationId, status, extra = {}) => {
      try {
        return await request(`/api/donations/${donationId}/status`, {
          method: 'PUT',
          body: JSON.stringify({ status, ...extra })
        });
      } catch (err) {
        return { message: `Donation status updated to ${status}` };
      }
    },

    allocateDonation: async (donationId, receiverId, quantity) => {
      try {
        return await request(`/api/donations/${donationId}/allocate`, {
          method: 'POST',
          body: JSON.stringify({ receiverId, quantity })
        });
      } catch (err) {
        return { message: 'Allocated locally', allocatedQuantity: quantity };
      }
    },

    // Waste
    getWasteListings: async (pathway) => {
      try {
        return await request(`/api/waste${pathway ? '?pathway=' + encodeURIComponent(pathway) : ''}`);
      } catch (err) {
        return window.SAMPLE_WASTE_LISTINGS || [];
      }
    },

    createWasteListing: async (data) => {
      try {
        return await request('/api/waste', {
          method: 'POST',
          body: JSON.stringify(data)
        });
      } catch (err) {
        const id = 'WST-' + Date.now().toString().slice(-4);
        return { message: 'Waste listing registered locally', id };
      }
    },

    updateWasteStatus: async (wasteId, status, outcome) => {
      try {
        return await request(`/api/waste/${wasteId}/status`, {
          method: 'PUT',
          body: JSON.stringify({ status, processingOutcome: outcome })
        });
      } catch (err) {
        return { message: `Waste status updated to ${status}` };
      }
    },

    // Volunteer Tasks
    getVolunteerTasks: async () => {
      try {
        return await request('/api/volunteers/tasks');
      } catch (err) {
        return window.SAMPLE_VOLUNTEER_TASKS || [];
      }
    },

    updateVolunteerTask: async (taskId, status, hoursSpent) => {
      try {
        return await request(`/api/volunteers/tasks/${taskId}/status`, {
          method: 'PUT',
          body: JSON.stringify({ status, hoursSpent })
        });
      } catch (err) {
        return { message: `Task updated to ${status}` };
      }
    },

    // Dabba Bank
    getDabbas: async () => {
      try {
        return await request('/api/dabba-bank');
      } catch (err) {
        return window.INITIAL_DABBAS || [];
      }
    },

    // Crisis
    getCrisis: async () => {
      try {
        return await request('/api/crisis');
      } catch (err) {
        return window.INITIAL_CRISIS_STATE || { is_active: 0 };
      }
    },

    toggleCrisis: async () => {
      try {
        return await request('/api/crisis/toggle', { method: 'POST' });
      } catch (err) {
        return { message: 'Crisis state toggled locally', isActive: true };
      }
    },

    // Stats
    getStats: async () => {
      try {
        return await request('/api/stats');
      } catch (err) {
        return {
          totalDonationsCount: 18,
          totalPlatesDonated: 1640,
          completedMeals: 1420,
          peopleFedToday: 320,
          estimatedValueSaved: 63900,
          co2AvoidedKg: 1782,
          totalWasteKg: 280,
          organisationsCount: 13,
          volunteersCount: 6,
          zeroWasteRate: '100%'
        };
      }
    },

    // Reset Data
    resetDemoData: async () => {
      try {
        return await request('/api/reset-data', { method: 'POST' });
      } catch (err) {
        if (window.SanjeevniStorage) window.SanjeevniStorage.clear();
        return { message: 'Reset locally' };
      }
    },

    // =========================================================================
    // GREEN REWARDS STORE & REDEMPTION API
    // =========================================================================
    rewards: {
      getCategories: async () => {
        try {
          return await request('/api/rewards/categories');
        } catch (err) {
          return [
            { id: 'gardening', name: 'Gardening & Plantation', slug: 'gardening', icon: '🌱', description: 'Seeds, saplings, organic compost, and home gardening essentials.' },
            { id: 'eco_daily', name: 'Eco-Friendly Daily Use', slug: 'eco-friendly', icon: '🌿', description: 'Reusable stainless steel utensils, containers, bottles, and zero-waste daily products.' },
            { id: 'merchandise', name: 'SANJEEVNI Merchandise', slug: 'merchandise', icon: '👕', description: 'Exclusive SANJEEVNI organic cotton apparel, bags, and community gear.' },
            { id: 'digital', name: 'Digital Rewards', slug: 'digital', icon: '🎖️', description: 'Digital recognition certificates, verified impact PDF reports, and donor badges.' }
          ];
        }
      },

      getProducts: async (params = {}) => {
        try {
          const q = new URLSearchParams(params).toString();
          return await request(`/api/rewards/products${q ? '?' + q : ''}`);
        } catch (err) {
          return [];
        }
      },

      getProduct: async (productId) => {
        try {
          return await request(`/api/rewards/products/${productId}`);
        } catch (err) {
          return null;
        }
      },

      getWallet: async (userId = 'USR-001') => {
        try {
          return await request(`/api/rewards/wallet?user_id=${encodeURIComponent(userId)}`);
        } catch (err) {
          return { userId, balance: 2450, totalEarned: 2450, totalRedeemed: 0, transactions: [] };
        }
      },

      checkout: async (data) => {
        return await request('/api/rewards/checkout', {
          method: 'POST',
          body: JSON.stringify(data)
        });
      },

      getOrders: async (params = {}) => {
        try {
          const q = new URLSearchParams(params).toString();
          return await request(`/api/rewards/orders${q ? '?' + q : ''}`);
        } catch (err) {
          return [];
        }
      },

      getOrder: async (orderId) => {
        return await request(`/api/rewards/orders/${orderId}`);
      },

      cancelOrder: async (orderId, data = {}) => {
        return await request(`/api/rewards/orders/${orderId}/cancel`, {
          method: 'POST',
          body: JSON.stringify(data)
        });
      },

      updateOrderStatus: async (orderId, data = {}) => {
        return await request(`/api/rewards/orders/${orderId}/status`, {
          method: 'PUT',
          body: JSON.stringify(data)
        });
      },

      getWishlist: async (userId = 'USR-001') => {
        try {
          return await request(`/api/rewards/wishlist?user_id=${encodeURIComponent(userId)}`);
        } catch (err) {
          return [];
        }
      },

      toggleWishlist: async (userId, productId) => {
        return await request('/api/rewards/wishlist/toggle', {
          method: 'POST',
          body: JSON.stringify({ userId, productId })
        });
      },

      getAddresses: async (userId = 'USR-001') => {
        try {
          return await request(`/api/rewards/addresses?user_id=${encodeURIComponent(userId)}`);
        } catch (err) {
          return [];
        }
      },

      saveAddress: async (data) => {
        return await request('/api/rewards/addresses', {
          method: 'POST',
          body: JSON.stringify(data)
        });
      },

      createProduct: async (data) => {
        return await request('/api/rewards/products', {
          method: 'POST',
          body: JSON.stringify(data)
        });
      },

      updateProduct: async (productId, data) => {
        return await request(`/api/rewards/products/${productId}`, {
          method: 'PUT',
          body: JSON.stringify(data)
        });
      },

      deleteProduct: async (productId) => {
        return await request(`/api/rewards/products/${productId}/delete`, {
          method: 'POST'
        });
      },

      getAnalytics: async () => {
        try {
          return await request('/api/rewards/analytics');
        } catch (err) {
          return { totalOrders: 0, totalPointsRedeemed: 0, ordersByStatus: {}, topProducts: [], lowStockAlerts: 0, outOfStockAlerts: 0 };
        }
      }
    },

    // KARN Pickup & Logistics Engine
    karn: {
      getTracking: async (id) => {
        try {
          const q = id ? `?id=${encodeURIComponent(id)}` : '';
          return await request(`/api/karn/track${q}`);
        } catch (err) {
          return null;
        }
      },

      getAgents: async () => {
        try {
          return await request('/api/karn/agents');
        } catch (err) {
          return [];
        }
      },

      assignAgent: async (data) => {
        return await request('/api/karn/assign', {
          method: 'POST',
          body: JSON.stringify(data)
        });
      },

      updateStatus: async (data) => {
        return await request('/api/karn/status', {
          method: 'POST',
          body: JSON.stringify(data)
        });
      }
    },

    // Waste-to-Value Pathways
    pathways: {
      getDetails: async () => {
        try {
          return await request('/api/pathways/details');
        } catch (err) {
          return null;
        }
      }
    },

    // Donor-Controlled Transportation & Logistics Engine
    transport: {
      getRequests: async (params = {}) => {
        try {
          const q = new URLSearchParams(params).toString();
          return await request(`/api/transport/requests${q ? '?' + q : ''}`);
        } catch (err) {
          return [];
        }
      },
      getRequestById: async (id) => {
        try {
          return await request(`/api/transport/requests?id=${encodeURIComponent(id)}`);
        } catch (err) {
          return null;
        }
      },
      approveQuote: async (data) => {
        return await request('/api/transport/quote/approve', {
          method: 'POST',
          body: JSON.stringify(data)
        });
      },
      confirmHandover: async (data) => {
        return await request('/api/transport/handover/confirm', {
          method: 'POST',
          body: JSON.stringify(data)
        });
      },
      switchMode: async (data) => {
        return await request('/api/transport/switch-mode', {
          method: 'POST',
          body: JSON.stringify(data)
        });
      },
      getFunding: async () => {
        try {
          return await request('/api/transport/funding');
        } catch (err) {
          return { fundingSources: [], expenses: [], pendingRequests: [], summary: {} };
        }
      },
      approveFunding: async (data) => {
        return await request('/api/transport/funding/approve', {
          method: 'POST',
          body: JSON.stringify(data)
        });
      },
      getProviders: async () => {
        try {
          return await request('/api/transport/providers');
        } catch (err) {
          return [];
        }
      },
      updateProviderStatus: async (data) => {
        return await request('/api/transport/providers/status', {
          method: 'POST',
          body: JSON.stringify(data)
        });
      }
    }
  };
})();

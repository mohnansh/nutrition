/**
 * NUTRITION FIRE - Main Store Application Controller
 * Modern DTC Fitness & Supplement E-Commerce Engine
 * Features:
 * - Welcome Lead Capture Popup (sends visitor name & phone to Owner WhatsApp)
 * - Developer Mode Authentication (Studio & Edit buttons only visible to owner with matching phone number)
 * - 4 Core Lineup (Protein as Coming Soon in 1 flavor, 1 Creatine, 1 Pre-Workout, 1 Mass Gainer)
 * - Minimalist Product Placeholders (Editable by owner via Developer Mode)
 * - Direct WhatsApp Checkout & Order Redirection
 */

(function () {
  // State
  let currentSection = "all";
  let searchQuery = "";
  let sortOption = "featured";
  let cart = [];
  let wishlist = [];
  let appliedCoupon = null;
  const FREE_SHIPPING_THRESHOLD = 1499;

  // Default Owner WhatsApp Phone Number (can be updated in Developer Mode / Owner Studio)
  const DEFAULT_WHATSAPP_NUMBER = "918397998199";

  function getOwnerWhatsAppNumber() {
    return localStorage.getItem("nf_owner_whatsapp") || DEFAULT_WHATSAPP_NUMBER;
  }

  function isDeveloperMode() {
    return localStorage.getItem("nf_developer_mode") === "true";
  }

  function setDeveloperMode(status) {
    if (status) {
      localStorage.setItem("nf_developer_mode", "true");
    } else {
      localStorage.removeItem("nf_developer_mode");
    }
    updateDeveloperModeUI();
  }

  // Update UI based on Developer Mode status
  function updateDeveloperModeUI() {
    const devMode = isDeveloperMode();
    const studioBtn = document.getElementById("open-admin-btn");
    const footerStudioBtn = document.getElementById("footer-studio-btn");
    const devBanner = document.getElementById("dev-mode-banner");

    if (studioBtn) {
      if (devMode) {
        studioBtn.classList.remove("hidden");
        studioBtn.innerHTML = `<span>👑</span><span class="hidden sm:inline">Studio (Dev Mode)</span>`;
        studioBtn.classList.add("ring-1", "ring-blue-500");
      } else {
        studioBtn.classList.add("hidden");
      }
    }

    if (footerStudioBtn) {
      if (devMode) {
        footerStudioBtn.classList.remove("hidden");
      } else {
        footerStudioBtn.classList.add("hidden");
      }
    }

    if (devBanner) {
      if (devMode) {
        devBanner.classList.remove("hidden");
      } else {
        devBanner.classList.add("hidden");
      }
    }

    // Update edit buttons on cards
    document.querySelectorAll(".card-quick-edit-btn").forEach(btn => {
      btn.style.display = devMode ? "flex" : "none";
    });

    const qvEditShortcut = document.getElementById("qv-edit-shortcut");
    if (qvEditShortcut) {
      qvEditShortcut.style.display = devMode ? "flex" : "none";
    }
  }

  // Coupons
  const COUPONS = {
    "FIRE10": { discount: 0.10, label: "10% OFF Launch Discount" },
    "FITNESS15": { discount: 0.15, label: "15% OFF Elite Member Discount" },
    "NUTRITION20": { discount: 0.20, label: "20% OFF Flash Sale" }
  };

  // Init App
  function initApp() {
    initTheme();
    loadCartFromStorage();
    loadWishlistFromStorage();
    setupEventListeners();
    setupLeadCaptureAndDevAuth();
    updateFilterCounts();
    renderProducts();
    updateCartUI();
    updateWishlistUI();
    updateDeveloperModeUI();
  }

  // Theme Management (Default = Light)
  function initTheme() {
    const savedTheme = localStorage.getItem("nf_theme") || "light";
    applyTheme(savedTheme);

    const themeToggleBtn = document.getElementById("theme-toggle");
    if (themeToggleBtn) {
      themeToggleBtn.addEventListener("click", () => {
        const isCurrentlyDark = document.documentElement.classList.contains("dark");
        const newTheme = isCurrentlyDark ? "light" : "dark";
        applyTheme(newTheme);
        localStorage.setItem("nf_theme", newTheme);
        showToast(newTheme === "dark" ? "Dark theme activated" : "Light theme activated", "info");
      });
    }
  }

  function applyTheme(theme) {
    const themeToggleBtn = document.getElementById("theme-toggle");
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      document.body.classList.add("dark");
      if (themeToggleBtn) themeToggleBtn.innerHTML = "☀️";
    } else {
      document.documentElement.classList.remove("dark");
      document.body.classList.remove("dark");
      if (themeToggleBtn) themeToggleBtn.innerHTML = "🌙";
    }
  }

  // Storage helpers
  function loadCartFromStorage() {
    try {
      const stored = localStorage.getItem("nf_cart_v2");
      if (stored) cart = JSON.parse(stored);
    } catch (e) {
      cart = [];
    }
  }

  function saveCartToStorage() {
    try {
      localStorage.setItem("nf_cart_v2", JSON.stringify(cart));
    } catch (e) {}
  }

  function loadWishlistFromStorage() {
    try {
      const stored = localStorage.getItem("nf_wishlist_v2");
      if (stored) wishlist = JSON.parse(stored);
    } catch (e) {
      wishlist = [];
    }
  }

  function saveWishlistToStorage() {
    try {
      localStorage.setItem("nf_wishlist_v2", JSON.stringify(wishlist));
    } catch (e) {}
  }

  // Lead Capture & Developer Authentication Setup
  function setupLeadCaptureAndDevAuth() {
    const leadModal = document.getElementById("lead-capture-modal");
    const leadForm = document.getElementById("lead-capture-form");
    const devAuthModal = document.getElementById("dev-auth-modal");
    const devAuthForm = document.getElementById("dev-auth-form");
    const closeDevAuthBtn = document.getElementById("close-dev-auth-btn");
    const logoBrand = document.getElementById("brand-logo-trigger");
    const openDevLoginBtn = document.getElementById("open-dev-login-btn");
    const exitDevModeBtn = document.getElementById("exit-dev-mode-btn");

    // Check if visitor is in developer mode
    const devMode = isDeveloperMode();

    // Always show welcome popup unless currently in Developer Mode
    if (!devMode && leadModal) {
      setTimeout(() => {
        leadModal.classList.remove("hidden");
        document.body.style.overflow = "hidden";
      }, 400);
    }

    // Lead Capture Form Submission
    if (leadForm) {
      leadForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const name = document.getElementById("lead-name").value.trim();
        const phone = document.getElementById("lead-phone").value.trim().replace(/\D/g, "");

        if (!name || !phone) {
          showToast("Please fill in your name and phone number.", "error");
          return;
        }

        const ownerPhone = getOwnerWhatsAppNumber().replace(/\D/g, "");

        // Regular visitor: Send lead details directly to Owner WhatsApp!
        const leadMessage = `👋 *NEW STORE VISITOR - NUTRITION FIRE*\n` +
          `━━━━━━━━━━━━━━━━━━━━━\n` +
          `• *Customer Name:* ${name}\n` +
          `• *Phone Number:* +${phone}\n` +
          `• *Request:* Avail Special Discount / Inquire on Products\n` +
          `• *Visit Time:* ${new Date().toLocaleString()}\n` +
          `━━━━━━━━━━━━━━━━━━━━━\n` +
          `Hi Nutrition Fire team, I'm ${name} (+${phone}). I want to avail the special discount on your supplements!`;

        const whatsappUrl = `https://wa.me/${ownerPhone}?text=${encodeURIComponent(leadMessage)}`;

        localStorage.setItem("nf_lead_submitted", "true");
        localStorage.setItem("nf_visitor_lead", JSON.stringify({ name, phone }));

        leadModal.classList.add("hidden");
        document.body.style.overflow = "";

        // Open WhatsApp to dispatch the lead notification
        window.open(whatsappUrl, "_blank");

        showToast(`Welcome, ${name}! Enjoy exploring Nutrition Fire.`, "success");
      });
    }

    // Secret Dev Auth Trigger (Click logo 5 times)
    let logoClicks = 0;
    let logoTimer = null;
    if (logoBrand) {
      logoBrand.addEventListener("click", (e) => {
        logoClicks++;
        clearTimeout(logoTimer);
        logoTimer = setTimeout(() => { logoClicks = 0; }, 2000);

        if (logoClicks >= 5) {
          logoClicks = 0;
          e.preventDefault();
          if (devAuthModal) {
            devAuthModal.classList.remove("hidden");
            document.body.style.overflow = "hidden";
          }
        }
      });
    }

    // Keyboard shortcut (Ctrl + Shift + D)
    window.addEventListener("keydown", (e) => {
      if (e.ctrlKey && e.shiftKey && (e.key === "D" || e.key === "d")) {
        e.preventDefault();
        if (devAuthModal) {
          devAuthModal.classList.remove("hidden");
          document.body.style.overflow = "hidden";
        }
      }
    });

    if (openDevLoginBtn && devAuthModal) {
      openDevLoginBtn.addEventListener("click", (e) => {
        e.preventDefault();
        devAuthModal.classList.remove("hidden");
        document.body.style.overflow = "hidden";
      });
    }

    if (closeDevAuthBtn && devAuthModal) {
      closeDevAuthBtn.addEventListener("click", () => {
        devAuthModal.classList.add("hidden");
        document.body.style.overflow = "";
      });
    }

    // Dev Auth Form Submit
    if (devAuthForm) {
      devAuthForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const inputPhone = document.getElementById("dev-phone-input").value.trim().replace(/\D/g, "");
        const inputPassword = document.getElementById("dev-password-input").value.trim();
        const ownerPhone = getOwnerWhatsAppNumber().replace(/\D/g, "");
        const ownerPassword = "anki@321";

        const isPhoneMatch = inputPhone === ownerPhone || 
                             inputPhone === ownerPhone.slice(-10) || 
                             (ownerPhone.endsWith(inputPhone) && inputPhone.length >= 10);
        const isPasswordMatch = inputPassword === ownerPassword;

        if (isPhoneMatch && isPasswordMatch) {
          setDeveloperMode(true);
          devAuthModal.classList.add("hidden");
          document.body.style.overflow = "";
          showToast("👑 Owner Studio Activated! Editing tools unlocked.", "success");
          renderProducts();
        } else if (!isPhoneMatch) {
          showToast("Invalid phone number.", "error");
        } else {
          showToast("Incorrect password.", "error");
        }
      });
    }

    // Exit Dev Mode Button
    if (exitDevModeBtn) {
      exitDevModeBtn.addEventListener("click", () => {
        setDeveloperMode(false);
        showToast("Exited Developer Mode. Returned to visitor view.", "info");
        renderProducts();
      });
    }
  }

  // Setup UI Listeners
  function setupEventListeners() {
    // Category tabs
    const categoryTabs = document.querySelectorAll(".category-tab-btn");
    categoryTabs.forEach(btn => {
      btn.addEventListener("click", () => {
        categoryTabs.forEach(b => {
          b.classList.remove("active", "bg-neutral-900", "dark:bg-white", "text-white", "dark:text-neutral-950", "border-neutral-900", "dark:border-white");
          b.classList.add("bg-white", "dark:bg-neutral-900", "text-neutral-600", "dark:text-neutral-400", "border-neutral-200", "dark:border-neutral-800");
        });
        btn.classList.add("active", "bg-neutral-900", "dark:bg-white", "text-white", "dark:text-neutral-950", "border-neutral-900", "dark:border-white");
        btn.classList.remove("bg-white", "dark:bg-neutral-900", "text-neutral-600", "dark:text-neutral-400", "border-neutral-200", "dark:border-neutral-800");

        currentSection = btn.dataset.section;
        renderProducts();
      });
    });

    // Search (Desktop & Mobile)
    const searchInput = document.getElementById("search-input");
    const searchInputMobile = document.getElementById("search-input-mobile");
    function handleSearch(val) {
      searchQuery = val.toLowerCase().trim();
      renderProducts();
    }
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        if (searchInputMobile) searchInputMobile.value = e.target.value;
        handleSearch(e.target.value);
      });
    }
    if (searchInputMobile) {
      searchInputMobile.addEventListener("input", (e) => {
        if (searchInput) searchInput.value = e.target.value;
        handleSearch(e.target.value);
      });
    }

    // Mobile Hamburger Menu Toggle
    const mobileMenuBtn = document.getElementById("mobile-menu-btn");
    const mobileMenuDrawer = document.getElementById("mobile-menu-drawer");
    if (mobileMenuBtn && mobileMenuDrawer) {
      mobileMenuBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        mobileMenuDrawer.classList.toggle("hidden");
      });
      // Close on clicking outside
      document.addEventListener("click", (e) => {
        if (!mobileMenuDrawer.contains(e.target) && e.target !== mobileMenuBtn && !mobileMenuBtn.contains(e.target)) {
          mobileMenuDrawer.classList.add("hidden");
        }
      });
    }

    // Sort
    const sortSelect = document.getElementById("sort-select");
    if (sortSelect) {
      sortSelect.addEventListener("change", (e) => {
        sortOption = e.target.value;
        renderProducts();
      });
    }

    // Cart Drawer Open/Close
    const cartToggleBtns = document.querySelectorAll(".cart-toggle-btn");
    const cartDrawer = document.getElementById("cart-drawer");
    const cartOverlay = document.getElementById("cart-overlay");
    const closeCartBtn = document.getElementById("close-cart-btn");

    cartToggleBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        if (cartDrawer && cartOverlay) {
          cartDrawer.classList.remove("translate-x-full");
          cartOverlay.classList.remove("hidden");
          document.body.style.overflow = "hidden";
        }
      });
    });

    function closeCart() {
      if (cartDrawer && cartOverlay) {
        cartDrawer.classList.add("translate-x-full");
        cartOverlay.classList.add("hidden");
        document.body.style.overflow = "";
      }
    }

    if (closeCartBtn) closeCartBtn.addEventListener("click", closeCart);
    if (cartOverlay) cartOverlay.addEventListener("click", closeCart);

    // Direct WhatsApp Fast Order from Cart Drawer
    const directWhatsAppBtn = document.getElementById("cart-whatsapp-direct-btn");
    if (directWhatsAppBtn) {
      directWhatsAppBtn.addEventListener("click", () => {
        if (cart.length === 0) {
          showToast("Your cart is empty!", "info");
          return;
        }
        sendOrderToWhatsApp({
          name: "Direct Customer",
          phone: "Via WhatsApp",
          address: "To be confirmed on chat",
          payment: "UPI / Cash on Delivery"
        });
      });
    }

    // Coupon Apply
    const couponInput = document.getElementById("coupon-input");
    const applyCouponBtn = document.getElementById("apply-coupon-btn");
    if (applyCouponBtn && couponInput) {
      applyCouponBtn.addEventListener("click", () => {
        const code = couponInput.value.toUpperCase().trim();
        if (!code) return;
        if (COUPONS[code]) {
          appliedCoupon = { code, ...COUPONS[code] };
          showToast(`Coupon '${code}' Applied: ${appliedCoupon.label}!`, "success");
          updateCartUI();
        } else {
          showToast("Invalid promo code. Use 'FIRE10' for 10% off.", "error");
        }
      });
    }

    // Quick View Modal Close
    const quickViewModal = document.getElementById("quickview-modal");
    const closeQuickViewBtn = document.getElementById("close-quickview-btn");
    if (closeQuickViewBtn && quickViewModal) {
      closeQuickViewBtn.addEventListener("click", () => {
        quickViewModal.classList.add("hidden");
        document.body.style.overflow = "";
      });
    }

    // Checkout Modal Open/Close
    const checkoutBtn = document.getElementById("checkout-btn");
    const checkoutModal = document.getElementById("checkout-modal");
    const closeCheckoutBtn = document.getElementById("close-checkout-btn");
    const checkoutForm = document.getElementById("checkout-form");

    if (checkoutBtn && checkoutModal) {
      checkoutBtn.addEventListener("click", () => {
        if (cart.length === 0) {
          showToast("Your cart is empty!", "info");
          return;
        }
        closeCart();
        checkoutModal.classList.remove("hidden");
        document.body.style.overflow = "hidden";
        renderCheckoutSummary();
      });
    }

    if (closeCheckoutBtn && checkoutModal) {
      closeCheckoutBtn.addEventListener("click", () => {
        checkoutModal.classList.add("hidden");
        document.body.style.overflow = "";
      });
    }

    // Checkout Form Submit -> WhatsApp Redirection
    if (checkoutForm) {
      checkoutForm.addEventListener("submit", (e) => {
        e.preventDefault();
        
        const customerData = {
          name: document.getElementById("co-name").value.trim(),
          phone: document.getElementById("co-phone").value.trim(),
          address: document.getElementById("co-address").value.trim(),
          city: document.getElementById("co-city").value.trim(),
          pincode: document.getElementById("co-pincode").value.trim(),
          payment: document.querySelector('input[name="payment-method"]:checked')?.value || "UPI / QR"
        };

        sendOrderToWhatsApp(customerData);
      });
    }
  }

  // Update Section Counters in Tabs
  function updateFilterCounts() {
    const products = window.ProductStore.getAll();
    const countAll = products.length;
    const countOwn = products.filter(p => p.section === "proteins-own").length;
    const countCreatine = products.filter(p => p.section === "creatine").length;
    const countPre = products.filter(p => p.section === "pre-workout").length;
    const countMass = products.filter(p => p.section === "mass-gainer").length;

    const setEl = (id, count) => {
      const el = document.getElementById(id);
      if (el) el.textContent = count;
    };

    setEl("count-all", countAll);
    setEl("count-proteins-own", countOwn);
    setEl("count-creatine", countCreatine);
    setEl("count-pre-workout", countPre);
    setEl("count-mass-gainer", countMass);
  }

  // Helper to render product image or clean placeholder
  function renderProductImageHTML(p, devMode) {
    if (p.image && p.image.trim() !== "") {
      return `<img src="${p.image}" alt="${p.name}" class="w-full h-full object-contain filter drop-shadow-sm cursor-pointer product-click-target" data-id="${p.id}" loading="lazy">`;
    }

    return `
      <div class="w-full h-full flex flex-col items-center justify-center text-center p-6 bg-neutral-100/70 dark:bg-neutral-900/60 rounded-xl cursor-pointer product-click-target" data-id="${p.id}">
        <div class="w-12 h-12 rounded-xl bg-neutral-200/70 dark:bg-neutral-800 flex items-center justify-center text-neutral-400 dark:text-neutral-500 mb-2">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
          </svg>
        </div>
        <span class="text-[10px] font-bold tracking-wider uppercase text-neutral-400 dark:text-neutral-500">Photo Coming Soon</span>
        ${devMode ? `<span class="text-[10px] text-blue-500 font-semibold mt-1">✏️ Click to Upload Photo</span>` : ''}
      </div>
    `;
  }

  // Render Storefront Products
  function renderProducts() {
    const container = document.getElementById("products-grid");
    if (!container) return;

    const devMode = isDeveloperMode();
    let products = window.ProductStore.getAll();

    if (currentSection !== "all") {
      products = products.filter(p => p.section === currentSection);
    }

    if (searchQuery) {
      products = products.filter(p => {
        const nameMatch = p.name.toLowerCase().includes(searchQuery);
        const brandMatch = p.brand.toLowerCase().includes(searchQuery);
        const flavorMatch = (p.flavors || []).some(f => f.toLowerCase().includes(searchQuery));
        const descMatch = (p.description || "").toLowerCase().includes(searchQuery);
        return nameMatch || brandMatch || flavorMatch || descMatch;
      });
    }

    if (sortOption === "price-low") {
      products.sort((a, b) => a.price - b.price);
    } else if (sortOption === "price-high") {
      products.sort((a, b) => b.price - a.price);
    } else if (sortOption === "rating") {
      products.sort((a, b) => b.rating - a.rating);
    }

    updateFilterCounts();

    if (products.length === 0) {
      container.innerHTML = `
        <div class="col-span-full text-center py-16 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-8 shadow-sm">
          <h3 class="font-heading text-lg font-bold text-neutral-900 dark:text-white mb-2">No supplements found</h3>
          <p class="text-neutral-500 text-sm max-w-md mx-auto mb-5">Try clearing your filters or search keywords.</p>
          <button id="reset-filter-btn" class="px-5 py-2.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 font-semibold text-xs rounded-xl transition shadow-sm">
            View All Products
          </button>
        </div>
      `;
      const resetBtn = document.getElementById("reset-filter-btn");
      if (resetBtn) {
        resetBtn.addEventListener("click", () => {
          const firstTab = document.querySelector(".category-tab-btn[data-section='all']");
          if (firstTab) firstTab.click();
          const searchInput = document.getElementById("search-input");
          if (searchInput) {
            searchInput.value = "";
            searchQuery = "";
          }
          renderProducts();
        });
      }
      return;
    }

    container.innerHTML = products.map(p => {
      const isWishlisted = wishlist.includes(p.id);
      const discountPct = p.originalPrice ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : 0;
      const sectionName = getSectionDisplayName(p.section);
      const isComingSoon = p.isComingSoon || p.section === "proteins-own";

      return `
        <div class="product-card group" data-product-id="${p.id}">
          
          <!-- Image Container / Minimalist Placeholder -->
          <div class="product-image-wrap relative aspect-square p-5 flex items-center justify-center border-b border-neutral-100 dark:border-neutral-800/80">
            
            <!-- Badges -->
            <div class="absolute top-3 left-3 z-10 flex flex-col gap-1.5 items-start">
              ${isComingSoon ? `
                <span class="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 shadow-sm border border-neutral-700 dark:border-neutral-300">
                  COMING SOON
                </span>
              ` : p.badge ? `
                <span class="px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 shadow-sm">
                  ${p.badge}
                </span>
              ` : ''}
              ${(!isComingSoon && discountPct > 0) ? `
                <span class="px-2 py-0.5 rounded-md text-[10px] font-semibold tracking-wide bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50">
                  ${discountPct}% OFF
                </span>
              ` : ''}
            </div>

            <!-- Top Right Action Controls: Quick Edit (Dev Mode only) & Wishlist -->
            <div class="absolute top-3 right-3 z-10 flex items-center gap-1.5">
              ${devMode ? `
                <button class="card-quick-edit-btn w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-md flex items-center justify-center text-xs transition hover:scale-110" data-id="${p.id}" title="Owner: Edit Price & Upload Photo">
                  ✏️
                </button>
              ` : ''}

              <button class="wishlist-btn w-8 h-8 rounded-full bg-white/95 dark:bg-neutral-800/90 shadow-sm border border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-xs transition hover:scale-105 ${isWishlisted ? 'text-red-500' : 'text-neutral-400'}" data-wishlist-id="${p.id}" title="Wishlist">
                ${isWishlisted ? '❤️' : '🤍'}
              </button>
            </div>

            <!-- Image or Minimalist DTC Placeholder -->
            ${renderProductImageHTML(p, devMode)}

            <!-- Quick view button overlay (visible on mobile tap target / hover on desktop) -->
            <button class="quickview-trigger-btn absolute inset-x-3 sm:inset-x-4 bottom-2.5 sm:bottom-3 py-2 sm:py-2.5 bg-neutral-900/95 text-white dark:bg-white/95 dark:text-neutral-950 rounded-xl text-[11px] sm:text-xs font-semibold uppercase tracking-wider opacity-90 sm:opacity-0 group-hover:opacity-100 transition duration-150 shadow-md flex items-center justify-center gap-1.5" data-id="${p.id}">
              <span>${isComingSoon ? "Preview Formula" : "Quick View"}</span>
              <span class="text-[10px]">👁️</span>
            </button>
          </div>

          <!-- Product Details Body -->
          <div class="p-5 flex flex-col flex-grow justify-between">
            <div>
              <div class="flex items-center justify-between text-xs text-neutral-400 dark:text-neutral-500 mb-1.5 font-medium">
                <span class="uppercase tracking-wider text-[10px]">${sectionName}</span>
                <span>${p.brand}</span>
              </div>

              <!-- Title -->
              <h3 class="font-heading font-bold text-base text-neutral-900 dark:text-white line-clamp-2 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition cursor-pointer product-click-target" data-id="${p.id}">
                ${p.name}
              </h3>

              <div class="flex items-center gap-1.5 mt-2 text-xs">
                ${isComingSoon ? `
                  <span class="text-blue-600 dark:text-blue-400 font-semibold text-[11px] uppercase tracking-wider">Launching in 1 Flavor</span>
                ` : `
                  <span class="text-amber-500 font-semibold">★ ${p.rating.toFixed(1)}</span>
                  <span class="text-neutral-400 dark:text-neutral-500">(${p.reviewsCount})</span>
                  <span class="text-neutral-300 dark:text-neutral-700">•</span>
                  <span class="text-neutral-500 dark:text-neutral-400">${p.servings} Servings</span>
                `}
              </div>

              ${p.nutritionFacts ? `
                <div class="flex flex-wrap gap-1.5 mt-3">
                  ${p.nutritionFacts.protein ? `<span class="px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800/80 text-[11px] text-neutral-700 dark:text-neutral-300 font-medium">${p.nutritionFacts.protein} Protein</span>` : ''}
                  ${p.nutritionFacts.creatine ? `<span class="px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800/80 text-[11px] text-neutral-700 dark:text-neutral-300 font-medium">${p.nutritionFacts.creatine} Creatine</span>` : ''}
                  ${p.nutritionFacts.citrulline ? `<span class="px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800/80 text-[11px] text-neutral-700 dark:text-neutral-300 font-medium">${p.nutritionFacts.citrulline} Citrulline</span>` : ''}
                  ${p.nutritionFacts.calories ? `<span class="px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800/80 text-[11px] text-neutral-500 dark:text-neutral-400">${p.nutritionFacts.calories}</span>` : ''}
                </div>
              ` : ''}
            </div>

            <!-- Price & Add To Cart / Coming Soon -->
            <div class="mt-5 pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
              <div>
                <div class="flex items-baseline gap-2">
                  <span class="text-xl font-heading font-bold text-neutral-900 dark:text-white">₹${p.price.toLocaleString()}</span>
                  ${p.originalPrice ? `<span class="text-xs text-neutral-400 line-through">₹${p.originalPrice.toLocaleString()}</span>` : ''}
                </div>
                <div class="text-[10px] text-neutral-500 dark:text-neutral-400 font-medium">
                  ${isComingSoon ? "Launch Price Preview" : "Free Express Delivery"}
                </div>
              </div>

              ${isComingSoon ? `
                <button class="quickview-trigger-btn px-4 py-2 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 font-semibold text-xs rounded-xl transition flex items-center gap-1" data-id="${p.id}">
                  <span>Coming Soon</span>
                </button>
              ` : `
                <button class="add-to-cart-quick px-4 py-2 bg-neutral-900 hover:bg-black dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-950 font-semibold text-xs rounded-xl transition hover:scale-[1.02] active:scale-[0.98] shadow-sm flex items-center gap-1" data-id="${p.id}">
                  <span>Add to Cart</span>
                </button>
              `}
            </div>
          </div>
        </div>
      `;
    }).join("");

    // Attach listeners
    container.querySelectorAll(".product-click-target, .quickview-trigger-btn").forEach(el => {
      el.addEventListener("click", () => openQuickView(el.dataset.id));
    });

    container.querySelectorAll(".card-quick-edit-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        window.AdminPanel?.openQuickEdit(btn.dataset.id);
      });
    });

    container.querySelectorAll(".add-to-cart-quick").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        quickAddToCart(btn.dataset.id);
      });
    });

    container.querySelectorAll(".wishlist-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleWishlist(btn.dataset.wishlistId);
      });
    });

    updateDeveloperModeUI();
  }

  function getSectionDisplayName(section) {
    switch (section) {
      case "proteins-own": return "Whey Protein (Coming Soon)";
      case "creatine": return "Creatine";
      case "pre-workout": return "Pre-Workout";
      case "mass-gainer": return "Mass Gainer";
      default: return "Supplements";
    }
  }

  // Quick View Modal
  function openQuickView(productId) {
    const p = window.ProductStore.getById(productId);
    if (!p) return;

    const modal = document.getElementById("quickview-modal");
    if (!modal) return;

    const devMode = isDeveloperMode();
    const isComingSoon = p.isComingSoon || p.section === "proteins-own";

    const qvImgContainer = document.getElementById("qv-img-container");
    if (qvImgContainer) {
      if (p.image && p.image.trim() !== "") {
        qvImgContainer.innerHTML = `<img id="qv-img" src="${p.image}" alt="${p.name}" class="w-full max-h-64 object-contain filter drop-shadow-sm">`;
      } else {
        qvImgContainer.innerHTML = `
          <div class="w-full h-48 flex flex-col items-center justify-center text-center p-6 bg-neutral-100/70 dark:bg-neutral-900/60 rounded-xl">
            <div class="w-12 h-12 rounded-xl bg-neutral-200/70 dark:bg-neutral-800 flex items-center justify-center text-neutral-400 mb-2">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
            </div>
            <span class="text-xs font-bold uppercase text-neutral-400">Photo Coming Soon</span>
            ${devMode ? `<span class="text-[10px] text-blue-500 mt-1 font-semibold">Click Edit below to upload photo</span>` : ''}
          </div>
        `;
      }
    }

    document.getElementById("qv-badge").textContent = isComingSoon ? "COMING SOON" : (p.badge || "FEATURED");
    document.getElementById("qv-brand").textContent = p.brand;
    document.getElementById("qv-title").textContent = p.name;
    document.getElementById("qv-rating").textContent = isComingSoon ? "Launching in 1 Flavor Soon" : `★ ${p.rating.toFixed(1)} (${p.reviewsCount} reviews)`;
    document.getElementById("qv-price").textContent = `₹${p.price.toLocaleString()}`;
    document.getElementById("qv-orig-price").textContent = p.originalPrice ? `₹${p.originalPrice.toLocaleString()}` : "";
    document.getElementById("qv-desc").textContent = p.description;

    const qvEditBtn = document.getElementById("qv-edit-shortcut");
    if (qvEditBtn) {
      qvEditBtn.style.display = devMode ? "flex" : "none";
      qvEditBtn.onclick = () => {
        modal.classList.add("hidden");
        window.AdminPanel?.openQuickEdit(p.id);
      };
    }

    const flavorsContainer = document.getElementById("qv-flavors");
    const flavors = p.flavors || ["Original"];
    let selectedFlavor = flavors[0];

    flavorsContainer.innerHTML = flavors.map((f, idx) => `
      <button class="flavor-pill px-3 py-1.5 rounded-lg text-xs font-medium border transition ${idx === 0 ? 'border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-950' : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:border-neutral-400'}" data-flavor="${f}">
        ${f}
      </button>
    `).join("");

    flavorsContainer.querySelectorAll(".flavor-pill").forEach(btn => {
      btn.addEventListener("click", () => {
        flavorsContainer.querySelectorAll(".flavor-pill").forEach(b => {
          b.classList.remove("border-neutral-900", "bg-neutral-900", "text-white", "dark:border-white", "dark:bg-white", "dark:text-neutral-950");
          b.classList.add("border-neutral-200", "dark:border-neutral-800", "bg-white", "dark:bg-neutral-900", "text-neutral-700", "dark:text-neutral-300");
        });
        btn.classList.add("border-neutral-900", "bg-neutral-900", "text-white", "dark:border-white", "dark:bg-white", "dark:text-neutral-950");
        btn.classList.remove("border-neutral-200", "dark:border-neutral-800", "bg-white", "dark:bg-neutral-900", "text-neutral-700", "dark:text-neutral-300");
        selectedFlavor = btn.dataset.flavor;
      });
    });

    const weightsContainer = document.getElementById("qv-weights");
    const weights = p.weightOptions || ["Standard Pack"];
    let selectedWeight = weights[0];

    weightsContainer.innerHTML = weights.map((w, idx) => `
      <button class="weight-pill px-3 py-1.5 rounded-lg text-xs font-medium border transition ${idx === 0 ? 'border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-950' : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:border-neutral-400'}" data-weight="${w}">
        ${w}
      </button>
    `).join("");

    weightsContainer.querySelectorAll(".weight-pill").forEach(btn => {
      btn.addEventListener("click", () => {
        weightsContainer.querySelectorAll(".weight-pill").forEach(b => {
          b.classList.remove("border-neutral-900", "bg-neutral-900", "text-white", "dark:border-white", "dark:bg-white", "dark:text-neutral-950");
          b.classList.add("border-neutral-200", "dark:border-neutral-800", "bg-white", "dark:bg-neutral-900", "text-neutral-700", "dark:text-neutral-300");
        });
        btn.classList.add("border-neutral-900", "bg-neutral-900", "text-white", "dark:border-white", "dark:bg-white", "dark:text-neutral-950");
        btn.classList.remove("border-neutral-200", "dark:border-neutral-800", "bg-white", "dark:bg-neutral-900", "text-neutral-700", "dark:text-neutral-300");
        selectedWeight = btn.dataset.weight;
      });
    });

    const specsContainer = document.getElementById("qv-specs");
    if (p.nutritionFacts) {
      specsContainer.innerHTML = Object.entries(p.nutritionFacts).map(([key, val]) => `
        <div class="bg-neutral-50 dark:bg-neutral-900 p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 text-center">
          <div class="text-[10px] uppercase text-neutral-400 dark:text-neutral-500 font-semibold">${key}</div>
          <div class="text-sm font-bold text-neutral-900 dark:text-white mt-0.5">${val}</div>
        </div>
      `).join("");
    } else {
      specsContainer.innerHTML = "";
    }

    let qty = 1;
    const qtyCount = document.getElementById("qv-qty-count");
    const qtyMinus = document.getElementById("qv-qty-minus");
    const qtyPlus = document.getElementById("qv-qty-plus");

    qtyCount.textContent = qty;
    qtyMinus.onclick = () => {
      if (qty > 1) {
        qty--;
        qtyCount.textContent = qty;
      }
    };
    qtyPlus.onclick = () => {
      qty++;
      qtyCount.textContent = qty;
    };

    const addModalBtn = document.getElementById("qv-add-btn");
    if (isComingSoon) {
      addModalBtn.textContent = "Coming Soon — Notify on WhatsApp";
      addModalBtn.onclick = () => {
        const ownerPhone = getOwnerWhatsAppNumber();
        const notifyMsg = `👋 *COMING SOON INQUIRY - NUTRITION FIRE*\nI am interested in *${p.name}* (${selectedFlavor}). Please notify me when it launches!`;
        window.open(`https://wa.me/${ownerPhone}?text=${encodeURIComponent(notifyMsg)}`, "_blank");
        modal.classList.add("hidden");
        document.body.style.overflow = "";
      };
    } else {
      addModalBtn.textContent = "Add to Cart";
      addModalBtn.onclick = () => {
        addToCart(p, selectedFlavor, selectedWeight, qty);
        modal.classList.add("hidden");
        document.body.style.overflow = "";
        showToast(`Added ${qty}x ${p.name} to Cart`, "success");
      };
    }

    modal.classList.remove("hidden");
    document.body.style.overflow = "hidden";
  }

  function quickAddToCart(productId) {
    const p = window.ProductStore.getById(productId);
    if (!p) return;
    if (p.isComingSoon || p.section === "proteins-own") {
      openQuickView(productId);
      return;
    }
    const flavor = (p.flavors && p.flavors[0]) || "Standard";
    const weight = (p.weightOptions && p.weightOptions[0]) || "Standard";
    addToCart(p, flavor, weight, 1);
    showToast(`Added "${p.name}" to cart`, "success");
  }

  function addToCart(product, flavor, weight, quantity) {
    const cartItemId = `${product.id}__${flavor}__${weight}`;
    const existing = cart.find(item => item.cartItemId === cartItemId);

    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({
        cartItemId,
        id: product.id,
        name: product.name,
        brand: product.brand,
        price: product.price,
        image: product.image,
        flavor: flavor,
        weight: weight,
        quantity: quantity
      });
    }

    saveCartToStorage();
    updateCartUI();
  }

  function updateCartQuantity(cartItemId, delta) {
    const item = cart.find(i => i.cartItemId === cartItemId);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
      cart = cart.filter(i => i.cartItemId !== cartItemId);
    }

    saveCartToStorage();
    updateCartUI();
  }

  function removeCartItem(cartItemId) {
    cart = cart.filter(i => i.cartItemId !== cartItemId);
    saveCartToStorage();
    updateCartUI();
    showToast("Item removed from cart", "info");
  }

  // Update Cart UI & Counters
  function updateCartUI() {
    const totalCount = cart.reduce((sum, i) => sum + i.quantity, 0);

    document.querySelectorAll(".cart-count-badge").forEach(badge => {
      badge.textContent = totalCount;
      badge.classList.toggle("hidden", totalCount === 0);
    });

    const itemsContainer = document.getElementById("cart-drawer-items");
    const emptyMsg = document.getElementById("cart-empty-message");
    const footer = document.getElementById("cart-drawer-footer");

    if (!itemsContainer) return;

    if (cart.length === 0) {
      itemsContainer.innerHTML = "";
      if (emptyMsg) emptyMsg.classList.remove("hidden");
      if (footer) footer.classList.add("hidden");
      return;
    }

    if (emptyMsg) emptyMsg.classList.add("hidden");
    if (footer) footer.classList.remove("hidden");

    itemsContainer.innerHTML = cart.map(item => `
      <div class="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800">
        <div class="w-14 h-14 rounded-lg bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 flex-shrink-0 flex items-center justify-center p-1 overflow-hidden">
          ${item.image ? `<img src="${item.image}" alt="${item.name}" class="w-full h-full object-contain">` : `<span class="text-xs text-neutral-400">NF</span>`}
        </div>
        <div class="flex-grow min-w-0">
          <h4 class="font-bold text-xs text-neutral-900 dark:text-white truncate leading-snug">${item.name}</h4>
          <div class="text-[11px] text-neutral-400 dark:text-neutral-500 mt-0.5 flex items-center gap-1.5">
            <span>${item.flavor}</span>
            <span>•</span>
            <span>${item.weight}</span>
          </div>
          <div class="flex items-center justify-between mt-2">
            <span class="text-neutral-900 dark:text-white font-bold text-sm">₹${(item.price * item.quantity).toLocaleString()}</span>
            <div class="flex items-center border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-950 overflow-hidden">
              <button class="cart-qty-btn px-2 py-0.5 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition text-xs" data-id="${item.cartItemId}" data-delta="-1">-</button>
              <span class="px-2 text-xs font-semibold text-neutral-900 dark:text-white">${item.quantity}</span>
              <button class="cart-qty-btn px-2 py-0.5 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition text-xs" data-id="${item.cartItemId}" data-delta="1">+</button>
            </div>
          </div>
        </div>
        <button class="cart-del-btn text-neutral-400 hover:text-red-600 p-1 transition self-start" data-id="${item.cartItemId}" title="Remove">
          ✕
        </button>
      </div>
    `).join("");

    itemsContainer.querySelectorAll(".cart-qty-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        updateCartQuantity(btn.dataset.id, parseInt(btn.dataset.delta));
      });
    });

    itemsContainer.querySelectorAll(".cart-del-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        removeCartItem(btn.dataset.id);
      });
    });

    const subtotal = cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);
    let discount = 0;
    if (appliedCoupon) {
      discount = Math.round(subtotal * appliedCoupon.discount);
    }
    const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 99;
    const finalTotal = Math.max(0, subtotal - discount + (subtotal > 0 ? shipping : 0));

    document.getElementById("cart-subtotal").textContent = `₹${subtotal.toLocaleString()}`;
    document.getElementById("cart-discount").textContent = `- ₹${discount.toLocaleString()}`;
    document.getElementById("cart-shipping").textContent = shipping === 0 ? "FREE" : `₹${shipping}`;
    document.getElementById("cart-total").textContent = `₹${finalTotal.toLocaleString()}`;

    const shippingProgress = document.getElementById("free-shipping-progress");
    const shippingText = document.getElementById("free-shipping-text");
    if (shippingProgress && shippingText) {
      if (subtotal >= FREE_SHIPPING_THRESHOLD) {
        shippingProgress.style.width = "100%";
        shippingProgress.className = "h-full bg-blue-600 dark:bg-blue-500 rounded-full transition-all duration-300";
        shippingText.innerHTML = `🎉 You unlocked <span class="text-blue-600 dark:text-blue-400 font-semibold">FREE SHIPPING</span>!`;
      } else {
        const pct = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));
        shippingProgress.style.width = `${pct}%`;
        shippingProgress.className = "h-full bg-neutral-900 dark:bg-white rounded-full transition-all duration-300";
        shippingText.innerHTML = `Add <span class="font-bold text-neutral-900 dark:text-white">₹${(FREE_SHIPPING_THRESHOLD - subtotal).toLocaleString()}</span> more for <span class="font-semibold">FREE SHIPPING</span>`;
      }
    }
  }

  function toggleWishlist(productId) {
    const idx = wishlist.indexOf(productId);
    if (idx >= 0) {
      wishlist.splice(idx, 1);
      showToast("Removed from wishlist", "info");
    } else {
      wishlist.push(productId);
      showToast("Saved to wishlist", "success");
    }
    saveWishlistToStorage();
    updateWishlistUI();
    renderProducts();
  }

  function updateWishlistUI() {
    document.querySelectorAll(".wishlist-count-badge").forEach(badge => {
      badge.textContent = wishlist.length;
      badge.classList.toggle("hidden", wishlist.length === 0);
    });
  }

  function renderCheckoutSummary() {
    const summaryList = document.getElementById("checkout-summary-items");
    if (!summaryList) return;

    summaryList.innerHTML = cart.map(item => `
      <div class="flex justify-between items-center text-xs py-1.5 border-b border-neutral-100 dark:border-neutral-800">
        <span class="text-neutral-600 dark:text-neutral-300">${item.name} (${item.flavor}) x${item.quantity}</span>
        <span class="text-neutral-900 dark:text-white font-bold">₹${(item.price * item.quantity).toLocaleString()}</span>
      </div>
    `).join("");

    const subtotal = cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);
    let discount = 0;
    if (appliedCoupon) {
      discount = Math.round(subtotal * appliedCoupon.discount);
    }
    const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 99;
    const finalTotal = subtotal - discount + shipping;

    document.getElementById("checkout-total").textContent = `₹${finalTotal.toLocaleString()}`;
  }

  // ============================================================
  // WHATSAPP REDIRECTION & ORDER DISPATCH ENGINE
  // ============================================================
  function sendOrderToWhatsApp(customerData) {
    if (cart.length === 0) {
      showToast("Your cart is empty!", "error");
      return;
    }

    const ownerPhone = getOwnerWhatsAppNumber();
    const orderId = "NF-" + Math.floor(100000 + Math.random() * 900000);

    const subtotal = cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);
    let discount = 0;
    if (appliedCoupon) {
      discount = Math.round(subtotal * appliedCoupon.discount);
    }
    const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 99;
    const grandTotal = subtotal - discount + shipping;

    // Structured receipt message
    let message = `*NEW ORDER - NUTRITION FIRE*\n`;
    message += `Order ID: ${orderId}\n`;
    message += `───────────────────────\n\n`;

    message += `*CUSTOMER DETAILS:*\n`;
    message += `• Name: ${customerData.name || "Customer"}\n`;
    message += `• Phone: ${customerData.phone || "Not Provided"}\n`;
    if (customerData.address) {
      message += `• Address: ${customerData.address}, ${customerData.city || ""} - ${customerData.pincode || ""}\n`;
    }
    message += `• Payment Method: ${customerData.payment || "UPI / COD"}\n\n`;

    message += `*ORDERED ITEMS (${cart.length} items):*\n`;
    cart.forEach((item, index) => {
      message += `${index + 1}. *${item.name}*\n`;
      message += `   Flavor: ${item.flavor} | Size: ${item.weight}\n`;
      message += `   Qty: ${item.quantity} × ₹${item.price.toLocaleString()} = ₹${(item.price * item.quantity).toLocaleString()}\n`;
    });

    message += `\n───────────────────────\n`;
    message += `Subtotal: ₹${subtotal.toLocaleString()}\n`;
    if (discount > 0) {
      message += `Discount (${appliedCoupon.code}): -₹${discount.toLocaleString()}\n`;
    }
    message += `Shipping: ${shipping === 0 ? "FREE" : "₹" + shipping}\n`;
    message += `*GRAND TOTAL: ₹${grandTotal.toLocaleString()}*\n`;
    message += `───────────────────────\n\n`;
    message += `Please confirm my order and share payment / tracking details. Thank you!`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${ownerPhone}?text=${encodedMessage}`;

    if (window.LightningEngine) {
      window.LightningEngine.triggerSurge();
    }

    const checkoutModal = document.getElementById("checkout-modal");
    if (checkoutModal) checkoutModal.classList.add("hidden");

    const orderSuccessModal = document.getElementById("order-success-modal");
    document.getElementById("order-id-display").textContent = orderId;
    if (orderSuccessModal) orderSuccessModal.classList.remove("hidden");

    window.open(whatsappUrl, "_blank");

    cart = [];
    appliedCoupon = null;
    saveCartToStorage();
    updateCartUI();

    showToast("Redirecting to WhatsApp with order receipt...", "success");
  }

  function showToast(message, type = "info") {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast-item p-3.5 shadow-lg flex items-center gap-3 border ${
      type === "success" ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 border-neutral-800 dark:border-neutral-200" :
      type === "error" ? "bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-900 text-red-700 dark:text-red-300" :
      "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200"
    }`;

    toast.innerHTML = `
      <span class="text-xs font-semibold leading-relaxed">${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(8px)";
      toast.style.transition = "all 0.2s ease";
      setTimeout(() => toast.remove(), 200);
    }, 3200);
  }

  window.App = {
    init: initApp,
    renderProducts,
    updateFilterCounts,
    openQuickView,
    addToCart,
    showToast,
    sendOrderToWhatsApp,
    getOwnerWhatsAppNumber,
    isDeveloperMode,
    setDeveloperMode
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initApp);
  } else {
    initApp();
  }
})();
